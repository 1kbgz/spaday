import { test, expect } from "@playwright/test";

// The spaday anywidget ESM (dist/cdn/widget.js) end-to-end against a fake anywidget model: it mounts a
// tree, applies a minimal diff when `_tree` changes (live elements preserved), runs the action DSL
// client-side, and forwards a SendPatch intent to the kernel over the model. The wasm core is inlined
// in the bundle, so there is no kernel and nothing to fetch.

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/widget.html");
  await page.waitForFunction(() => window.__widget);
});

test("renders the tree, then patches the live DOM on a _tree change", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { widget, fakeModel } = window.__widget;
    const span = (s) => ({ tag: "span", props: { textContent: { Str: s } } });
    const tree = (s) => ({
      tag: "div",
      props: { id: { Str: "root" } },
      slots: { default: [span(s)] },
    });

    const model = fakeModel({ _tree: tree("a") });
    const el = document.createElement("div");
    await widget.initialize();
    const cleanup = await widget.render({ model, el });

    const before = el.innerHTML;
    el.querySelector("span").__orig = true; // prove the next update reuses this node
    model.set("_tree", tree("b")); // a Python-side widget.update(...) lands as this change
    const after = el.innerHTML;
    const sameNode = el.querySelector("span").__orig === true;

    cleanup();
    return {
      before,
      after,
      sameNode,
      childrenAfterCleanup: el.children.length,
    };
  });

  expect(result.before).toBe('<div id="root"><span>a</span></div>');
  expect(result.after).toBe('<div id="root"><span>b</span></div>');
  expect(result.sameNode).toBe(true); // incremental diff/applyPatch, not a re-render
  expect(result.childrenAfterCleanup).toBe(0); // cleanup detaches the mounted root
});

test("runs a client-side action and forwards a SendPatch intent to the model", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { widget, fakeModel } = window.__widget;
    // a button carrying two actions in sequence: a client-side Toggle (no round-trip) and a SendPatch
    // (the model-edit intent the host forwards to Python).
    const tree = {
      tag: "div",
      slots: {
        default: [
          {
            tag: "button",
            props: { id: { Str: "b" } },
            events: {
              click: {
                kind: "seq",
                actions: [
                  { kind: "toggle", target: { ref: "this" }, prop: "hidden" },
                  {
                    kind: "patch",
                    model: "demo",
                    field: "ping",
                    value: { expr: "lit", value: true },
                  },
                ],
              },
            },
          },
        ],
      },
    };

    const model = fakeModel({ _tree: tree });
    const el = document.createElement("div");
    document.body.appendChild(el);
    await widget.initialize();
    await widget.render({ model, el });

    const button = el.querySelector("#b");
    button.click();
    return { hidden: button.hidden, sent: model._sent };
  });

  expect(result.hidden).toBe(true); // the Toggle ran in the browser
  expect(result.sent).toHaveLength(1); // exactly the SendPatch intent
  expect(result.sent[0]).toEqual({
    type: "spaday:patch",
    detail: { model: "demo", field: "ping", value: true },
  });
});

test("two-way binds a control to the widget _state (notebook reactive)", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const { widget, fakeModel } = window.__widget;
    const model = fakeModel({
      _state: { on: false },
      _tree: {
        tag: "input",
        props: { type: { Str: "checkbox" } },
        bindings: { checked: { field: "on", mode: "two-way" } },
      },
    });
    const el = document.createElement("div");
    document.body.appendChild(el);
    await widget.initialize();
    await widget.render({ model, el });

    const box = el.querySelector("input");
    const seededUnchecked = box.checked; // inbound: _state.on=false → unchecked on mount
    box.checked = true;
    box.dispatchEvent(new Event("change")); // outbound: control → _state
    const stateAfterToggle = model.get("_state");
    model.set("_state", { on: false }); // inbound from "Python": _state → control
    return { seededUnchecked, stateAfterToggle, recheckedFalse: box.checked };
  });
  expect(result.seededUnchecked).toBe(false); // initial _state flowed to the control
  expect(result.stateAfterToggle).toEqual({ on: true }); // the control wrote _state back
  expect(result.recheckedFalse).toBe(false); // a Python-side _state change updated the control
});
