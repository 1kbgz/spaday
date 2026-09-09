"""Theming reference for spaday.

Theming is authored on any component with :meth:`~spaday.component.Component.css` (CSS custom
properties — the theme knobs), :meth:`~spaday.component.Component.style` (inline declarations), and
:meth:`~spaday.component.Component.classes` (variant/state classes). There is no separate theme object;
a custom property set on a container cascades, so an **app-level** theme is just ``.css(...)`` on the
``App`` root.

``SHELL_TOKENS`` documents the ``spa-*`` shell's own override tokens (the ``css()`` kwarg → the CSS
custom property it drives and what it controls). The shell ships neutral **light and dark** defaults —
the dark palette is keyed off WebAwesome's ``wa-dark`` class (with ``wa-light`` flipping a nested
island back), so ``App(...).bind_root_class("wa-dark", "dark")`` alone re-themes the whole page. Both
palettes are emitted at zero specificity, so an application or component package overrides them by
mapping its own theme onto these variables::

    from spaday.components.shell import App
    App().css(spa_surface="#111", spa_border="#333", spa_muted="#999")  # retheme the whole shell

Component packages
------------------

Every token of every component is set the same way — ``css()`` takes **arbitrary** custom properties,
so a third-party design system's own tokens are authored from Python without a stylesheet::

    App().css(wa_color_surface_default="#111")  # --wa-color-surface-default

A spaday component package names its own tokens ``--spa-<package>-<thing>`` (see
:func:`package_token`) and chains each one to the shell token it belongs to, so three layers apply in
order — the package's token, then the shell's, then a literal that keeps a standalone page coherent::

    fill: var(--spa-dagre-node-fill, var(--spa-surface-2, #fafafa));

An app therefore re-themes every package at once by setting the shell tokens, or re-themes one
package without touching the others by setting its ``--spa-<package>-*`` tokens. Each package
publishes a ``TOKENS`` mapping in this module's :data:`SHELL_TOKENS` shape listing what it exposes.
"""

#: ``css()`` kwarg → (CSS custom property, what it controls). The shell reads these (see ``js shell.ts``).
SHELL_TOKENS = {
    "spa_surface": ("--spa-surface", "nav / footer / app surface color"),
    "spa_surface_2": ("--spa-surface-2", "gutter / toolbar surface color"),
    "spa_border": ("--spa-border", "shell border color"),
    "spa_muted": ("--spa-muted", "footer / muted text color"),
    "spa_accent": ("--spa-accent", "emphasis / hover / selection color"),
    "spa_info": ("--spa-info", "info tone (Toast, component packages)"),
    "spa_success": ("--spa-success", "success tone (Toast, component packages)"),
    "spa_warning": ("--spa-warning", "warning tone (component packages)"),
    "spa_danger": ("--spa-danger", "danger tone (Toast, component packages)"),
    "spa_gap": ("--spa-gap", "default gap between shell children"),
    "spa_align": ("--spa-align", "cross-axis alignment for Stack / Row / Toolbar"),
    "spa_justify": ("--spa-justify", "main-axis justification for Row"),
    "spa_gutter_width": ("--spa-gutter-width", "Gutter width"),
}

#: The prefix a component package's own tokens use: ``--spa-<package>-<thing>``.
PACKAGE_TOKEN_PREFIX = "--spa-"


def package_token(package: str, name: str) -> str:
    """The CSS custom property a component package exposes for one themeable thing.

    ``package_token("dagre", "node-fill")`` → ``"--spa-dagre-node-fill"``. Packages publish their
    own ``TOKENS`` mapping in the same shape as :data:`SHELL_TOKENS`; this is the naming rule those
    mappings follow.
    """
    return f"{PACKAGE_TOKEN_PREFIX}{package}-{name}"
