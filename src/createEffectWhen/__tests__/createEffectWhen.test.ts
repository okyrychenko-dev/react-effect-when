import { renderHook } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { createEffectWhen } from "..";
import { predicates } from "../../useEffectWhen";
import { tuple } from "./createEffectWhen.utils";
import type { ReadyDeps } from "../../useEffectWhen";
import type { DependencyList } from "react";

interface TestUser {
  id: string;
}

const truthy = (deps: DependencyList): boolean => predicates.truthy(deps);
const readyPair = (
  deps: [string | null, number | null]
): deps is ReadyDeps<[string | null, number | null]> => predicates.ready(deps);

describe("createEffectWhen", () => {
  describe("basic behavior", () => {
    it("should return a hook that runs when the predicate is satisfied", () => {
      const useEffectWhenPositive = createEffectWhen<[number]>(([n]) => n > 0);
      const effect = vi.fn();

      renderHook(() => useEffectWhenPositive(effect, tuple(5)));

      expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should return a hook that does not run when the predicate is not satisfied", () => {
      const useEffectWhenPositive = createEffectWhen<[number]>(([n]) => n > 0);
      const effect = vi.fn();

      renderHook(() => useEffectWhenPositive(effect, tuple(-1)));

      expect(effect).not.toHaveBeenCalled();
    });

    it("should pass the current deps tuple into the effect", () => {
      const useEffectWhenPositive = createEffectWhen<[number]>(([n]) => n > 0);
      const effect = vi.fn<([n]: [number]) => void>();

      renderHook(() => useEffectWhenPositive(effect, tuple(42)));

      expect(effect).toHaveBeenCalledWith([42]);
    });
  });

  describe("options passthrough", () => {
    it("should pass once: false to the underlying hook", () => {
      const useEffectAboveThreshold = createEffectWhen<[number]>(([n]) => n > 10);
      const effect = vi.fn();

      const { rerender } = renderHook(
        ({ n }: { n: number }) => useEffectAboveThreshold(effect, tuple(n), { once: false }),
        { initialProps: { n: 15 } }
      );

      expect(effect).toHaveBeenCalledTimes(1);

      rerender({ n: 5 }); // predicate false — no run
      rerender({ n: 20 }); // predicate true again — re-runs
      expect(effect).toHaveBeenCalledTimes(2);
    });

    it("should call onSkip when predicate returns false", () => {
      const onSkip = vi.fn<(deps: [number]) => void>();
      const useEffectAboveZero = createEffectWhen<[number]>(([n]) => n > 0);

      renderHook(() => useEffectAboveZero(() => undefined, tuple(-1), { onSkip }));

      expect(onSkip).toHaveBeenCalledWith([-1]);
    });

    it("should run cleanup on unmount", () => {
      const cleanup = vi.fn();
      const useEffectWhenTruthy = createEffectWhen(truthy);

      const { unmount } = renderHook(() => useEffectWhenTruthy(() => cleanup, tuple("value")));

      unmount();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe("factory reuse", () => {
    it("should produce an independent hook instance per component", () => {
      const useEffectWhenReady = createEffectWhen<[string | null]>(([v]) => v !== null);

      const effect1 = vi.fn();
      const effect2 = vi.fn();

      renderHook(() => useEffectWhenReady(effect1, tuple<string | null>("a")));
      renderHook(() => useEffectWhenReady(effect2, tuple<string | null>(null)));

      expect(effect1).toHaveBeenCalledTimes(1);
      expect(effect2).not.toHaveBeenCalled();
    });
  });

  describe("guard predicate overload", () => {
    it("should narrow types with a guard predicate", () => {
      const user: TestUser = { id: "u1" };

      const isUserReady = (deps: [TestUser | null]): deps is [TestUser] => deps[0] !== null;

      const useEffectWhenUserReady = createEffectWhen<[TestUser | null], [TestUser]>(isUserReady);

      renderHook(() =>
        useEffectWhenUserReady(([readyUser]) => {
          expectTypeOf(readyUser).toEqualTypeOf<TestUser>();
        }, tuple<TestUser | null>(user))
      );
    });

    it("should work with predicates.ready for fully non-null deps", () => {
      const useEffectWhenBothReady = createEffectWhen<
        [string | null, number | null],
        [string, number]
      >(readyPair);

      const effect = vi.fn<([s, n]: [string, number]) => void>();

      renderHook(() => useEffectWhenBothReady(effect, ["hello", 42]));

      expect(effect).toHaveBeenCalledWith(["hello", 42]);
    });
  });
});
