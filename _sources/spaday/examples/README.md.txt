# spaday example

One omnibus app showing the whole stack — authored in typed Python, rendered by the spaday runtime,
with **transports** as the live wire.

- **Shell layout** — the page is composed from `spa-*` shell components (`spaday.components.shell`:
  `App` / `Nav` / `Body` / `Gutter` / `Main` / `Footer`, with `Stack` / `Row` / `Toolbar`), not raw divs.
- **Action DSL (client-side)** — controls carry declarative actions (`Component.on` + `spaday.actions`)
  interpreted in the browser: Toggle, SetProp bound to the event value, Sequence, and buttons that
  switch a chart's series type. No event listeners are written, and the server is never called for these.
- **transports (server-authoritative, multi-tenant)** — two live charts mirror Python models over
  `@1kbgz/transports`: a **global** model (shared `transports.Server`) syncs to every browser; a
  **per-session** model (`transports.Hub`) is private to each tab. Control changes are edits applied on
  the server and fanned to clients.

## Run

```bash
pip install transports                       # the Python wire (also: starlette, uvicorn, websockets)
cd js && pnpm install && pnpm build && cd .. # builds js/dist; pulls @1kbgz/transports + webawesome
python -m spaday.examples                    # -> http://127.0.0.1:8000
```

Open it in two tabs: changing the **global** chart in one tab updates both; the **per-session** chart
is independent per tab.

## How it maps to the architecture

- `__main__.py` authors the page (shell + controls + actions) and hosts two `Chart` models on transports
  (`Session`/`Server`, plus a `Hub` for per-session). It serves the page, the authored tree
  (`/tree.json`), the websockets (`/ws`, `/ws/session`), and the `js/` bundles.
- `index.html` mounts the tree — which wires the action DSL automatically — and adds the only
  hand-written glue: the two transports charts' control→edit listeners. That glue is what a future
  `SendPatch` action will make declarative; the action DSL already removed it for the client-side card.

## Notes

- **Client-side vs round-trip**: the DSL card runs entirely in the browser; the transports cards
  round-trip edits to the server (authoritative) and fan patches to every client.
- **Wholesale data patches**: a chart's series is one opaque prop, so each change resends `data`
  (correct, not minimal); per-point deltas need the series modeled as tree state — later.
- **TradingView logo** is disabled in the chart wrapper; attribution is in the page footer.
