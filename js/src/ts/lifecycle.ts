type Cleanup = () => void;
const controllers = new WeakMap<Element, Map<unknown, Cleanup>>();

/** Attach once per element/key. Dispose before attaching a replacement controller. */
export function attachController(
  root: Element,
  key: unknown,
  setup: () => Cleanup,
): Cleanup {
  let attached = controllers.get(root);
  if (!attached) controllers.set(root, (attached = new Map()));
  const existing = attached.get(key);
  if (existing) return existing;
  const cleanup = setup();
  let active = true;
  const dispose = () => {
    if (!active) return;
    active = false;
    attached!.delete(key);
    cleanup();
  };
  attached.set(key, dispose);
  return dispose;
}

export function disposeControllers(root: Element): void {
  for (const dispose of [...(controllers.get(root)?.values() ?? [])]) {
    try {
      dispose();
    } catch (error) {
      console.error("spaday: controller cleanup failed", error);
    }
  }
  controllers.delete(root);
}

async function componentsReady(
  reference: WeakRef<Element>,
  elements: readonly string[],
): Promise<void> {
  await Promise.all(elements.map((name) => customElements.whenDefined(name)));
  const root = reference.deref();
  if (!root) return;
  const required = new Set(elements);
  await Promise.all(
    [root, ...root.querySelectorAll("*")]
      .filter((el) => required.has(el.localName))
      .map(
        (el) =>
          (el as Element & { updateComplete?: Promise<unknown> })
            .updateComplete,
      ),
  );
}

/** Wait only for declared component dependencies, not arbitrary tags or application data. */
export async function whenReady(
  root: Element,
  elements: readonly string[] = [],
  timeout = 10000,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout>;
  let cancel: Cleanup = () => {};
  const stopped = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("spaday: component readiness timed out")),
      timeout,
    );
    cancel = attachController(
      root,
      Symbol(),
      () => () => reject(new Error("spaday: root disposed before readiness")),
    );
  });
  try {
    await Promise.race([componentsReady(new WeakRef(root), elements), stopped]);
  } finally {
    clearTimeout(timer!);
    cancel();
  }
}
