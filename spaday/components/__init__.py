"""Typed spaday component bindings generated from Custom Elements Manifests.

:mod:`spaday.components.webawesome` is generated from the WebAwesome manifest by :mod:`spaday.cem`.
Bind another web-component library the same way — run the generator against its
``custom-elements.json``. :class:`~spaday.components.lightweight_charts.LightweightChart` is a wrapper
for an *imperative* library (TradingView lightweight-charts), bound via a hand-authored manifest.
"""

from . import webawesome
from .lightweight_charts import LightweightChart  # noqa: F401  (an imperative-library wrapper)
from .webawesome import *  # noqa: F401,F403  (re-export the generated component classes)
