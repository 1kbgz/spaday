"""Typed spaday component bindings generated from Custom Elements Manifests.

:mod:`spaday.components.webawesome` is generated from the WebAwesome manifest by :mod:`spaday.cem`.
Bind another web-component library the same way — run the generator against its
``custom-elements.json``. :class:`~spaday.components.lightweight_charts.LightweightChart` is a wrapper
for an *imperative* library (TradingView lightweight-charts), bound via a hand-authored manifest.
:mod:`spaday.components.shell` adds spaday's own high-level layout components (``spa-*``).
"""

from . import shell, webawesome
from .form import FormField, form
from .lightweight_charts import LightweightChart
from .shell import *
from .webawesome import *
