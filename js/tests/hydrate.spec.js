import { test, expect } from "@playwright/test";

// `hydrate` adopts server-rendered HTML (Python `spaday.render_html`) instead of rebuilding the tree:
// it attaches events + bindings and sets non-attribute props on the *existing* DOM elements. These
// tests pre-populate a container's innerHTML (standing in for the SSR'd HTML) and assert adoption.

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

const TOGGLE = { kind: "toggle", target: { ref: "this" }, prop: "hidden" };

test("adopts the pre-rendered element (no rebuild) and binds events", async ({
  page,
}) => {
  const result = await page.evaluate(
    ({ TOGGLE }) => {
      const { hydrate } = window.__spaday;
      const c = document.createElement("div");
      c.innerHTML = "<button>Go</button>"; // the server-rendered HTML
      const original = c.firstElementChild;
      original.__orig = true; // a non-serialized marker — survives only if the element is reused

      const root = hydrate(c, {
        tag: "button",
        props: { textContent: { Str: "Go" } },
        events: { click: TOGGLE },
      });
      root.click(); // the event the patch-free hydrate bound
      return {
        sameElement: root === original && root.__orig === true,
        hidden: root.hidden,
      };
    },
    { TOGGLE },
  );
  expect(result.sameElement).toBe(true); // adopted, not rebuilt
  expect(result.hidden).toBe(true); // the bound action ran
});

test("wires two-way bindings to a pre-rendered control", async ({ page }) => {
  const result = await page.evaluate(() => {
    const { hydrate, Store } = window.__spaday;
    const c = document.createElement("div");
    c.innerHTML = "<input>";
    const input = c.firstElementChild;
    const store = new Store();
    store.set("name", "init");

    hydrate(
      c,
      { tag: "input", bindings: { value: { field: "name", mode: "two-way" } } },
      store,
    );
    const initial = input.value; // store field → prop on hydrate
    input.value = "typed";
    input.dispatchEvent(new Event("input")); // two-way: control change → store field
    return { initial, stored: store.get("name") };
  });
  expect(result.initial).toBe("init");
  expect(result.stored).toBe("typed");
});

test("falls back to a full mount when nothing was pre-rendered", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const { hydrate } = window.__spaday;
    const c = document.createElement("div"); // empty — no SSR
    const root = hydrate(c, {
      tag: "section",
      props: { textContent: { Str: "x" } },
    });
    return { tag: root.tagName.toLowerCase(), html: c.innerHTML };
  });
  expect(result.tag).toBe("section");
  expect(result.html).toBe("<section>x</section>");
});

test("client-mounts spa-show children on hydrate (rendered empty by SSR)", async ({
  page,
}) => {
  const text = await page.evaluate(() => {
    const { hydrate, Store } = window.__spaday;
    const c = document.createElement("div");
    c.innerHTML = '<spa-show style="display:contents"></spa-show>'; // SSR renders the element empty
    const store = new Store();
    store.set("on", true);
    hydrate(
      c,
      {
        tag: "spa-show",
        props: { style: { Str: "display:contents" } },
        bindings: { when: { field: "on", mode: "one-way" } },
        slots: {
          default: [{ tag: "span", props: { textContent: { Str: "shown" } } }],
        },
      },
      store,
    );
    return c.querySelector("spa-show").textContent;
  });
  expect(text).toBe("shown"); // the structural subtree was mounted client-side
});
