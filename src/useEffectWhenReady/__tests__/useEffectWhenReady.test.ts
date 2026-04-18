import { renderHook } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { useEffectWhenReady } from "../useEffectWhenReady";

interface TestUser {
  id: string;
}

interface TestSocket {
  emit: (event: string, payload: string) => void;
}

describe("useEffectWhenReady", () => {
  it("should narrow deps to non-null values", () => {
    const user: TestUser = { id: "user-1" };
    const emit = vi.fn<(event: string, payload: string) => void>();
    const socket: TestSocket = {
      emit,
    };
    const deps: [TestUser | null, TestSocket | null] = [user, socket];

    renderHook(() =>
      useEffectWhenReady(([readyUser, readySocket]) => {
        expectTypeOf(readyUser).toEqualTypeOf<TestUser>();

        readySocket.emit("identify", readyUser.id);
      }, deps)
    );

    expect(emit).toHaveBeenCalledWith("identify", "user-1");
  });
});
