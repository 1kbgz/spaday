import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("canceled submits and failed saves preserve drafts; commit uses the submitted snapshot", async ({
  page,
}) => {
  expect(
    await page.evaluate(async () => {
      const { createFormController, mount, unmount } =
        await import("/dist/esm/index.js");
      const form = mount(document.body, { tag: "form" });
      let draft = { name: "saved" };
      const options = {
        read: () => draft,
        write: (value) => {
          draft = value;
        },
      };
      const controller = createFormController(form, options);
      const same = controller === createFormController(form, options);
      const protectedDraft = () => {
        const event = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      };
      draft = { name: "edited" };
      form.addEventListener("submit", (event) => event.preventDefault());
      form.requestSubmit();
      const canceled = protectedDraft();
      controller.begin().fail();
      const failed = protectedDraft();
      const submitted = controller.begin();
      draft = { name: "newer edit" };
      submitted.commit();
      const newer = controller.dirty;
      controller.reset();
      const clean = !controller.dirty && !protectedDraft();
      draft = { name: "unsaved" };
      unmount(form);
      return {
        same,
        canceled,
        failed,
        newer,
        clean,
        submitted: submitted.value,
        draft,
        disposed: !protectedDraft(),
      };
    }),
  ).toEqual({
    same: true,
    canceled: true,
    failed: true,
    newer: true,
    clean: true,
    submitted: { name: "edited" },
    draft: { name: "unsaved" },
    disposed: true,
  });
});

test("downloads, new tabs, dialog submits, and restored-page events preserve dirty protection", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const { createFormController } = await import("/dist/esm/index.js");
    document.body.innerHTML = `<form id="draft"><input name="name" value="Saved"></form>
      <a id="new-tab" href="about:blank" target="_blank">New tab</a>
      <a id="download" href="data:text/plain,download" download="example.txt">Download</a>
      <dialog><form method="dialog"><button>Close dialog</button></form></dialog>`;
    const form = document.querySelector("#draft");
    window.controller = createFormController(form, {
      read: () => form.elements.name.value,
      write: (value) => {
        form.elements.name.value = value;
      },
    });
    window.protectedDraft = () => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
  });
  await page.locator('[name="name"]').fill("Edited");
  const popupPromise = page.waitForEvent("popup");
  await page.locator("#new-tab").click();
  await (await popupPromise).close();
  expect(await page.evaluate(() => window.protectedDraft())).toBe(true);
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#download").click();
  expect((await downloadPromise).suggestedFilename()).toBe("example.txt");
  expect(await page.evaluate(() => window.protectedDraft())).toBe(true);
  await page.evaluate(() => document.querySelector("dialog").showModal());
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      );
      return window.protectedDraft();
    }),
  ).toBe(true);
  await page.evaluate(() => window.controller.reset());
  expect(await page.evaluate(() => window.protectedDraft())).toBe(false);
});

test("ordinary navigation prompts while dirty and a confirmed save clears the guard", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const { createFormController } = await import("/dist/esm/index.js");
    const form = document.createElement("form");
    form.innerHTML = '<input value="Saved">';
    document.body.append(form);
    window.controller = createFormController(form, {
      read: () => form.querySelector("input").value,
      write: (value) => {
        form.querySelector("input").value = value;
      },
    });
  });
  await page.locator("input").fill("Edited");
  const dismissed = page.waitForEvent("dialog").then(async (dialog) => {
    expect(dialog.type()).toBe("beforeunload");
    await dialog.dismiss();
  });
  await page.goto("about:blank").catch(() => {});
  await dismissed;
  await expect(page.locator("input")).toHaveValue("Edited");
  await page.evaluate(() => window.controller.begin().commit());
  await page.goto("about:blank");
  expect(page.url()).toBe("about:blank");
});

