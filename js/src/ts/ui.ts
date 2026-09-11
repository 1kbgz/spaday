// The native baseline for spaday's generic controls (`spaday.ui`, resolved by the `native` design):
// plain `<button>` / `<input>` / `<select>` / `<dialog>` elements marked with `data-ui`, styled from
// the `--spa-*` shell palette so they follow the page mode and any app-level theme. A design-system
// package replaces these with its own elements; this is what an app gets with none installed, and
// the reference every realization is checked against.

const BORDER = "var(--spa-border, #e6e6e6)";
const SURFACE = "var(--spa-surface, #fff)";
const MUTED = "var(--spa-muted, #666)";

export const UI_CSS = `[data-ui]{box-sizing:border-box;font:inherit;color:inherit}
[data-ui=button]{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;padding:.45rem .9rem;border:1px solid ${BORDER};border-radius:8px;background:${SURFACE};cursor:pointer;line-height:1.2}
[data-ui=button][data-size=sm]{padding:.3rem .6rem;font-size:.85em}
[data-ui=button][data-size=lg]{padding:.6rem 1.2rem;font-size:1.1em}
[data-ui=button][data-intent=primary]{--ui-tone:var(--spa-accent, #4a90d9)}
[data-ui=button][data-intent=info]{--ui-tone:var(--spa-info, #1565c0)}
[data-ui=button][data-intent=success]{--ui-tone:var(--spa-success, #2e7d32)}
[data-ui=button][data-intent=warning]{--ui-tone:var(--spa-warning, #9a6700)}
[data-ui=button][data-intent=danger]{--ui-tone:var(--spa-danger, #c62828)}
[data-ui=button][data-intent]:not([data-intent=neutral]){background:var(--ui-tone);border-color:var(--ui-tone);color:#fff}
[data-ui=button][data-appearance=outline]{background:transparent;color:var(--ui-tone, inherit);border-color:var(--ui-tone, ${BORDER})}
[data-ui=button][data-appearance=plain]{background:transparent;border-color:transparent;color:var(--ui-tone, inherit)}
[data-ui=button]:hover:not(:disabled){filter:brightness(.95)}
[data-ui=button]:disabled{opacity:.5;cursor:default}
[data-ui=field]{display:flex;flex-direction:column;gap:.3rem;font-size:.95rem}
[data-ui=field][data-inline]{flex-direction:row;align-items:center;gap:.5rem}
[data-ui=label]{font-weight:600}
[data-ui=help]{color:${MUTED};font-size:.8rem}
[data-ui=error]{color:var(--spa-danger, #c62828);font-size:.8rem}
[data-ui=input],[data-ui=select]{padding:.45rem .6rem;border:1px solid ${BORDER};border-radius:8px;background:${SURFACE}}
[data-ui=input][data-size=sm],[data-ui=select][data-size=sm]{padding:.3rem .5rem;font-size:.85em}
[data-ui=input][data-size=lg],[data-ui=select][data-size=lg]{padding:.6rem .8rem;font-size:1.1em}
[data-ui=input][data-invalid],[data-ui=select][data-invalid]{border-color:var(--spa-danger, #c62828)}
[data-ui=input]:focus-visible,[data-ui=select]:focus-visible,[data-ui=button]:focus-visible{outline:2px solid var(--spa-accent, #4a90d9);outline-offset:1px}
[data-ui=checkbox]{width:1rem;height:1rem;margin:0;accent-color:var(--spa-accent, #4a90d9)}
[data-ui=switch]{appearance:none;width:2.2rem;height:1.2rem;margin:0;border-radius:1rem;background:${BORDER};position:relative;cursor:pointer;transition:background .15s}
[data-ui=switch]::before{content:"";position:absolute;top:.15rem;left:.15rem;width:.9rem;height:.9rem;border-radius:50%;background:${SURFACE};transition:left .15s}
[data-ui=switch]:checked{background:var(--spa-accent, #4a90d9)}
[data-ui=switch]:checked::before{left:1.15rem}
[data-ui=checkbox]:disabled,[data-ui=switch]:disabled{opacity:.5;cursor:default}
[data-ui=dialog]{min-width:20rem;max-width:90vw;padding:1.25rem;border:1px solid ${BORDER};border-radius:12px;background:${SURFACE};box-shadow:0 12px 40px rgba(0,0,0,.25)}
[data-ui=dialog]::backdrop{background:rgba(0,0,0,.4)}
[data-ui=title]{margin:0 0 .75rem;font-size:1.1rem;font-weight:600}`;

if (
  typeof document !== "undefined" &&
  !document.querySelector("style[data-spaday-ui]")
) {
  const style = document.createElement("style");
  style.setAttribute("data-spaday-ui", "");
  style.textContent = UI_CSS;
  document.head.append(style);
}
