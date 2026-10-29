"""Serve real runtime bundles and a peer with relative imports for browser tests."""

import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import transports
import uvicorn
from pydantic import BaseModel
from starlette.routing import WebSocketRoute

from spaday import AssetPolicy, ComponentPackage, element
from spaday.backends.starlette import serve
from spaday.bootstrap import Lifecycle


class Model(BaseModel):
    label: str = "Wire connected"


if __name__ == "__main__":
    with TemporaryDirectory() as directory:
        peer = Path(directory)
        (peer / "cdn").mkdir()
        (peer / "pkg").mkdir()
        (peer / "cdn/index.js").write_text(
            'import {label} from "../pkg/helper.js";\n'
            'customElements.define("asset-probe", class extends HTMLElement {\n'
            "connectedCallback() { this.textContent = label; }\n"
            "});\n" + "// compression fixture\n" * 100
        )
        (peer / "pkg/helper.js").write_text('export const label = "Peer loaded";\n')
        (peer / "cdn/style.css").write_text('@import "../pkg/theme.css";\n')
        (peer / "pkg/theme.css").write_text("asset-probe { display: block; color: rgb(12, 34, 56); }\n")
        package = ComponentPackage("fixture", peer, (("js", "cdn/index.js"), ("css", "cdn/style.css")))
        session = transports.Session()
        session.host(Model())
        server = transports.Server(session)
        app = serve(
            element("div", element("asset-probe"), element("span").bind("textContent", "label")),
            wire="transports",
            routes=[WebSocketRoute("/ws", transports.ws_endpoint(server))],
            packages=[package],
            prefix="/app",
            tree="frame",
            layout=sys.argv[1],
            lifecycle=Lifecycle() if sys.argv[2] == "managed" else None,
            assets=AssetPolicy(cache="immutable", compression="gzip"),
        )
        config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="warning")
        sock = config.bind_socket()
        print(f"http://127.0.0.1:{sock.getsockname()[1]}/app/", flush=True)
        uvicorn.Server(config).run(sockets=[sock])
