"""Server-side rendering + hydration (Phase 3.5), with per-component theming (Phase 3.4).

The server renders the component tree to **light-DOM HTML** with :func:`spaday.render_html` and ships it
in the page body, so the structure and text paint immediately (view source — it's all there, no empty
``<div id="app">``). The browser then **hydrates**: the web components upgrade and the runtime adopts the
existing elements, attaching the button's action and the two-way input binding instead of rebuilding the
tree. Theming is authored in Python — ``App().css(...)`` re-themes the whole shell via its ``--spa-*``
tokens, and a component's own ``.css()`` sets its CSS custom properties.

Run: ``python -m spaday.examples.ssr`` then open http://127.0.0.1:8005/ (and view source to see the SSR'd
markup the browser hydrates).
"""

import json
from pathlib import Path

import uvicorn
from starlette.applications import Starlette
from starlette.responses import HTMLResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles

from spaday import element, render_html
from spaday.actions import Toggle, by_id
from spaday.components.shell import App, Body, Main, Nav, Row, Stack
from spaday.components.webawesome import WaButton

HERE = Path(__file__).parent
JS = HERE.parent.parent / "js"


def build_tree():
    """The UI: SSR'd structure, with behavior (an action + two-way binding) attached on hydrate."""
    return (
        App()
        .css(spa_surface="#0f172a", spa_surface_2="#1e293b", spa_border="#334155", spa_muted="#94a3b8")  # retheme the shell
        .style(color="#e2e8f0", min_height="100vh")
        .child(Nav().child(element("strong").text("spaday SSR — server-rendered, then hydrated")))
        .child(
            Body().child(
                Main().child(
                    Stack()
                    .child(element("p").text("This markup was rendered on the server (view source). Behavior attaches on hydrate."))
                    .child(
                        Row().child(
                            WaButton(variant="brand")
                            .text("Toggle details")
                            .css(background_color="#6366f1")
                            .on("click", Toggle(by_id("info"), "hidden"))
                        )
                    )
                    .child(
                        element("div", id="info")
                        .style(padding="0.75rem", background="#1e293b", border_radius="8px")
                        .text("Hidden until you click — the action was attached during hydration, not in the HTML.")
                    )
                    .child(
                        Row()
                        .child(element("label").text("Name"))
                        .child(element("input", id="name", type="text").bind("value", "name", mode="two-way"))
                    )
                    .child(Row().child(element("span").text("Echo: ")).child(element("strong").bind("textContent", "name")))
                )
            )
        )
    )


PAGE = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>spaday — SSR + hydration</title>
  </head>
  <body>
    <div id="app">{ssr}</div>
    <script type="application/json" id="tree">{tree}</script>
    <script type="module">
      import {{ hydrate, init, Store }} from "/js/dist/esm/index.js";
      await init({{ module_or_path: "/js/dist/pkg/spaday_bg.wasm" }});
      const tree = JSON.parse(document.getElementById("tree").textContent);
      const store = new Store();
      store.set("name", "world"); // seed the bound state; hydrate writes it onto the live input + echo
      hydrate(document.getElementById("app"), tree, store);
    </script>
  </body>
</html>"""


async def homepage(_request):
    node = build_tree().to_node()
    return HTMLResponse(PAGE.format(ssr=render_html(node), tree=json.dumps(node)))


app = Starlette(routes=[Route("/", homepage), Mount("/js", StaticFiles(directory=JS))])


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8005)
