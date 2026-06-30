import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRealtimeEvents } from "../hooks/useRealtimeEvents";

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public readonly url: string) {
    MockWebSocket.instances.push(this);
  }

  emitOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  emitMessage(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({} as CloseEvent);
  }

  static reset(): void {
    MockWebSocket.instances = [];
  }
}

describe("useRealtimeEvents", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    MockWebSocket.reset();
  });

  it("surfaces malformed websocket payloads instead of swallowing them", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => void 0);

    const { result } = renderHook(() => useRealtimeEvents());
    expect(MockWebSocket.instances).toHaveLength(1);
    const socket = MockWebSocket.instances[0];

    await act(async () => {
      socket.emitOpen();
    });

    await waitFor(() => expect(result.current.status).toBe("connected"));

    socket.emitMessage("{not-json");

    await waitFor(() => {
      expect(result.current.error).toMatch(/JSON|Unexpected token/);
    });

    expect(consoleError).toHaveBeenCalled();
    expect(result.current.events).toHaveLength(0);
  });
});
