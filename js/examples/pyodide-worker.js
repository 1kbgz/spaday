const PYODIDE_VERSION = "314.0.4";
const wheel = new URL(self.location.href).searchParams.get("wheel") || "spaday";

const ready = (async () => {
  self.postMessage({ type: "status", message: "Loading Pyodide…" });
  const { loadPyodide } = await import(
    `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`
  );
  const pyodide = await loadPyodide();
  self.postMessage({ type: "status", message: "Installing spaday…" });
  await pyodide.loadPackage("micropip");
  pyodide.globals.set("wheel", wheel);
  await pyodide.runPythonAsync(`
import micropip
await micropip.install([wheel, "transports==0.7.0"])

from spaday.examples.pyodide import app
`);
  self.postMessage({ type: "status", message: "Starting Python app…" });
  return pyodide;
})();

self.addEventListener("message", async (event) => {
  try {
    const pyodide = await ready;
    if (event.data.type === "start") {
      self.postMessage(JSON.parse(pyodide.runPython("app.start_json()")));
      return;
    }
    pyodide.globals.set("intent_json", JSON.stringify(event.data));
    self.postMessage(JSON.parse(pyodide.runPython("app.dispatch_json(intent_json)")));
  } catch (error) {
    self.postMessage({ type: "error", message: String(error) });
  }
});
