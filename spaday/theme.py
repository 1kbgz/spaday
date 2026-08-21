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
"""

#: ``css()`` kwarg → (CSS custom property, what it controls). The shell reads these (see ``js shell.ts``).
SHELL_TOKENS = {
    "spa_surface": ("--spa-surface", "nav / footer / app surface color"),
    "spa_surface_2": ("--spa-surface-2", "gutter / toolbar surface color"),
    "spa_border": ("--spa-border", "shell border color"),
    "spa_muted": ("--spa-muted", "footer / muted text color"),
    "spa_gap": ("--spa-gap", "default gap between shell children"),
    "spa_align": ("--spa-align", "cross-axis alignment for Stack / Row / Toolbar"),
    "spa_justify": ("--spa-justify", "main-axis justification for Row"),
    "spa_gutter_width": ("--spa-gutter-width", "Gutter width"),
}
