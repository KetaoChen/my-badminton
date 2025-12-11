import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for jsdom environment
class ResizeObserverMock implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined" && !("ResizeObserver" in window)) {
  (
    window as unknown as { ResizeObserver: typeof ResizeObserverMock }
  ).ResizeObserver = ResizeObserverMock;
}
