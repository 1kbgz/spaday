// A spaday wrapper for Perspective's <perspective-workspace> — the "Mode B" recipe: spaday/transports
// does NOT carry the table data. Instead the element opens its OWN websocket to a Perspective server (the
// `ws_url`) and streams the bulk data over Perspective's protocol; spaday only syncs a small **config**
// (which server, which tables, and the workspace layout / per-viewer view config) over transports.
//
// Because the config is an ordinary transports-mirrored model, the server can **push** a new layout or
// view at any time: set `.config` again and the workspace re-`restore`s — not a one-time REST call. New
// tables are discovered by Perspective itself over its websocket; pushing config only changes the views.
//
// Self-contained bundle (Perspective client + viewer + workspace + datagrid + the viewer wasm inlined via
// esbuild's `binary` loader, and the theme CSS inlined via the `text` loader). Importing it defines
// <perspective-panel>.

import perspective from "@perspective-dev/client";
import perspective_viewer from "@perspective-dev/viewer";
import CLIENT_WASM from "@perspective-dev/viewer/dist/wasm/perspective-viewer.wasm"; // -> Uint8Array (binary loader)
import PRO from "@perspective-dev/viewer/dist/css/pro.css"; // -> string (text loader): the "Pro Light" theme
import PRO_DARK from "@perspective-dev/viewer/dist/css/pro-dark.css"; // "Pro Dark"
import WORKSPACE_CSS from "@perspective-dev/workspace/dist/css/workspace.css"; // the dock/tab layout styles
import "@perspective-dev/workspace"; // defines <perspective-workspace>
import "@perspective-dev/viewer-datagrid"; // registers the Datagrid plugin

export interface PerspectiveConfig {
  ws_url?: string; // where the workspace connects for data (absolute ws[s]:// or a same-origin path)
  tables?: string[]; // informational; the workspace discovers tables from the loaded client
  layout?: unknown; // a perspective-workspace layout (widgets + per-viewer view config); the pushable part
}

const ready = perspective_viewer.init_client(CLIENT_WASM); // one-time wasm init for the viewer/workspace
let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = [WORKSPACE_CSS, PRO, PRO_DARK].join("\n"); // themes must live in the document
  document.head.appendChild(style);
}

/** A same-origin path (`/perspective`) → an absolute ws URL; an absolute ws[s]:// URL is returned as-is. */
function wsUrl(url: string): string {
  if (/^wss?:\/\//.test(url)) return url;
  const scheme = location.protocol === "https:" ? "wss" : "ws";
  return `${scheme}://${location.host}${url.startsWith("/") ? "" : "/"}${url}`;
}

class PerspectivePanel extends HTMLElement {
  #workspace:
    | (HTMLElement & {
        load(c: unknown): Promise<void>;
        restore(l: unknown): Promise<void>;
        save(): Promise<unknown>;
      })
    | null = null;
  #config: PerspectiveConfig = {};
  #connectedUrl: string | null = null;
  #lastLayout: string | null = null; // last restored layout (JSON), to skip redundant restores
  #queue: Promise<unknown> = Promise.resolve(); // serialize applies so rapid pushes don't race restore()

  connectedCallback(): void {
    injectStyles();
    if (!this.#workspace) {
      this.style.display = this.style.display || "block";
      this.#workspace = document.createElement(
        "perspective-workspace",
      ) as never;
      this.appendChild(this.#workspace as HTMLElement);
    }
    this.#apply();
  }

  /** The transports-synced config. Re-setting it (a server push) re-applies — a new layout re-`restore`s. */
  set config(config: PerspectiveConfig) {
    this.#config = config || {};
    this.#apply();
  }
  get config(): PerspectiveConfig {
    return this.#config;
  }

  #apply(): void {
    const config = this.#config;
    this.#queue = this.#queue
      .catch(() => {})
      .then(async () => {
        await ready;
        const ws = this.#workspace;
        if (!ws) return; // not connected yet — connectedCallback will re-apply
        if (config.ws_url && config.ws_url !== this.#connectedUrl) {
          this.#connectedUrl = config.ws_url;
          const client = await perspective.websocket(wsUrl(config.ws_url)); // Perspective's own data socket
          await ws.load(client); // loads every table the server exposes; data streams over this socket
        }
        if (this.#connectedUrl && config.layout) {
          const key = JSON.stringify(config.layout);
          if (key !== this.#lastLayout) {
            this.#lastLayout = key; // only restore on a real change, so a reconnect's re-sent config doesn't
            await ws.restore(config.layout); // wipe a user's manual arrangement; a pushed new layout applies
          }
        }
      });
  }

  /** The current workspace layout (so an app can capture a user's arrangement to persist / push back). */
  async save(): Promise<unknown> {
    await this.#queue.catch(() => {});
    return this.#workspace?.save();
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("perspective-panel")
) {
  customElements.define("perspective-panel", PerspectivePanel);
}

export { PerspectivePanel };
