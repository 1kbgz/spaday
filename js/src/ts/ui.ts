// The native baseline for spaday's generic controls (`spaday.ui`, resolved by the `native` design):
// HTML controls and small `spa-*` adapters marked with `data-ui`, styled from the `--spa-*` shell
// palette so they follow the page mode and any app-level theme. A design-system package replaces
// these with its own elements; this is what an app gets with none installed, and the reference every
// realization is checked against.

const BORDER = "var(--spa-border, #e6e6e6)";
const SURFACE = "var(--spa-surface, #fff)";
const MUTED = "var(--spa-muted, #666)";

interface ChoiceOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
}

function choiceOptions(value: unknown): ChoiceOption[] {
  if (!Array.isArray(value)) return [];
  return value.map((option) => {
    if (typeof option === "object" && option !== null && "value" in option) {
      const item = option as Partial<ChoiceOption> & {
        value: ChoiceOption["value"];
      };
      return {
        value: item.value,
        label: String(item.label ?? item.value),
        ...(item.disabled ? { disabled: true } : {}),
      };
    }
    return {
      value: option as ChoiceOption["value"],
      label: String(option),
    };
  });
}

function sameValue(left: unknown, right: unknown): boolean {
  return left === right;
}

let nextRadioId = 0;

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
[data-ui=error]:empty{display:none}
[data-ui=input],[data-ui=textarea],[data-ui=number-input],[data-ui=date-input],spa-select[data-ui=select]>select{padding:.45rem .6rem;border:1px solid ${BORDER};border-radius:8px;background:${SURFACE}}
[data-ui=textarea]{resize:vertical}
[data-ui=input][data-size=sm],[data-ui=textarea][data-size=sm],[data-ui=number-input][data-size=sm],[data-ui=date-input][data-size=sm],spa-select[data-ui=select][data-size=sm]>select{padding:.3rem .5rem;font-size:.85em}
[data-ui=input][data-size=lg],[data-ui=textarea][data-size=lg],[data-ui=number-input][data-size=lg],[data-ui=date-input][data-size=lg],spa-select[data-ui=select][data-size=lg]>select{padding:.6rem .8rem;font-size:1.1em}
[data-ui=input][data-invalid],[data-ui=textarea][data-invalid],[data-ui=number-input][data-invalid],[data-ui=date-input][data-invalid],spa-select[data-ui=select][data-invalid]>select{border-color:var(--spa-danger, #c62828)}
[data-ui=input]:focus-visible,[data-ui=textarea]:focus-visible,[data-ui=number-input]:focus-visible,[data-ui=date-input]:focus-visible,spa-select[data-ui=select]>select:focus-visible,[data-ui=button]:focus-visible{outline:2px solid var(--spa-accent, #4a90d9);outline-offset:1px}
spa-select[data-ui=select]{display:contents}
[data-ui=checkbox]{width:1rem;height:1rem;margin:0;accent-color:var(--spa-accent, #4a90d9)}
[data-ui=switch]{appearance:none;width:2.2rem;height:1.2rem;margin:0;border-radius:1rem;background:${BORDER};position:relative;cursor:pointer;transition:background .15s}
[data-ui=switch]::before{content:"";position:absolute;top:.15rem;left:.15rem;width:.9rem;height:.9rem;border-radius:50%;background:${SURFACE};transition:left .15s}
[data-ui=switch]:checked{background:var(--spa-accent, #4a90d9)}
[data-ui=switch]:checked::before{left:1.15rem}
[data-ui=checkbox]:disabled,[data-ui=switch]:disabled{opacity:.5;cursor:default}
[data-ui=radio-group]{display:grid;gap:.4rem}
[data-ui=radio-option]{display:flex;align-items:center;gap:.45rem;font-weight:400}
[data-ui=radio]{accent-color:var(--spa-accent, #4a90d9)}
[data-ui=slider]{width:100%;accent-color:var(--spa-accent, #4a90d9)}
[data-ui=alert]{padding:.75rem 1rem;border:1px solid var(--spa-accent, ${BORDER});border-left-width:4px;border-radius:8px;background:${SURFACE}}
[data-ui=alert][data-intent=success]{border-color:var(--spa-success, #2e7d32)}
[data-ui=alert][data-intent=warning]{border-color:var(--spa-warning, #9a6700)}
[data-ui=alert][data-intent=danger]{border-color:var(--spa-danger, #c62828)}
[data-ui=alert-title]{display:block;margin-bottom:.25rem}
[data-ui=progress]{display:contents}
[data-ui=progress]>progress{width:100%;accent-color:var(--spa-accent, #4a90d9)}
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

if (typeof customElements !== "undefined") {
  if (!customElements.get("spa-select")) {
    customElements.define(
      "spa-select",
      class extends HTMLElement {
        private _options: ChoiceOption[] = [];
        private _value: ChoiceOption["value"] | null = null;
        private _disabled = false;
        private _required = false;
        private _name = "";
        private _placeholder = "";

        connectedCallback(): void {
          this.render();
        }

        get options(): ChoiceOption[] {
          return this._options;
        }
        set options(value: ChoiceOption[]) {
          this._options = choiceOptions(value);
          this.render();
        }

        get value(): ChoiceOption["value"] | null {
          return this._value;
        }
        set value(value: ChoiceOption["value"] | null) {
          this._value = value;
          this.syncValue();
        }

        get disabled(): boolean {
          return this._disabled;
        }
        set disabled(value: boolean) {
          this._disabled = Boolean(value);
          this.syncState();
        }

        get required(): boolean {
          return this._required;
        }
        set required(value: boolean) {
          this._required = Boolean(value);
          this.syncState();
        }

        get name(): string {
          return this._name;
        }
        set name(value: string) {
          this._name = value ?? "";
          this.syncState();
        }

        get placeholder(): string {
          return this._placeholder;
        }
        set placeholder(value: string) {
          this._placeholder = value ?? "";
          this.render();
        }

        checkValidity(): boolean {
          return this.querySelector("select")?.checkValidity() ?? true;
        }

        private render(): void {
          const select = document.createElement("select");
          if (this._placeholder) {
            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = this._placeholder;
            placeholder.disabled = this._required;
            select.append(placeholder);
          }
          this._options.forEach((option, index) => {
            const element = document.createElement("option");
            element.value = String(index);
            element.textContent = option.label;
            element.disabled = Boolean(option.disabled);
            select.append(element);
          });
          select.addEventListener("change", () => {
            const index = Number(select.value);
            this._value =
              select.value === "" ? null : this._options[index].value;
          });
          this.replaceChildren(select);
          this.syncState();
          this.syncValue();
        }

        private syncState(): void {
          const select = this.querySelector("select");
          if (!select) return;
          select.disabled = this._disabled;
          select.required = this._required;
          select.name = this._name;
          if (this._placeholder) select.options[0].disabled = this._required;
        }

        private syncValue(): void {
          const select = this.querySelector("select");
          if (!select) return;
          const index = this._options.findIndex((option) =>
            sameValue(option.value, this._value),
          );
          select.value = index < 0 ? "" : String(index);
        }
      },
    );
  }

  if (!customElements.get("spa-radio-group")) {
    customElements.define(
      "spa-radio-group",
      class extends HTMLElement {
        private readonly internalName = `spa-radio-${++nextRadioId}`;
        private _options: ChoiceOption[] = [];
        private _value: ChoiceOption["value"] | null = null;
        private _disabled = false;
        private _required = false;
        private _name = "";

        connectedCallback(): void {
          this.setAttribute("role", "radiogroup");
          this.syncLabel();
          this.render();
        }

        get options(): ChoiceOption[] {
          return this._options;
        }
        set options(value: ChoiceOption[]) {
          this._options = choiceOptions(value);
          this.render();
        }

        get value(): ChoiceOption["value"] | null {
          return this._value;
        }
        set value(value: ChoiceOption["value"] | null) {
          this._value = value;
          this.syncValue();
        }

        get disabled(): boolean {
          return this._disabled;
        }
        set disabled(value: boolean) {
          this._disabled = Boolean(value);
          this.syncState();
        }

        get required(): boolean {
          return this._required;
        }
        set required(value: boolean) {
          this._required = Boolean(value);
          this.syncState();
        }

        get name(): string {
          return this._name;
        }
        set name(value: string) {
          this._name = value ?? "";
          this.syncState();
        }

        checkValidity(): boolean {
          return (
            this.querySelector<HTMLInputElement>(
              "input:not(:disabled)",
            )?.checkValidity() ?? true
          );
        }

        private render(): void {
          const children = this._options.map((option, index) => {
            const label = document.createElement("label");
            label.dataset.ui = "radio-option";
            const input = document.createElement("input");
            input.type = "radio";
            input.dataset.ui = "radio";
            input.value = String(index);
            input.addEventListener("change", () => {
              if (input.checked) this._value = option.value;
            });
            label.append(input, document.createTextNode(option.label));
            return label;
          });
          this.replaceChildren(...children);
          this.syncState();
          this.syncValue();
        }

        private syncState(): void {
          for (const [index, input] of Array.from(
            this.querySelectorAll<HTMLInputElement>("input"),
          ).entries()) {
            input.name = this._name || this.internalName;
            input.disabled =
              this._disabled || Boolean(this._options[index]?.disabled);
            input.required = this._required;
          }
        }

        private syncValue(): void {
          for (const [index, input] of Array.from(
            this.querySelectorAll<HTMLInputElement>("input"),
          ).entries())
            input.checked = sameValue(this._options[index]?.value, this._value);
        }

        private syncLabel(): void {
          if (
            this.hasAttribute("aria-label") ||
            this.hasAttribute("aria-labelledby")
          )
            return;
          const label = this.previousElementSibling;
          if (!label?.matches("[data-ui=label]")) return;
          if (!label.id) label.id = `${this.internalName}-label`;
          this.setAttribute("aria-labelledby", label.id);
        }
      },
    );
  }

  if (!customElements.get("spa-progress")) {
    customElements.define(
      "spa-progress",
      class extends HTMLElement {
        private _value: number | null = null;
        private _max = 1;

        connectedCallback(): void {
          if (!this.firstElementChild)
            this.append(document.createElement("progress"));
          this.sync();
        }

        get value(): number | null {
          return this._value;
        }
        set value(value: number | null) {
          this._value = value;
          this.sync();
        }

        get max(): number {
          return this._max;
        }
        set max(value: number) {
          this._max = value;
          this.sync();
        }

        private sync(): void {
          const progress = this.querySelector("progress");
          if (!progress) return;
          progress.max = this._max;
          if (this._value == null) progress.removeAttribute("value");
          else progress.value = this._value;
        }
      },
    );
  }
}
