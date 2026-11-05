import { normalize_readiness } from "../../dist/pkg/spaday";
import { interpret } from "./actions";
import { attachController, componentsReady } from "./lifecycle";
import {
  evalExpr,
  exprFields,
  exprScopes,
  type Scope,
  type Store,
} from "./signals";

export interface Effect {
  watch: string[];
  initial?: boolean;
  action: unknown;
}

export interface Readiness {
  when: unknown;
  active?: unknown;
  error?: unknown;
  result?: string | null;
  elements?: string[];
  timeout?: number;
}

type ResolvedReadiness = Required<Omit<Readiness, "result">> &
  Pick<Readiness, "result">;

type Cleanup = () => void;
type Behavior = { start: Cleanup; stop: Cleanup };
const behaviors = new WeakMap<Element, Map<string, Cleanup>>();

/** Start after insertion; dispose on runtime teardown or native DOM removal. Same-turn moves survive. */
function replace(el: Element, key: string, setup?: () => Behavior): void {
  let entries = behaviors.get(el);
  entries?.get(key)?.();
  if (!setup) return;
  if (!entries) behaviors.set(el, (entries = new Map()));
  let started = false;
  let disposed = false;
  let behavior: Behavior;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let dispose: Cleanup;
  const observer = new MutationObserver((records) => {
    // A mount can be removed before its first microtask has observed connection.
    if (
      !el.isConnected &&
      records.some((record) =>
        [...record.removedNodes].some(
          (node) => node === el || node.contains(el),
        ),
      )
    )
      dispose();
    else check();
  });
  let observedRoots: Node[] = [];
  function check() {
    if (disposed) return;
    if (el.isConnected) {
      // Reparenting into another shadow tree changes which removal mutations are visible.
      const roots: Node[] = [el.ownerDocument];
      for (
        let root = el.getRootNode();
        root instanceof ShadowRoot;
        root = root.host.getRootNode()
      )
        roots.push(root);
      if (
        roots.length !== observedRoots.length ||
        roots.some((root, index) => root !== observedRoots[index])
      ) {
        observer.disconnect();
        for (const root of roots)
          observer.observe(root, { childList: true, subtree: true });
        observedRoots = roots;
      }
      if (started) return;
      started = true;
      clearTimeout(timer);
      behavior.start();
    } else if (started) {
      dispose();
    } else if (timer === undefined) {
      // Also catch a detached mount inserted into an existing shadow root later.
      timer = setTimeout(() => {
        timer = undefined;
        check();
      }, 100);
    }
  }
  dispose = attachController(el, key, () => () => {
    disposed = true;
    observer.disconnect();
    clearTimeout(timer);
    behavior.stop();
    entries!.delete(key);
  });
  entries.set(key, dispose);
  behavior = setup();
  observer.observe(el.ownerDocument, { childList: true, subtree: true });
  queueMicrotask(check);
}

export function wireEffect(
  el: Element,
  name: string,
  spec: Effect | null,
  store?: Store,
  scope?: Scope,
): void {
  replace(
    el,
    `effect:${name}`,
    spec && store
      ? () => {
          let disposed = false;
          let queued = false;
          let dirty = false;
          let current: AbortController | undefined;
          const schedule = () => {
            dirty = true;
            current?.abort(); // invalidate results before a queued promise continuation can write
            if (disposed || queued) return;
            queued = true;
            queueMicrotask(() => {
              queued = false;
              if (disposed || !el.isConnected) return;
              dirty = false;
              current = new AbortController();
              interpret(spec.action, {
                event: new CustomEvent("spaday:effect", { detail: { name } }),
                currentTarget: el,
                store,
                scope,
                signal: current.signal,
              });
            });
          };
          const unsubscribes = [...new Set(spec.watch)].map((field) =>
            store.subscribe(field, schedule),
          );
          return {
            start: () => {
              if (spec.initial || dirty) schedule();
            },
            stop: () => {
              disposed = true;
              current?.abort();
              unsubscribes.forEach((unsubscribe) => unsubscribe());
            },
          };
        }
      : undefined,
  );
}

export function wireReadiness(
  el: Element,
  input: Readiness | null,
  store?: Store,
  scope?: Scope,
): void {
  const spec: ResolvedReadiness | null = input
    ? JSON.parse(normalize_readiness(JSON.stringify(input)))
    : null;
  replace(
    el,
    "readiness",
    spec
      ? () => {
          let disposed = false;
          let active = false;
          let components = false;
          let componentError: string | null = null;
          let timedOut = false;
          let timer: ReturnType<typeof setTimeout> | undefined;
          let cycle: AbortController | undefined;
          let status = "";
          let lastError: string | null = null;
          const clearTimer = () => {
            clearTimeout(timer);
            timer = undefined;
          };
          const publish = (next: string, error: string | null = null) => {
            if (status === next && lastError === error) return;
            status = next;
            lastError = error;
            const detail = { status, error };
            if (spec.result) store?.set(spec.result, detail);
            if (
              !disposed &&
              status === detail.status &&
              lastError === detail.error
            )
              el.dispatchEvent(
                new CustomEvent("spaday:readiness", { detail, bubbles: true }),
              );
          };
          const update = () => {
            if (disposed || !el.isConnected) return;
            if (!evalExpr(spec.active, store, scope)) {
              active = false;
              cycle?.abort();
              clearTimer();
              timedOut = false;
              publish("idle");
              return;
            }
            if (!active) {
              active = true;
              components = false;
              componentError = null;
              const running = (cycle = new AbortController());
              const cancelled = new Promise<void>((resolve) =>
                running.signal.addEventListener("abort", () => resolve(), {
                  once: true,
                }),
              );
              Promise.race([
                componentsReady(new WeakRef(el), spec.elements),
                cancelled,
              ]).then(
                () => {
                  if (running.signal.aborted || disposed) return;
                  components = true;
                  update();
                },
                (error) => {
                  if (running.signal.aborted || disposed) return;
                  componentError = String(error);
                  update();
                },
              );
            }
            const error = evalExpr(spec.error, store, scope) || componentError;
            const ready = components && !!evalExpr(spec.when, store, scope);
            if (ready && !error) {
              clearTimer();
              timedOut = false;
              publish("ready");
            } else {
              if (timer === undefined && !timedOut)
                timer = setTimeout(() => {
                  timer = undefined;
                  timedOut = true;
                  update();
                }, spec.timeout);
              publish(
                error || timedOut ? "error" : "loading",
                error
                  ? String(error)
                  : timedOut
                    ? "Application readiness timed out"
                    : null,
              );
            }
          };
          const expressions = [spec.when, spec.active, spec.error];
          const fields = new Set(
            expressions.flatMap((expr) => [...exprFields(expr)]),
          );
          const scopes = new Set(
            expressions.flatMap((expr) => [...exprScopes(expr, scope)]),
          );
          const unsubscribes = [
            ...(store
              ? [...fields].map((field) => store.subscribe(field, update))
              : []),
            ...[...scopes].map((scope) => scope.subscribe(update)),
          ];
          return {
            start: update,
            stop: () => {
              disposed = true;
              cycle?.abort();
              clearTimer();
              unsubscribes.forEach((unsubscribe) => unsubscribe());
            },
          };
        }
      : undefined,
  );
}