test("managed requests cancel on edits, disposal, and newer requests without running later actions", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const { mount, Store } = await import("/dist/esm/index.js");
    window.replies = [];
    window.fetch = (_url, options) =>
      new Promise((resolve) =>
        window.replies.push({ resolve, signal: options.signal }),
      );
    window.store = new Store({
      draft: "one",
      busy: false,
      result: null,
      done: false,
    });
    window.button = mount(
      document.body,
      {
        tag: "button",
        events: {
          click: {
            kind: "seq",
            actions: [
              {
                kind: "call",
                method: "GET",
                url: "/preview",
                result: "result",
                request: { key: "preview", pending: "busy", watch: ["draft"] },
              },
              {
                kind: "set-field",
                field: "done",
                value: { expr: "lit", value: true },
              },
            ],
          },
        },
      },
      window.store,
    );
    window.button.click();
    window.store.set("draft", "two");
    window.button.click();
    window.button.click();
  });
  expect(
    await page.evaluate(() => ({
      aborted: window.replies.map((x) => x.signal.aborted),
      busy: window.store.get("busy"),
    })),
  ).toEqual({ aborted: [true, true, false], busy: true });
  await page.evaluate(() => {
    for (const reply of window.replies.slice(0, 2))
      reply.resolve(new Response('"old"'));
  });
  await expect
    .poll(() => page.evaluate(() => window.store.get("result")))
    .toBe(null);
  expect(await page.evaluate(() => window.store.get("done"))).toBe(false);
  await page.evaluate(() =>
    window.replies[2].resolve(new Response('"latest"')),
  );
  await expect
    .poll(() => page.evaluate(() => window.store.get("result")?.body))
    .toBe("latest");
  expect(
    await page.evaluate(() => ({
      busy: window.store.get("busy"),
      done: window.store.get("done"),
    })),
  ).toEqual({ busy: false, done: true });
  await page.evaluate(async () => {
    window.store.set("done", false);
    window.button.click();
    (await import("/dist/esm/index.js")).unmount(window.button);
    window.replies[3].resolve(new Response('"detached"'));
  });
  expect(
    await page.evaluate(() => ({
      aborted: window.replies[3].signal.aborted,
      busy: window.store.get("busy"),
      done: window.store.get("done"),
      body: window.store.get("result").body,
    })),
  ).toEqual({ aborted: true, busy: false, done: false, body: "latest" });
});

test("managed network failures settle pending state and expose the existing result shape", async ({
  page,
}) => {
  await page.route("**/failure", (route) => route.abort());
  await page.evaluate(async () => {
    const { mount, Store } = await import("/dist/esm/index.js");
    window.store = new Store();
    mount(
      document.body,
      {
        tag: "button",
        events: {
          click: {
            kind: "call",
            method: "GET",
            url: "/failure",
            result: "result",
            request: { key: "save", pending: "busy" },
          },
        },
      },
      window.store,
    ).click();
  });
  await expect
    .poll(() => page.evaluate(() => window.store.get("busy")))
    .toBe(false);
  expect(await page.evaluate(() => window.store.get("result"))).toMatchObject({
    ok: false,
    status: 0,
  });
});

test("submission handles preserve snapshots through reset and ignore older responses", async ({
  page,
}) => {
  expect(
    await page.evaluate(async () => {
      const { mount, unmount, createFormController } =
        await import("/dist/esm/index.js");
      let draft = { name: "saved" };
      const form = mount(document.body, { tag: "form" });
      const controller = createFormController(form, {
        read: () => draft,
        write: (value) => (draft = value),
      });
      draft = { name: "submitted" };
      const first = controller.begin();
      controller.reset();
      const pending = controller.status;
      draft = { name: "unsaved" };
      first.commit();
      const dirty = controller.dirty;
      const older = controller.begin();
      draft = { name: "latest" };
      const newer = controller.begin();
      const ignored = !older.commit() && !older.fail();
      newer.commit();
      const clean = !controller.dirty;
      unmount(form);
      return { pending, dirty, ignored, clean, disposed: !newer.commit() };
    }),
  ).toEqual({
    pending: "submitting",
    dirty: true,
    ignored: true,
    clean: true,
    disposed: true,
  });
});

test("a later reset listener can prevent restoring saved values", async ({
  page,
}) => {
  expect(
    await page.evaluate(async () => {
      const { mount, unmount, createFormController } =
        await import("/dist/esm/index.js");
      let draft = "saved";
      const form = mount(document.body, { tag: "form" });
      createFormController(form, {
        read: () => draft,
        write: (value) => (draft = value),
      });
      draft = "edited";
      form.addEventListener("reset", (event) => event.preventDefault());
      form.reset();
      await new Promise((resolve) => setTimeout(resolve, 10));
      unmount(form);
      return draft;
    }),
  ).toBe("edited");
});

