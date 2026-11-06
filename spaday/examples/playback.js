class SampleWaveform extends HTMLElement {
  #data = new Uint8Array();
  #position = 0;
  #canvas = document.createElement("canvas");
  #summary = document.createElement("p");
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    this.#canvas.width = 800;
    this.#canvas.height = 180;
    this.#canvas.style.cssText = "width:100%;background:white;border:1px solid #b9c9d6";
    const button = document.createElement("button");
    button.textContent = "Invert sample";
    button.style.cssText = "font:inherit;padding:.5rem";
    button.onclick = () => {
      const bytes = this.#data.slice();
      const samples = new DataView(bytes.buffer);
      for (let offset = 0; offset < bytes.length; offset += 4)
        samples.setFloat32(offset, -samples.getFloat32(offset, true), true);
      this.data = bytes;
      this.dispatchEvent(new Event("sample-change", { bubbles: true }));
    };
    root.append(this.#canvas, this.#summary, button);
  }
  get data() {
    return this.#data;
  }
  set data(value) {
    if (!(value instanceof Uint8Array)) return;
    this.#data = value;
    this.#summary.textContent = `${value.byteLength} bytes / ${value.byteLength / 4} float32 samples`;
    this.draw();
  }
  get position() {
    return this.#position;
  }
  set position(value) {
    this.#position = Number(value) || 0;
    this.draw();
  }
  draw() {
    const ctx = this.#canvas.getContext("2d");
    ctx.clearRect(0, 0, 800, 180);
    const samples = new DataView(this.#data.buffer, this.#data.byteOffset, this.#data.byteLength);
    ctx.strokeStyle = "#246c91";
    ctx.beginPath();
    for (let index = 0; index < samples.byteLength / 4; index++) {
      const x = (index / Math.max(1, samples.byteLength / 4 - 1)) * 800;
      const y = 90 - samples.getFloat32(index * 4, true) * 70;
      if (index) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = "#b54c32";
    ctx.beginPath();
    ctx.moveTo((this.#position % 4) * 200, 0);
    ctx.lineTo((this.#position % 4) * 200, 180);
    ctx.stroke();
  }
}
customElements.define("sample-waveform", SampleWaveform);

document.addEventListener("spaday:wire-client", ({ detail: { client, link, store } }) => {
  let last = performance.now();
  const offOwner = client.onOwnership((grant) => {
    if (grant.id === link.modelId) store.set("owner", grant.owned);
  });
  const offDisconnect = client.onDisconnect(() => store.set("owner", false));
  const offCommand = client.onCommand((command) => {
    if (command.id !== link.modelId) return;
    // This example's commands set status. Other applications can interpret action payloads here.
    const value = Object.values(command.value)[0];
    store.set(command.field, value);
    client.ackCommand(command);
  });
  const timer = setInterval(() => {
    const now = performance.now();
    if (store.get("owner") && store.get("playing"))
      store.set(
        "position",
        Number(store.get("position")) + ((now - last) / 60000) * Number(store.get("bpm")),
      );
    last = now;
  }, 40);
  window.addEventListener(
    "pagehide",
    () => {
      clearInterval(timer);
      offOwner();
      offDisconnect();
      offCommand();
    },
    { once: true },
  );
});
