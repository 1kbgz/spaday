"""Real notebook package comm used by browser integration tests."""

import base64
import json
import sys
from pathlib import Path
from unittest.mock import Mock

from spaday import ComponentPackage, Widget, __version__, element
from spaday.actions import NamedJs

if sys.argv[1:] == ["runtime"]:
    assets = Path(__file__).parent / "fixtures" / "runtime_package"
    package = ComponentPackage("uses-runtime", assets, (("js", "index.js"),), requires={"@1kbgz/spaday": f"^{__version__}"})
    widget = Widget(element("button").on("click", NamedJs("probe")), packages=[package])
else:
    widget = Widget(
        element("div", element("wa-input", id="name").bind("value", "name", mode="two-way"), element("wa-button", "Save")),
        state={"name": "Ada"},
        packages=["webawesome"],
    )
sent = []
widget.send = Mock(
    side_effect=lambda content, buffers=(): sent.append({"content": content, "buffers": [base64.b64encode(b).decode() for b in buffers]})
)
try:
    for line in sys.stdin:
        request = json.loads(line)
        if request["op"] == "describe":
            result = {"_tree": widget._tree, "_state": widget._state, "_packages": widget._packages}
        elif request["op"] == "receive":
            widget._msg_callbacks(widget, request["content"], [])
            result = None
        else:
            widget.close()
            result = None
        print(json.dumps({"result": result, "messages": list(sent)}), flush=True)
        sent.clear()
finally:
    widget.close()
