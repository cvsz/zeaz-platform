import { afterEach, vi } from "vitest";

globalThis.jest = vi;

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
