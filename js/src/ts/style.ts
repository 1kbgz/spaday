/** Runtime styles use the same CSP nonce as the host bootstrap. */
export function createStyle(): HTMLStyleElement {
  const style = document.createElement("style");
  const nonce =
    document.querySelector<HTMLScriptElement>("script[nonce]")?.nonce;
  if (nonce) style.nonce = nonce;
  return style;
}
