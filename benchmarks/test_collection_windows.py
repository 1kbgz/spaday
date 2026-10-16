"""Python-authored server windows over real HTTP, including bounded browser rendering."""

import socket
import threading
import time

import pytest
import uvicorn
from playwright.sync_api import expect

from spaday.examples.windowed_collection import app


@pytest.fixture
def window_url():
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        server = uvicorn.Server(uvicorn.Config(app, log_level="error", lifespan="off"))
        thread = threading.Thread(target=server.run, kwargs={"sockets": [listener]}, daemon=True)
        thread.start()
        try:
            deadline = time.monotonic() + 10
            while not server.started:
                if not thread.is_alive() or time.monotonic() > deadline:
                    pytest.fail("window example server failed to start")
                time.sleep(0.01)
            yield f"http://127.0.0.1:{listener.getsockname()[1]}"
        finally:
            server.should_exit = True
            thread.join(timeout=10)


def test_server_window_round_trip(benchmark, runtime_page, window_url):
    page = runtime_page.context.browser.new_page()
    responses = []
    page.on("response", lambda response: responses.append(response) if response.url.endswith("/records") else None)
    try:
        page.goto(window_url)
        rows = page.locator("spa-each spa-row")
        expect(rows).to_have_count(16)
        expect(rows.first).to_contain_text("Record 0")

        def setup():
            page.locator("spa-each").evaluate("(el) => { el.scrollTop = 0; }")
            expect(rows.first).to_contain_text("Record 0")

        def scroll():
            page.locator("spa-each").evaluate("(el) => { el.scrollTop = 1600000; }")
            expect(rows).to_have_count(20)
            expect(rows.first).to_contain_text("Record 49996")
            assert page.locator("spa-each").evaluate("(el) => el.scrollTop") == 1600000

        benchmark.pedantic(scroll, setup=setup, rounds=3, iterations=1)
        payloads = [response.json() for response in responses]
        assert all(len(payload["items"]) <= 20 for payload in payloads)
        benchmark.extra_info.update(total_records=100000, max_window_records=max(len(p["items"]) for p in payloads))
    finally:
        page.close()
