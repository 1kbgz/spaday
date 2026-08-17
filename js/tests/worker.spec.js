import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => window.__spaday);
});

test("worker snapshots, receives an intent, and patches existing DOM", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    class FakeWorker extends EventTarget {
      messages = [];

      postMessage(message) {
        this.messages.push(message);
        if (message.type === "start") {
          this.dispatchEvent(
            new MessageEvent("message", {
              data: {
                type: "snapshot",
                tree: {
                  tag: "button",
                  props: { textContent: { Str: "0" } },
                  events: {
                    click: {
                      kind: "patch",
                      model: "counter",
                      field: "increment",
                      value: { expr: "lit", value: 1 },
                    },
                  },
                },
              },
            }),
          );
        } else {
          this.dispatchEvent(
            new MessageEvent("message", {
              data: {
                type: "patch",
                patch: {
                  ops: [
                    {
                      SetProp: {
                        path: [],
                        name: "textContent",
                        value: { Str: "1" },
                      },
                    },
                  ],
                },
              },
            }),
          );
        }
      }
    }

    const worker = new FakeWorker();
    const container = document.createElement("div");
    const link = window.__spaday.connectWorker(container, worker);
    await link.ready;
    const button = container.querySelector("button");
    button.dataset.identity = "preserved";
    button.click();

    return {
      text: button.textContent,
      identity: button.dataset.identity,
      intent: worker.messages[1],
    };
  });

  expect(result).toEqual({
    text: "1",
    identity: "preserved",
    intent: {
      type: "spaday:patch",
      detail: { model: "counter", field: "increment", value: 1 },
    },
  });
});
