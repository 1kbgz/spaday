// spaday's high-level layout/shell primitives. These are the "higher altitude" authoring
// surface: instead of building layout from raw `div`s, you compose real `spa-*` web components whose
// layout (flex/grid, spacing, surfaces) is encapsulated in shadow DOM. Each is a thin custom element
// with one default `<slot>` and a `:host` style; structure comes from how you nest them
// (App › Nav / Body › Gutter + Main / Footer), spacing from Stack/Row/Toolbar.
//
// Surfaces/borders/muted-text use `--spa-*` tokens with plain defaults. Component packages can map
// their theme tokens onto these variables. A few layout attributes — `gap` / `align` / `justify` /
// `width` — map to the corresponding CSS custom properties. Importing this module (side effect, via
// the runtime entry) defines the elements.

const BORDER = "var(--spa-border, #e6e6e6)";
const SURFACE = "var(--spa-surface, #fff)";
const SURFACE_2 = "var(--spa-surface-2, #fafafa)";
const MUTED = "var(--spa-muted, #666)";

// The shell's own two palettes, keyed off WebAwesome's mode classes so
// `App(...).bind_root_class("wa-dark", "dark")` alone re-themes the whole page. Custom properties
// inherit through shadow boundaries, so one document-level rule reaches every `:host` style above.
// `:where()` keeps specificity at zero: any application rule (or inline `.css(...)`) wins. The
// explicit `.wa-light` values make a nested light island inside a dark page flip back.
const THEME_CSS = `:where(.wa-dark) {
  --spa-surface: #15191e;
  --spa-surface-2: #1d232b;
  --spa-border: #333b45;
  --spa-muted: #9aa3ad;
}
:where(.wa-light) {
  --spa-surface: #fff;
  --spa-surface-2: #fafafa;
  --spa-border: #e6e6e6;
  --spa-muted: #666;
}`;

/** tag → the element's `:host` layout style. Each gets a shadow root with this style + a default slot. */
const SHELL: Record<string, string> = {
  // page frame: nav (top) / body (fills) / footer (bottom), stacked
  "spa-app": ":host{display:flex;flex-direction:column;min-height:100vh}",
  // top app bar
  "spa-nav": `:host{display:flex;align-items:center;gap:var(--spa-gap, 1rem);padding:.75rem 1.25rem;border-bottom:1px solid ${BORDER};background:${SURFACE}}`,
  // middle region: gutters + main, side by side
  "spa-body": ":host{display:flex;flex:1;min-height:0}",
  // a sidebar; place before or after main to get a left/right gutter
  "spa-gutter": `:host{display:flex;flex-direction:column;gap:var(--spa-gap, .5rem);flex:none;width:var(--spa-gutter-width, 220px);padding:1rem;border-right:1px solid ${BORDER};background:${SURFACE_2}}`,
  // primary content region
  "spa-main":
    ":host{display:block;flex:1;min-width:0;padding:1.5rem;overflow:auto}",
  // bottom bar
  "spa-footer": `:host{padding:.6rem 1.25rem;border-top:1px solid ${BORDER};background:${SURFACE};font-size:.8rem;color:${MUTED}}`,
  // generic vertical group
  "spa-stack":
    ":host{display:flex;flex-direction:column;gap:var(--spa-gap, .75rem);align-items:var(--spa-align, stretch)}",
  // generic horizontal group
  "spa-row":
    ":host{display:flex;align-items:var(--spa-align, center);justify-content:var(--spa-justify, flex-start);gap:var(--spa-gap, 1rem)}",
  // a contained strip of actions/controls
  "spa-toolbar": `:host{display:flex;align-items:var(--spa-align, center);gap:var(--spa-gap, .5rem);padding:.5rem .6rem;background:${SURFACE_2};border:1px solid ${BORDER};border-radius:8px}`,
};

/** The shell element tags, defined on import. */
export const SHELL_TAGS = Object.keys(SHELL);

