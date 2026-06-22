import { test, expect } from "@playwright/test";

// Rendered-layout regression tests. The unit/DOM tests assert structure and computed `display` but not
// the *rendered* box geometry, so the wa-button overflow bug (a slotted button whose internal base part
// was wider than its host, overlapping neighbors) passed them all. These mount an omnibus-shaped tree
// of shell + WebAwesome controls and assert geometry invariants: nothing overflows its host, adjacent
// controls don't overlap, controls have non-zero size, and the app shell lays out in order.

const OVERFLOW_TOL = 4; // px — the wa-button bug was ~34px; control chrome (e.g. wa-select) is ~3px

const wbtn = (label) => ({
  tag: "wa-button",
  props: { variant: { Str: "neutral" }, textContent: { Str: label } },
});

// App › Nav / Body(Gutter + Main(Toolbar, Row)) / Footer — the shapes the example composes.
const TREE = {
  tag: "spa-app",
  slots: {
    default: [
      {
        tag: "spa-nav",
        slots: {
          default: [
            { tag: "strong", props: { textContent: { Str: "spaday" } } },
          ],
        },
      },
      {
        tag: "spa-body",
        slots: {
          default: [
            {
              tag: "spa-gutter",
              slots: {
                default: [
                  { tag: "span", props: { textContent: { Str: "menu" } } },
                ],
              },
            },
            {
              tag: "spa-main",
              slots: {
                default: [
                  {
                    tag: "spa-toolbar",
                    slots: {
                      default: [
                        wbtn("Line"),
                        wbtn("Area"),
                        wbtn("Histogram"),
                        { tag: "wa-select", props: { label: { Str: "Type" } } },
                        {
                          tag: "wa-switch",
                          props: { textContent: { Str: "Live" } },
                        },
                      ],
                    },
                  },
                  {
                    tag: "spa-row",
                    slots: {
                      default: [
                        wbtn("Toggle details"),
                        {
                          tag: "wa-callout",
                          props: {
                            variant: { Str: "neutral" },
                            textContent: { Str: "a panel of explanatory text" },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        tag: "spa-footer",
        slots: {
          default: [{ tag: "span", props: { textContent: { Str: "footer" } } }],
        },
      },
    ],
  },
};

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/layout.html");
  // spa-* are defined on import of the runtime; wa-* load lazily once mounted (autoloader).
  await page.waitForFunction(
    () => window.__spaday && customElements.get("spa-app"),
  );
});

async function mountTree(page) {
  await page.evaluate((tree) => {
    document.body.replaceChildren();
    window.__spaday.mount(document.body, tree);
  }, TREE);
  // wait for the WebAwesome buttons to upgrade + render their shadow base, then let layout settle
  await page.waitForFunction(() => {
    const b = document.querySelector("wa-button");
    const base =
      b && b.shadowRoot && b.shadowRoot.querySelector('[part~="base"]');
    return base && base.getBoundingClientRect().width > 0;
  });
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}

test("interactive controls never overflow their own host", async ({ page }) => {
  await mountTree(page);
  const controls = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll(
      "wa-button, wa-select, wa-switch",
    )) {
      const host = el.getBoundingClientRect();
      let right = host.right;
      let bottom = host.bottom;
      el.shadowRoot?.querySelectorAll("*").forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.width && r.height) {
          right = Math.max(right, r.right);
          bottom = Math.max(bottom, r.bottom);
        }
      });
      out.push({
        tag: el.tagName.toLowerCase(),
        label: el.textContent.trim().slice(0, 14),
        rightOverflow: Math.round(right - host.right),
        bottomOverflow: Math.round(bottom - host.bottom),
      });
    }
    return out;
  });
  expect(controls.length).toBeGreaterThan(0);
  for (const c of controls) {
    expect(
      c.rightOverflow,
      `${c.tag} "${c.label}" right overflow`,
    ).toBeLessThanOrEqual(OVERFLOW_TOL);
    expect(
      c.bottomOverflow,
      `${c.tag} "${c.label}" bottom overflow`,
    ).toBeLessThanOrEqual(OVERFLOW_TOL);
  }
});

test("toolbar controls don't overlap and have non-zero size", async ({
  page,
}) => {
  await mountTree(page);
  const { gaps, sizes } = await page.evaluate(() => {
    const kids = [...document.querySelector("spa-toolbar").children];
    const gaps = [];
    for (let i = 1; i < kids.length; i++) {
      gaps.push(
        Math.round(
          kids[i].getBoundingClientRect().left -
            kids[i - 1].getBoundingClientRect().right,
        ),
      );
    }
    const sizes = kids.map((k) => {
      const r = k.getBoundingClientRect();
      return {
        tag: k.tagName.toLowerCase(),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    });
    return { gaps, sizes };
  });
  for (const g of gaps)
    expect(g, "adjacent toolbar gap").toBeGreaterThanOrEqual(-1); // no overlap
  for (const s of sizes) {
    expect(s.w, `${s.tag} width`).toBeGreaterThan(0);
    expect(s.h, `${s.tag} height`).toBeGreaterThan(0);
  }
});

test("the app shell lays out in order (nav → body → footer; gutter left of main)", async ({
  page,
}) => {
  await mountTree(page);
  const box = await page.evaluate(() => {
    const r = (sel) => {
      const b = document.querySelector(sel).getBoundingClientRect();
      return {
        top: Math.round(b.top),
        bottom: Math.round(b.bottom),
        left: Math.round(b.left),
        right: Math.round(b.right),
      };
    };
    return {
      nav: r("spa-nav"),
      body: r("spa-body"),
      footer: r("spa-footer"),
      gutter: r("spa-gutter"),
      main: r("spa-main"),
    };
  });
  expect(box.nav.bottom).toBeLessThanOrEqual(box.body.top + 1); // nav above body
  expect(box.body.bottom).toBeLessThanOrEqual(box.footer.top + 1); // body above footer
  expect(box.gutter.right).toBeLessThanOrEqual(box.main.left + 1); // gutter left of main
});

test("layout props (gap / width) drive the shell's CSS custom properties", async ({
  page,
}) => {
  const r = await page.evaluate(() => {
    const { mount } = window.__spaday;
    const stack = mount(document.body, {
      tag: "spa-stack",
      props: { gap: { Str: "24px" } },
    });
    const gutter = mount(document.body, {
      tag: "spa-gutter",
      props: { width: { Str: "320px" } },
    });
    return {
      stackGap: getComputedStyle(stack).rowGap, // column gap = row-gap
      gutterWidth: getComputedStyle(gutter).width,
    };
  });
  expect(r.stackGap).toBe("24px");
  expect(r.gutterWidth).toBe("320px");
});
