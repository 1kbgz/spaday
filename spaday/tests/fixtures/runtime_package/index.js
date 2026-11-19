import { registerHandler } from "@1kbgz/spaday";

registerHandler("probe", (event, element) => {
  element.textContent = "handled";
});