// Layout attributes → the CSS custom property they drive. Setting e.g. `gap="2rem"` on a shell element
// sets `--spa-gap` on its host, which the `:host` style above reads (an element ignores vars it doesn't
// use, so the same set is safe on every tag).
const ATTR_VARS: Record<string, string> = {
  gap: "--spa-gap",
  align: "--spa-align",
  justify: "--spa-justify",
  width: "--spa-gutter-width",
};

// Guard so importing the runtime in a non-DOM context (e.g. the test runner / SSR in node) is a no-op
// rather than touching `customElements`/`HTMLElement`, which only exist in the browser.
if (typeof customElements !== "undefined") {
  if (!document.querySelector("style[data-spaday-shell-theme]")) {
    const theme = document.createElement("style");
    theme.setAttribute("data-spaday-shell-theme", "");
    theme.textContent = THEME_CSS;
    document.head.append(theme);
  }
  for (const [tag, css] of Object.entries(SHELL)) {
    if (customElements.get(tag)) continue;
    customElements.define(
      tag,
      class extends HTMLElement {
        static get observedAttributes(): string[] {
          return Object.keys(ATTR_VARS);
        }
        constructor() {
          super();
          const root = this.attachShadow({ mode: "open" });
          const style = document.createElement("style");
          style.textContent = css;
          root.append(style, document.createElement("slot"));
        }
        attributeChangedCallback(
          name: string,
          _old: string | null,
          value: string | null,
        ): void {
          const prop = ATTR_VARS[name];
          if (!prop) return;
          if (value == null) this.style.removeProperty(prop);
          else this.style.setProperty(prop, value);
        }
      },
    );
  }
}

// A lightweight data table (`spa-table`): renders `rows` (a list of objects) under `columns`, both set as
// JS properties — so a bound / computed `rows` re-renders reactively. Scalar cells are text (built with
// createElement, never innerHTML); component-valued static cells are ordinary light-DOM children
// projected into their cell through a named slot. `rowKey` opts into keyed row/cell reconciliation;
// without it, updates retain the original full-render behavior. Not a virtual-scroll grid; a themed
// `<table>` for modest data.
const TABLE_CSS = `:host{display:block;overflow:auto}
table{border-collapse:collapse;width:100%;font-size:.9rem;color:inherit}
th,td{text-align:left;padding:.4rem .65rem;border-bottom:1px solid ${BORDER};white-space:nowrap}
thead th{background:${SURFACE_2};font-weight:600;position:sticky;top:0}
tbody tr:hover td{background:${SURFACE_2}}`;

type TableCol = { key: string; label: string };
const CELL_SLOT = "__spaday_cell_slot__";

function tableCell(td: HTMLTableCellElement, value: unknown): void {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    typeof (value as Record<string, unknown>)[CELL_SLOT] === "string"
  ) {
    const name = String((value as Record<string, unknown>)[CELL_SLOT]);
    const existing = td.firstElementChild;
    if (
      td.childNodes.length === 1 &&
      existing instanceof HTMLSlotElement &&
      existing.name === name
    )
      return;
    const slot = document.createElement("slot");
    slot.name = name;
    td.replaceChildren(slot);
    return;
  }
  const text = value == null ? "" : String(value);
  if (td.childElementCount === 0 && td.textContent === text) return;
  td.textContent = text;
}

function tableColumns(
  cols: unknown,
  rows: Record<string, unknown>[],
): TableCol[] {
  const raw =
    Array.isArray(cols) && cols.length
      ? cols
      : rows[0]
        ? Object.keys(rows[0])
        : []; // infer from the first row
  return raw.map((c) =>
    typeof c === "string"
      ? { key: c, label: c }
      : {
          key: String((c as Record<string, unknown>).key),
          label: String(
            (c as Record<string, unknown>).label ??
              (c as Record<string, unknown>).key,
          ),
        },
  );
}

