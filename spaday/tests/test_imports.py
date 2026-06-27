import subprocess
import sys


def test_import_spaday_does_not_require_the_examples_extra():
    """``import spaday`` must stay light — serve() defers its starlette import, so the core is importable
    without the optional ``examples`` extra. Run in a clean subprocess so the check is independent of what
    other tests have already imported into this process (and holds even when starlette *is* installed)."""
    code = "import sys, spaday; assert 'starlette' not in sys.modules, 'serve() eagerly imported starlette'"
    subprocess.run([sys.executable, "-c", code], check=True)
