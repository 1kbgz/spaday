"""Run real worker processes and a dedicated broker for the deployment browser test."""

import json
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.request import urlopen


def port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def stop(process):
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()


with TemporaryDirectory(prefix="spaday-deployment-") as directory:
    front, back = port(), port()
    env = {**os.environ, "SPADAY_STATE_DIR": directory, "SPADAY_BUS_FRONT": f"tcp://127.0.0.1:{front}", "SPADAY_BUS_BACK": f"tcp://127.0.0.1:{back}"}
    broker_log = open(Path(directory) / "broker.log", "w+")
    broker = subprocess.Popen(
        [sys.executable, "-m", "transports.backplane", env["SPADAY_BUS_FRONT"], env["SPADAY_BUS_BACK"]],
        stdout=broker_log,
        stderr=subprocess.STDOUT,
        env=env,
    )
    workers = {}
    ports = {}
    logs = []
    try:
        for _ in range(100):
            try:
                with socket.create_connection(("127.0.0.1", back), timeout=0.1):
                    break
            except OSError:
                time.sleep(0.05)
        else:
            raise RuntimeError("broker failed to start")
        for line in sys.stdin:
            request = json.loads(line)
            try:
                name = request["worker"]
                if request["op"] == "stop":
                    stop(workers.pop(name))
                    result = {"stopped": name}
                else:
                    if name in workers:
                        raise ValueError("worker already started")
                    ports.setdefault(name, port())
                    log = open(Path(directory) / f"{name}.log", "w+")
                    logs.append(log)
                    process = subprocess.Popen(
                        [
                            sys.executable,
                            "-m",
                            "uvicorn",
                            "spaday.examples.shared_deployment:create_app",
                            "--factory",
                            "--host",
                            "127.0.0.1",
                            "--port",
                            str(ports[name]),
                        ],
                        env={**env, "SPADAY_WORKER": name, "SPADAY_CODEC": sys.argv[1]},
                        stdout=log,
                        stderr=subprocess.STDOUT,
                    )
                    workers[name] = process
                    url = f"http://127.0.0.1:{ports[name]}"
                    for _ in range(200):
                        if process.poll() is not None:
                            break
                        try:
                            with urlopen(url + "/alice", timeout=0.2) as response:
                                if response.status == 200:
                                    break
                        except OSError:
                            time.sleep(0.05)
                    else:
                        raise RuntimeError(f"worker {name} startup timed out")
                    if process.poll() is not None:
                        log.seek(0)
                        raise RuntimeError(log.read())
                    result = {"url": url}
                print(json.dumps(result), flush=True)
            except Exception as exc:
                print(json.dumps({"error": str(exc)}), flush=True)
    finally:
        for process in workers.values():
            stop(process)
        stop(broker)
        for log in logs:
            log.close()
        broker_log.close()
