import { attachController } from "./lifecycle";

export interface FormOptions<T> {
  /** Return JSON-compatible draft values, excluding UI-only metadata. */
  read: () => T;
  /** Restore every control, even when a backing Store already holds the same value. */
  write: (value: T) => void;
  revealInvalid?: (control: HTMLElement) => void | Promise<void>;
  guard?: boolean;
}

const forms = new WeakMap<HTMLFormElement, FormController<unknown>>();
const fingerprint = (value: unknown) =>
  JSON.stringify(value, (_, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );

export interface FormController<T> {
  readonly dirty: boolean;
  readonly status: "idle" | "submitting" | "saved" | "failed";
  begin(): FormSubmission<T>;
  commit(saved: T): void;
  reset(): void;
  dispose(): void;
}

export interface FormSubmission<T> {
  readonly value: T;
  commit(saved?: T): boolean;
  fail(): boolean;
}

/** Native submission is unchanged. Only commit() advances the saved baseline. */
export function createFormController<T>(
  form: HTMLFormElement,
  options: FormOptions<T>,
): FormController<T> {
  const existing = forms.get(form);
  if (existing) return existing as FormController<T>;
  let baseline = structuredClone(options.read());
  let submission = 0;
  let status: FormController<T>["status"] = "idle";
  let disposed = false;
  let revealing = false;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  const controller: FormController<T> = {
    get dirty() {
      return fingerprint(options.read()) !== fingerprint(baseline);
    },
    get status() {
      return status;
    },
    begin() {
      const id = ++submission;
      const snapshot = structuredClone(options.read());
      status = "submitting";
      return {
        value: structuredClone(snapshot),
        commit(saved = snapshot) {
          if (disposed || id !== submission || status !== "submitting")
            return false;
          controller.commit(saved);
          return true;
        },
        fail() {
          if (disposed || id !== submission || status !== "submitting")
            return false;
          status = "failed";
          return true;
        },
      };
    },
    commit(saved) {
      baseline = structuredClone(saved);
      submission++;
      status = "saved";
    },
    reset() {
      options.write(structuredClone(baseline));
      if (status !== "submitting") status = "idle";
    },
    dispose: () => {},
  };
  const unload = (event: BeforeUnloadEvent) => {
    if (controller.dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  };
  const invalid = (event: Event) => {
    if (!options.revealInvalid || !(event.target instanceof HTMLElement))
      return;
    event.preventDefault();
    if (revealing) return;
    revealing = true;
    const target = event.target;
    Promise.resolve()
      .then(() => {
        if (!disposed) return options.revealInvalid!(target);
      })
      .then(() => {
        if (!disposed && target.isConnected) target.focus();
      })
      .catch((error) =>
        console.error("spaday: reveal invalid control failed", error),
      )
      .finally(() => {
        revealing = false;
      });
  };
  const reset = (event: Event) => {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      if (!disposed && !event.defaultPrevented) controller.reset();
    }, 0);
  };
  form.addEventListener("invalid", invalid, true);
  form.addEventListener("reset", reset);
  if (options.guard !== false) window.addEventListener("beforeunload", unload);
  controller.dispose = attachController(form, "spaday:form", () => () => {
    disposed = true;
    clearTimeout(resetTimer);
    form.removeEventListener("invalid", invalid, true);
    form.removeEventListener("reset", reset);
    window.removeEventListener("beforeunload", unload);
    forms.delete(form);
  });
  forms.set(form, controller as FormController<unknown>);
  return controller;
}
