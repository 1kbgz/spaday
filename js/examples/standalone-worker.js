import { EXAMPLES } from "./standalone-examples.js";

const params = new URL(self.location.href).searchParams;
const exampleName = params.get("example") || "webawesome-navigation";
const config = EXAMPLES[exampleName];
const PYODIDE_VERSION = "314.0.4";
let pyodide;

async function wheelIndex() {
  const response = await fetch(
    new URL("../../pypi/all.json", self.location.href),
  );
  if (!response.ok) throw new Error(`wheel index returned ${response.status}`);
  return response.json();
}

function wheelUrl(index, name) {
  const distribution = index[name] || index[name.replaceAll("-", "_")];
  if (!distribution) return name;
  const wheel = Object.values(distribution.releases)
    .flat()
    .find((file) => file.filename.endsWith(".whl"));
  if (!wheel) return name;
  return new URL(`../../pypi/${wheel.filename}`, self.location.href).href;
}

const ready = (async () => {
  if (!config) throw new Error(`unknown example: ${exampleName}`);
  self.postMessage({ type: "status", message: "Loading Pyodide…" });
  const { loadPyodide } = await import(
    `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`
  );
  pyodide = await loadPyodide();
  await pyodide.loadPackage(["micropip", "anyio"]);

  self.postMessage({ type: "status", message: "Installing example…" });
  const index = await wheelIndex();
  const wheels = [wheelUrl(index, "spaday")];
  for (const distribution of config.distributions || []) {
    wheels.push(wheelUrl(index, distribution));
  }
  wheels.push(...(config.requirements || []));
  pyodide.globals.set("requirements_json", JSON.stringify(wheels));
  pyodide.globals.set("config_json", JSON.stringify(config));
  return pyodide.runPythonAsync(`
import json
import micropip
from importlib import import_module

await micropip.install(json.loads(requirements_json))
config = json.loads(config_json)
module = import_module(config["module"])
tree = getattr(module, config.get("treeAttribute", "build_page"))
if callable(tree):
    tree = tree()

state = dict(config.get("state", {}))
state_attribute = config.get("stateAttribute")
if state_attribute:
    state.update(getattr(module, state_attribute))

style = getattr(module, config.get("styleAttribute", "STYLE"), "")
server = getattr(module, "server", None)
connection = "browser"

def local_wires(messages):
    if server is None:
        return []
    return list(messages.get(connection, []))

def receive_wire(frame):
    return json.dumps(local_wires(server.recv(connection, frame)))

def flush_server():
    return json.dumps(local_wires(server.flush()))

opening = server.open(connection, "json") if server is not None else []

json.dumps({
    "tree": tree.to_node(),
    "state": state,
    "style": style,
    "wires": opening,
    "localServer": server is not None,
})
`);
})();

let queue = Promise.resolve();

async function handle(message) {
  const snapshot = await ready;
  if (message.type === "start") {
    self.postMessage({ type: "snapshot", payload: JSON.parse(snapshot) });
  } else if (message.type === "wire") {
    pyodide.globals.set("wire_frame", message.frame);
    const wires = JSON.parse(pyodide.runPython("receive_wire(wire_frame)"));
    if (wires.length) self.postMessage({ type: "wires", wires });
  } else if (message.type === "flush") {
    const wires = JSON.parse(pyodide.runPython("flush_server()"));
    if (wires.length) self.postMessage({ type: "wires", wires });
  }
}

self.addEventListener("message", (event) => {
  queue = queue
    .then(() => handle(event.data))
    .catch((error) => {
      self.postMessage({ type: "error", message: String(error) });
    });
});
