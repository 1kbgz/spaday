import fs from "fs";
import { test, expect } from "@playwright/test";
import { parseCem, registry } from "../src/ts/index";
import { initSync } from "../dist/pkg/spaday";

test.beforeAll(() => {
  const buffer = fs.readFileSync("./dist/pkg/spaday_bg.wasm");
  initSync({ module: buffer });
});

const MANIFEST = JSON.stringify({
  modules: [
    {
      declarations: [
        {
          customElement: true,
          tagName: "wa-switch",
          summary: "A toggle.",
          attributes: [
            { name: "checked", type: { text: "boolean" }, default: "false" },
            {
              name: "size",
              type: { text: "'small' | 'medium' | 'large'" },
              default: "'medium'",
            },
            { name: "name", type: { text: "string | null" }, default: "null" },
          ],
          events: [{ name: "change" }, { name: "input" }],
          slots: [{ name: "" }, { name: "hint" }],
        },
        { customElement: false, name: "Helper" },
      ],
    },
  ],
});

test("parseCem yields normalized schemas (custom elements only)", () => {
  const schemas = parseCem(MANIFEST);
  expect(schemas.length).toBe(1);
  expect(schemas[0].tag_name).toBe("wa-switch");
  expect(schemas[0].class_name).toBe("WaSwitch");
  expect(schemas[0].events).toEqual(["change", "input"]);
  expect(schemas[0].slots).toEqual(["", "hint"]);
});

test("registry maps tag -> schema with normalized prop types", () => {
  const sw = registry(MANIFEST).get("wa-switch");
  expect(sw).toBeTruthy();
  expect(sw.props.find((p) => p.name === "checked").ty).toBe("Bool");
  expect(sw.props.find((p) => p.name === "size").ty).toEqual({
    Enum: ["small", "medium", "large"],
  });
  expect(sw.props.find((p) => p.name === "name").ty).toEqual({
    Optional: "Str",
  });
});
