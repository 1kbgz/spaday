"""Theming reference for spaday.

Theming is authored on any component with :meth:`~spaday.component.Component.css` (CSS custom
properties — the theme knobs), :meth:`~spaday.component.Component.style` (inline declarations), and
:meth:`~spaday.component.Component.classes` (variant/state classes). There is no separate theme object;
a custom property set on a container cascades, so an **app-level** theme is just ``.css(...)`` on the
``App`` root.

``SHELL_TOKENS`` documents the ``spa-*`` shell's own override tokens (the ``css()`` kwarg → the CSS
custom property it drives and what it controls). Each falls back to a WebAwesome ``--wa-color-*`` token,
so the shell follows the active WebAwesome theme unless overridden::

    from spaday.components.shell import App
    App().css(spa_surface="#111", spa_border="#333", spa_muted="#999")  # retheme the whole shell
    WaButton(...).css(background_color="navy")  # a single component's own --background-color token
"""

#: ``css()`` kwarg → (CSS custom property, what it controls). The shell reads these (see ``js shell.ts``).
SHELL_TOKENS = {
    "spa_surface": ("--spa-surface", "nav / footer / app surface color (← --wa-color-surface-default)"),
    "spa_surface_2": ("--spa-surface-2", "gutter / toolbar surface color (← --wa-color-surface-lowered)"),
    "spa_border": ("--spa-border", "shell border color (← --wa-color-surface-border)"),
    "spa_muted": ("--spa-muted", "footer / muted text color (← --wa-color-text-quiet)"),
    "spa_gap": ("--spa-gap", "default gap between shell children"),
    "spa_align": ("--spa-align", "cross-axis alignment for Stack / Row / Toolbar"),
    "spa_justify": ("--spa-justify", "main-axis justification for Row"),
    "spa_gutter_width": ("--spa-gutter-width", "Gutter width"),
}

#: WebAwesome design-token prefix; its ``--wa-color-*`` / ``--wa-space-*`` tokens are set via ``css()`` too.
WA_TOKEN_PREFIX = "--wa-"
