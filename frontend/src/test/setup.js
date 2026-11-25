import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

const hasDom = typeof window !== "undefined";

if (hasDom) {
  // jsdom has no ResizeObserver (Recharts needs it) or scrollTo.
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverStub;
  window.scrollTo = () => {};
}

afterEach(() => {
  if (!hasDom) return; // node-environment tests (e.g. file scans) have no DOM to reset
  cleanup();
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});