function sameColumns(a: TableCol[], b: TableCol[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (column, i) => column.key === b[i].key && column.label === b[i].label,
    )
  );
}

function rowIdentity(row: Record<string, unknown>, rowKey: string): string {
  const value = row[rowKey];
  if (typeof value === "string") return `string:${value}`;
  if (typeof value === "number" && Number.isFinite(value))
    return `number:${value}`;
  throw new Error(
    `spa-table row_key ${JSON.stringify(rowKey)} must exist and contain a string or finite number`,
  );
}

function keyedRows(
  rows: Record<string, unknown>[],
  rowKey: string,
): Array<[string, Record<string, unknown>]> {
  const seen = new Set<string>();
  return rows.map((row) => {
    const identity = rowIdentity(row, rowKey);
    if (seen.has(identity))
      throw new Error(
        `spa-table row_key ${JSON.stringify(rowKey)} contains duplicate value ${JSON.stringify(row[rowKey])}`,
      );
    seen.add(identity);
    return [identity, row];
  });
}

function updateTableRow(
  tr: HTMLTableRowElement,
  row: Record<string, unknown>,
  cols: TableCol[],
): void {
  while (tr.cells.length < cols.length) tr.insertCell();
  while (tr.cells.length > cols.length) tr.deleteCell(-1);
  cols.forEach((column, i) => tableCell(tr.cells[i], row[column.key]));
}

if (typeof customElements !== "undefined" && !customElements.get("spa-table")) {
  customElements.define(
    "spa-table",
    class extends HTMLElement {
      private cols: unknown = null;
      private data: Record<string, unknown>[] = [];
      private key: string | null = null;
      private renderedCols: TableCol[] = [];
      private root: ShadowRoot;
      constructor() {
        super();
        this.root = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = TABLE_CSS;
        this.root.append(style);
        this.render(true);
      }
      set columns(v: unknown) {
        this.cols = v;
        this.render(true);
      }
      get columns(): unknown {
        return this.cols;
      }
      set rowKey(v: unknown) {
        const next = v == null ? null : String(v);
        if (next === this.key) return;
        this.key = next;
        this.render(true);
      }
      get rowKey(): unknown {
        return this.key;
      }
      set rows(v: unknown) {
        this.data = Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
        this.render();
      }
      get rows(): unknown {
        return this.data;
      }
      private reconcileRows(
        tbody: HTMLTableSectionElement,
        cols: TableCol[],
      ): void {
        const rows = keyedRows(this.data, this.key!); // validates before mutating the DOM
        const existing = new Map(
          [...tbody.rows].map((tr) => [tr.dataset.spadayRowKey!, tr]),
        );
        for (const [identity, row] of rows) {
          const tr = existing.get(identity) ?? document.createElement("tr");
          tr.dataset.spadayRowKey = identity;
          updateTableRow(tr, row, cols);
          tbody.append(tr); // inserts a new row or moves an existing row into the requested order
          existing.delete(identity);
        }
        for (const tr of existing.values()) tr.remove();
      }
      private render(force = false): void {
        const cols = tableColumns(this.cols, this.data);
        const old = this.root.querySelector("table");
        if (
          old &&
          this.key !== null &&
          !force &&
          sameColumns(cols, this.renderedCols)
        ) {
          this.reconcileRows(old.tBodies[0], cols);
          return;
        }
        const table = document.createElement("table");
        const hr = table.createTHead().insertRow();
        for (const c of cols) {
          const th = document.createElement("th");
          th.textContent = c.label;
          hr.append(th);
        }
        const tbody = table.createTBody();
        if (this.key !== null) this.reconcileRows(tbody, cols);
        else
          for (const row of this.data) {
            const tr = tbody.insertRow();
            updateTableRow(tr, row, cols);
          }
        if (old) old.replaceWith(table);
        else this.root.append(table);
        this.renderedCols = cols;
      }
    },
  );
}
