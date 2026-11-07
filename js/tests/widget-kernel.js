import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

export async function widgetKernel(script, args = []) {
  const child = spawn(process.env.SPADAY_TEST_PYTHON ?? "python", [
    script,
    ...args,
  ]);
  const pending = [];
  let errors = "";
  child.stderr.on("data", (chunk) => {
    errors += chunk;
  });
  createInterface({ input: child.stdout }).on("line", (line) => {
    const next = pending.shift();
    try {
      next?.resolve(JSON.parse(line));
    } catch (e) {
      next?.reject(e);
    }
  });
  child.on("exit", () => {
    for (const call of pending.splice(0))
      call.reject(new Error(errors || "Kernel exited"));
  });
  return {
    call(request) {
      return new Promise((resolve, reject) => {
        pending.push({ resolve, reject });
        child.stdin.write(JSON.stringify(request) + "\n");
      });
    },
    close() {
      child.stdin.end();
    },
  };
}