for (const notify of ["result", "busy"])
  test(`disposal in ${notify} notification stops the action sequence`, async ({
    page,
  }) => {
    expect(
      await page.evaluate(async (notify) => {
        const { mount, unmount, Store } = await import("/dist/esm/index.js");
        const store = new Store({ busy: false, continued: false });
        window.fetch = async () => new Response('"done"');
        const root = mount(
          document.body,
          {
            tag: "button",
            events: {
              click: {
                kind: "seq",
                actions: [
                  {
                    kind: "call",
                    method: "GET",
                    url: "/test",
                    result: "result",
                    request: { key: "test", pending: "busy" },
                  },
                  {
                    kind: "set-field",
                    field: "continued",
                    value: { expr: "lit", value: true },
                  },
                ],
              },
            },
          },
          store,
        );
        store.subscribe(notify, (value) => {
          if (notify === "result" || value === false) unmount(root);
        });
        root.click();
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          continued: store.get("continued"),
          connected: root.isConnected,
          busy: store.get("busy"),
        };
      }, notify),
    ).toEqual({ continued: false, connected: false, busy: false });
  });

test("request supersession does not publish a false pending transition or lose group ownership", async ({
  page,
}) => {
  expect(
    await page.evaluate(async () => {
      const { mount, unmount, Store } = await import("/dist/esm/index.js");
      const replies = [];
      window.fetch = (_url, options) =>
        new Promise((resolve) =>
          replies.push({ resolve, signal: options.signal }),
        );
      const store = new Store({ busy: false });
      const root = mount(
        document.body,
        {
          tag: "button",
          events: {
            click: {
              kind: "call",
              method: "GET",
              url: "/test",
              request: { key: "test", pending: "busy" },
            },
          },
        },
        store,
      );
      root.click();
      let nested = false;
      store.subscribe("busy", (busy) => {
        if (!busy && !nested) {
          nested = true;
          root.dispatchEvent(new Event("click"));
        }
      });
      root.click();
      const result = {
        live: replies.filter((r) => !r.signal.aborted).length,
        nested,
        busy: store.get("busy"),
      };
      nested = true;
      unmount(root);
      return result;
    }),
  ).toEqual({ live: 1, nested: false, busy: true });
});

test("unserializable managed bodies settle pending state", async ({ page }) => {
  expect(
    await page.evaluate(async () => {
      const { mount, unmount, Store } = await import("/dist/esm/index.js");
      const store = new Store({ busy: false, payload: 1n });
      const root = mount(
        document.body,
        {
          tag: "button",
          events: {
            click: {
              kind: "call",
              method: "POST",
              url: "/test",
              body: { expr: "field", name: "payload" },
              result: "result",
              request: { key: "test", pending: "busy" },
            },
          },
        },
        store,
      );
      root.click();
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result = {
        busy: store.get("busy"),
        status: store.get("result")?.status,
        ok: store.get("result")?.ok,
      };
      unmount(root);
      return result;
    }),
  ).toEqual({ busy: false, status: 0, ok: false });
});

test("a request started by completion notification stops the older continuation", async ({
  page,
}) => {
  expect(
    await page.evaluate(async () => {
      const { mount, unmount, Store, registerHandler } =
        await import("/dist/esm/index.js");
      const replies = [],
        continued = [];
      window.fetch = () => new Promise((resolve) => replies.push(resolve));
      registerHandler("completed", (event) => continued.push(event.detail));
      const store = new Store({ busy: false });
      const root = mount(
        document.body,
        {
          tag: "button",
          events: {
            click: {
              kind: "seq",
              actions: [
                {
                  kind: "call",
                  method: "GET",
                  url: "/test",
                  request: { key: "test", pending: "busy" },
                },
                { kind: "js", handler: "completed" },
              ],
            },
          },
        },
        store,
      );
      let again = false;
      store.subscribe("busy", (busy) => {
        if (!busy && !again) {
          again = true;
          root.dispatchEvent(new CustomEvent("click", { detail: "new" }));
        }
      });
      root.dispatchEvent(new CustomEvent("click", { detail: "old" }));
      replies[0](new Response('"old"'));
      await new Promise((resolve) => setTimeout(resolve, 10));
      const before = continued.slice();
      replies[1](new Response('"new"'));
      await new Promise((resolve) => setTimeout(resolve, 10));
      unmount(root);
      return { before, after: continued };
    }),
  ).toEqual({ before: [], after: ["new"] });
});
