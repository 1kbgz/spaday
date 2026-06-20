from .cem import generate
from .component import Component
from .spaday import apply, diff, parse_cem  # compiled Rust extension (rust/python)

__version__ = "0.1.0"

__all__ = [
    "__version__",
    # component-tree diff/patch (compiled core)
    "diff",
    "apply",
    # CEM binding generator
    "parse_cem",
    "generate",
    "Component",
]
