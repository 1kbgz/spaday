// The gateway example's one irreducible piece of imperative glue, loaded via `serve(scripts=[…])`.
//
// Everything else in the gateway is declarative (form→REST via CallEndpoint(obj({field})), theme via
// bind_root_class + cond, view via a config compute binding). The exception is "Clear": after the server
// empties the 'orders' channel, a Perspective datagrid does NOT repaint an emptied view — the rows are
// gone from the data but linger on screen. So we POST the clear, wait for it to reach each viewer, then
// restore() to force a re-render. This is exactly what the NamedJs escape hatch is for.
//
// The runtime is imported as an EXTERNAL module (the same `/js/dist/esm/index.js` the page bootstrap
// loads), so `registerHandler` registers on the same handler registry the action interpreter reads — not
// a bundled second copy. (esbuild keeps the import via `external` in build.mjs.)
import { registerHandler } from "/js/dist/esm/index.js";

registerHandler("clear-blotter", async () => {
  await fetch("/api/clear", { method: "POST" });
  const ws = document.querySelector("perspective-panel perspective-workspace");
  if (!ws) return;
  for (const v of ws.querySelectorAll("perspective-viewer")) {
    const viewer = v as unknown as {
      getView: () => Promise<{ num_rows: () => Promise<number> }>;
      save: () => Promise<unknown>;
      restore: (c: unknown) => Promise<void>;
    };
    for (
      let i = 0;
      i < 60 && (await (await viewer.getView()).num_rows()) > 0;
      i++
    )
      await new Promise((r) => setTimeout(r, 50)); // wait for the clear to reach this view
    await viewer.restore(await viewer.save()); // re-render from the now-empty view
  }
  const status = document.getElementById("status");
  if (status) status.textContent = "cleared";
});
