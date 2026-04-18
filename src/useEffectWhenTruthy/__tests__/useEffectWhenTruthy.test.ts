import { renderHook } from "@testing-library/react";
import { describe, expectTypeOf, it } from "vitest";
import { useEffectWhenTruthy } from "../useEffectWhenTruthy";

describe("useEffectWhenTruthy", () => {
  it("should narrow deps to truthy values", () => {
    const deps: [string | undefined, number | null, boolean] = ["token", 1, true];

    renderHook(() =>
      useEffectWhenTruthy(([token, count, enabled]) => {
        expectTypeOf(token).toEqualTypeOf<string>();
        expectTypeOf(count).toEqualTypeOf<number>();
        expectTypeOf(enabled).toEqualTypeOf<true>();
      }, deps)
    );
  });
});
