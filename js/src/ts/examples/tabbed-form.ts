import {
  attachController,
  createFormController,
  registerHandler,
} from "/js/cdn/index.js";

const editors = new WeakMap();
const submissions = new WeakMap();
document.addEventListener("spaday:ready", (event: CustomEvent) => {
  const { root, store } = event.detail;
  const health = root.querySelector("#server-status");
  if (health)
    attachController(health, "status-poll", () => {
      let disposed = false;
      let timer;
      const refresh = () => {
        if (
          !disposed &&
          health.isConnected &&
          !document.hidden &&
          !store.get("checking")
        )
          health.dispatchEvent(new Event("refresh"));
      };
      const visibility = () => {
        clearInterval(timer);
        if (!document.hidden) {
          refresh();
          if (!disposed) timer = setInterval(refresh, 5000);
        }
      };
      document.addEventListener("visibilitychange", visibility);
      // Register the disposer before a request can synchronously remove this root.
      queueMicrotask(() => {
        if (!disposed) visibility();
      });
      return () => {
        disposed = true;
        clearInterval(timer);
        document.removeEventListener("visibilitychange", visibility);
      };
    });
  const form = root.querySelector("#editor");
  if (!form) return;
  const controller = createFormController(form, {
    read: () => Object.fromEntries(new FormData(form)),
    write: (value) => {
      for (const [name, text] of Object.entries(value))
        form.elements.namedItem(name).value = text;
      store.set("draft", value);
      store.set("status", "Reset to saved values");
    },
    revealInvalid: async (control) => {
      store.set("status", control.validationMessage);
      const panel = control.closest("wa-tab-panel");
      const tabs = panel?.closest("wa-tab-group");
      if (tabs) {
        tabs.active = panel.name;
        await tabs.updateComplete;
        await panel.updateComplete;
      }
    },
  });
  editors.set(form, { controller, store });
});

registerHandler("read-draft", (_event, form) => {
  editors.get(form).store.set("draft", Object.fromEntries(new FormData(form)));
});

registerHandler("begin-save", (event, form) => {
  event.preventDefault();
  const editor = editors.get(form);
  const { controller, store } = editor;
  submissions.set(event, controller.begin());
  store.set("status", "Saving");
});
registerHandler("finish-save", (event, form) => {
  const { controller, store } = editors.get(form);
  const submission = submissions.get(event);
  submissions.delete(event);
  const saved = store.get("saved");
  if (saved.ok) {
    if (!submission.commit(saved.body)) return;
    store.set(
      "status",
      controller.dirty ? "Saved; newer edits remain" : "Saved",
    );
  } else {
    if (!submission.fail()) return;
    store.set("status", "Save failed; draft retained");
  }
});
