"""Run one example for Playwright visual smoke tests."""

import importlib
import sys

import uvicorn


def _app(example: str):
    module = importlib.import_module(f"spaday.examples.{example}")
    if hasattr(module, "create_app"):
        return module.create_app()
    if hasattr(module, "app"):
        return module.app

    from spaday.backends.starlette import serve

    if example == "widget":
        return serve(module.build)
    if example == "devices":
        return serve(lambda: module.panel(module.DEVICES), store=module.DEVICES)
    raise ValueError(f"example {example!r} has no browser entry point")


if __name__ == "__main__":
    uvicorn.run(_app(sys.argv[1]), host="127.0.0.1", port=int(sys.argv[2]), log_level="warning")
