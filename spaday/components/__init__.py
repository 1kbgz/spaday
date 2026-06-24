"""Typed spaday component bindings generated from Custom Elements Manifests.

:mod:`spaday.components.webawesome` is generated from the WebAwesome manifest by :mod:`spaday.cem`.
Bind another web-component library the same way — run the generator against its
``custom-elements.json``. :class:`~spaday.components.lightweight_charts.LightweightChart` is a wrapper
for an *imperative* library (TradingView lightweight-charts), bound via a hand-authored manifest.
:mod:`spaday.components.shell` adds spaday's own high-level layout components (``spa-*``).
"""

from . import shell, webawesome
from .form import FormField, form  # noqa: F401  (form-from-schema generator + per-field overrides)
from .lightweight_charts import LightweightChart  # noqa: F401  (an imperative-library wrapper)
from .shell import *  # noqa: F401,F403  (high-level layout/shell components)
from .webawesome import *  # noqa: F401,F403  (re-export the generated component classes)
