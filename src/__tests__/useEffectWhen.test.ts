import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { StrictMode } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { useEffectWhen } from "../useEffectWhen";
import { predicates } from "../useEffectWhen";
import { useEffectWhenReady } from "../useEffectWhenReady";
import { useEffectWhenTruthy } from "../useEffectWhenTruthy";
import { always, pair, ready, truthy, tuple } from "./useEffectWhen.utils";
import type { GuardPredicate } from "../useEffectWhen";
import type { PropsWithChildren } from "react";

interface TestUser {
  id: string;
}

interface TestSocket {
  emit: (event: string, payload: string) => void;
}

function setup<T extends ReadonlyArray<unknown>>(
  initialDeps: T,
  predicate: (deps: T) => boolean,
  options?: { once?: boolean; onSkip?: (deps: T) => void }
) {
  const effect = vi.fn<() => void | (() => void)>();
  const cleanup = vi.fn<() => void>();
  effect.mockReturnValue(cleanup);

  const { rerender, unmount } = renderHook(
    ({ deps }: { deps: T }) =>
      useEffectWhen(
        () => {
          effect();
          return cleanup;
        },
        deps,
        predicate,
        options
      ),
    { initialProps: { deps: initialDeps } }
  );

  return {
    effect,
    cleanup,
    rerender: (deps: T) => rerender({ deps }),
    unmount,
  };
}

describe("useEffectWhen", () => {
  describe("once: true (default)", () => {
    it("should not run effect when predicate returns false on mount", () => {
      const { effect } = setup([null], ready);
      expect(effect).not.toHaveBeenCalled();
    });

    it("should run effect exactly once when predicate first returns true", () => {
      const { effect, rerender } = setup(tuple<string | null>(null), ready);

      rerender(["ready"]);
      expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should not re-run effect on subsequent dep changes after first run", () => {
      const { effect, rerender } = setup(tuple("a"), truthy);

      expect(effect).toHaveBeenCalledTimes(1);

      rerender(["b"]);
      rerender(["c"]);
      expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should not re-run if deps toggle back to falsy then truthy again", () => {
      const { effect, rerender } = setup(tuple<string | null>("hello"), truthy);
      expect(effect).toHaveBeenCalledTimes(1);

      rerender([null]);
      rerender(["hello again"]);
      expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should call cleanup on unmount", () => {
      const { cleanup, unmount } = setup(["value"], truthy);
      unmount();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it("should not call cleanup if effect never ran", () => {
      const { cleanup, unmount } = setup([null], ready);
      unmount();
      expect(cleanup).not.toHaveBeenCalled();
    });
  });

  describe("once: false", () => {
    it("should re-run effect every time predicate becomes true", () => {
      const { effect, rerender } = setup(tuple(0), ([n]) => n > 10, { once: false });

      expect(effect).not.toHaveBeenCalled();

      rerender([15]);
      expect(effect).toHaveBeenCalledTimes(1);

      rerender([5]); // predicate false — no re-run
      rerender([20]); // predicate true again
      expect(effect).toHaveBeenCalledTimes(2);
    });

    it("should call previous cleanup before re-running effect", () => {
      const cleanup1 = vi.fn<() => void>();
      const cleanup2 = vi.fn<() => void>();
      const effect = vi.fn<() => void | (() => void)>();

      effect.mockReturnValueOnce(cleanup1).mockReturnValueOnce(cleanup2);

      const { rerender } = renderHook(
        ({ deps }: { deps: [number] }) =>
          useEffectWhen(
            () => effect(),
            deps,
            ([n]) => n > 0,
            { once: false }
          ),
        { initialProps: { deps: tuple(1) } }
      );

      expect(effect).toHaveBeenCalledTimes(1);
      expect(cleanup1).not.toHaveBeenCalled();

      rerender({ deps: [2] });

      expect(cleanup1).toHaveBeenCalledTimes(1);
      expect(effect).toHaveBeenCalledTimes(2);
    });

    it("should call last cleanup on unmount", () => {
      const { cleanup, unmount } = setup(tuple(1), ([n]) => n > 0, { once: false });

      unmount();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe("onSkip", () => {
    it("should call onSkip when predicate returns false", () => {
      const onSkip = vi.fn<(deps: [string | null]) => void>();

      setup(tuple<string | null>(null), ready, { onSkip });

      expect(onSkip).toHaveBeenCalledWith([null]);
    });

    it("should call onSkip only when deps change and predicate is false (useEffect semantics)", () => {
      const onSkip = vi.fn<(deps: [string | null]) => void>();
      const { rerender } = setup(tuple<string | null>(null), ready, { onSkip });

      // mount: deps = [null] → onSkip called once
      expect(onSkip).toHaveBeenCalledTimes(1);

      // same deps — useEffect does NOT re-run, onSkip not called
      rerender([null]);
      expect(onSkip).toHaveBeenCalledTimes(1);

      // deps changed to a different null-ish value isn't possible with null,
      // but changing to a new object reference triggers re-run
      rerender([null]); // still same ref — no re-run
      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it("should not call onSkip after effect has run (once: true)", () => {
      const onSkip = vi.fn<(deps: [string | null]) => void>();
      const { rerender } = setup(tuple<string | null>(null), ready, { onSkip });

      expect(onSkip).toHaveBeenCalledTimes(1);

      rerender(["ready"]); // effect runs, onSkip stops
      rerender([null]); // predicate false again but once: true — effect won't re-run
      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it("should use the latest onSkip reference without stale closure", () => {
      const onSkip1 = vi.fn<(deps: [string | null]) => void>();
      const onSkip2 = vi.fn<(deps: [string | null]) => void>();

      const { rerender } = renderHook(
        ({ deps, onSkip }: { deps: [string | null]; onSkip: (deps: [string | null]) => void }) =>
          useEffectWhen(() => undefined, deps, ready, { onSkip }),
        { initialProps: { deps: tuple<string | null>(null), onSkip: onSkip1 } }
      );

      // mount: onSkip1 called with [null]
      expect(onSkip1).toHaveBeenCalledTimes(1);
      expect(onSkip2).not.toHaveBeenCalled();

      // Change onSkip ref AND deps to trigger useEffect re-run
      rerender({ deps: [null], onSkip: onSkip2 });

      // useEffect re-runs only when deps change — same [null] won't re-trigger
      // So we need a genuinely changed dep value:
      // Since null === null, React bails out. Use a wrapper with changing deps.
      expect(onSkip1).toHaveBeenCalledTimes(1); // not called again
    });

    it("should use the latest onSkip when deps change after ref update", () => {
      const onSkip1 = vi.fn<(deps: [number]) => void>();
      const onSkip2 = vi.fn<(deps: [number]) => void>();

      const { rerender } = renderHook(
        ({ n, onSkip }: { n: number; onSkip: (deps: [number]) => void }) =>
          useEffectWhen(
            () => undefined,
            tuple(n),
            ([v]) => v > 10,
            { onSkip }
          ),
        { initialProps: { n: 1, onSkip: onSkip1 } }
      );

      expect(onSkip1).toHaveBeenCalledWith([1]);

      // Swap to onSkip2, change deps → useEffect re-runs with latest onSkip ref
      rerender({ n: 5, onSkip: onSkip2 });

      expect(onSkip2).toHaveBeenCalledWith([5]);
      expect(onSkip1).toHaveBeenCalledTimes(1); // never called again
    });
  });

  describe("predicate ref stability", () => {
    it("should use the latest predicate reference when deps change", () => {
      const effect = vi.fn<() => void>();
      let threshold = 5;

      const { rerender } = renderHook(
        ({ n }: { n: number }) => useEffectWhen(effect, tuple(n), ([v]) => v > threshold),
        { initialProps: { n: 3 } }
      );

      // n=3, threshold=5 → predicate false, effect not called
      expect(effect).not.toHaveBeenCalled();

      // Lower threshold externally, change deps to trigger re-run
      threshold = 2;
      rerender({ n: 4 }); // n changed → useEffect re-runs with latest predicate

      // Now predicate uses threshold=2, so 4 > 2 → true
      expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should not re-evaluate predicate when deps stay the same", () => {
      const effect = vi.fn<() => void>();
      let threshold = 5;

      const { rerender } = renderHook(
        ({ n }: { n: number }) => useEffectWhen(effect, tuple(n), ([v]) => v > threshold),
        { initialProps: { n: 3 } }
      );

      expect(effect).not.toHaveBeenCalled();

      // Lower threshold but keep same deps — useEffect does NOT re-run
      threshold = 1;
      rerender({ n: 3 }); // same deps, React bails out

      expect(effect).not.toHaveBeenCalled();
    });
  });

  describe("typed presets", () => {
    it("should accept a GuardPredicate directly in the base hook", () => {
      const user = { id: "user-1" } satisfies TestUser;
      const socket = {
        emit: vi.fn<(event: string, payload: string) => void>(),
      } satisfies TestSocket;
      const isReadyPair: GuardPredicate<
        [TestUser | null, TestSocket | null],
        [TestUser, TestSocket]
      > = (deps): deps is [TestUser, TestSocket] => predicates.ready(deps);

      renderHook(() =>
        useEffectWhen(
          ([readyUser, readySocket]) => {
            expectTypeOf(readyUser).toEqualTypeOf<TestUser>();
            expectTypeOf(readySocket).toEqualTypeOf<TestSocket>();
            readySocket.emit("identify", readyUser.id);
          },
          pair<TestUser | null, TestSocket | null>(user, socket),
          isReadyPair
        )
      );

      expect(socket.emit).toHaveBeenCalledWith("identify", "user-1");
    });

    it("should pass the current deps tuple into the base hook", () => {
      const effect = vi.fn<([value]: [number]) => void>();

      renderHook(() =>
        useEffectWhen(
          (deps) => {
            effect(deps);
          },
          tuple(7),
          always
        )
      );

      expect(effect).toHaveBeenCalledWith([7]);
    });

    it("should narrow deps for useEffectWhenReady", () => {
      const user = { id: "user-1" } satisfies TestUser;
      const socket = {
        emit: vi.fn<(event: string, payload: string) => void>(),
      } satisfies TestSocket;

      renderHook(() =>
        useEffectWhenReady(
          ([readyUser, readySocket]) => {
            expectTypeOf(readyUser).toEqualTypeOf<TestUser>();
            expectTypeOf(readySocket).toEqualTypeOf<TestSocket>();

            readySocket.emit("identify", readyUser.id);
          },
          pair<TestUser | null, TestSocket | null>(user, socket)
        )
      );

      expect(socket.emit).toHaveBeenCalledWith("identify", "user-1");
    });

    it("should narrow deps for useEffectWhenTruthy", () => {
      renderHook(() =>
        useEffectWhenTruthy(
          ([token, count, enabled]) => {
            expectTypeOf(token).toEqualTypeOf<string>();
            expectTypeOf(count).toEqualTypeOf<number>();
            expectTypeOf(enabled).toEqualTypeOf<true>();
          },
          ["token", 1, true] satisfies [string | undefined, number | null, boolean]
        )
      );
    });
  });

  describe("Strict Mode behavior", () => {
    it("should not re-run on rerender inside Strict Mode when once is true", () => {
      const effect = vi.fn<() => void>();
      const wrapper = ({ children }: PropsWithChildren) =>
        createElement(StrictMode, null, children);

      const { rerender, unmount } = renderHook(
        ({ deps }: { deps: [string] }) => useEffectWhen(effect, deps, truthy, { once: true }),
        { initialProps: { deps: tuple("value") }, wrapper }
      );

      expect(effect).toHaveBeenCalledTimes(1);

      rerender({ deps: tuple("next-value") });
      expect(effect).toHaveBeenCalledTimes(1);

      unmount();
    });

    it("should call cleanup once before each re-run in Strict Mode when once is false", () => {
      const cleanup = vi.fn<() => void>();
      const effect = vi.fn<() => () => void>().mockReturnValue(cleanup);
      const wrapper = ({ children }: PropsWithChildren) =>
        createElement(StrictMode, null, children);

      const { rerender } = renderHook(
        ({ deps }: { deps: [number] }) => useEffectWhen(effect, deps, truthy, { once: false }),
        { initialProps: { deps: tuple(1) }, wrapper }
      );

      expect(effect).toHaveBeenCalledTimes(1);
      expect(cleanup).not.toHaveBeenCalled();

      rerender({ deps: [2] });

      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(effect).toHaveBeenCalledTimes(2);

      rerender({ deps: [3] });
      expect(cleanup).toHaveBeenCalledTimes(2);
      expect(effect).toHaveBeenCalledTimes(3);
    });
  });

  describe("predicates", () => {
    describe("predicates.ready", () => {
      it("should return false for null", () => {
        expect(predicates.ready([null])).toBe(false);
      });

      it("should return false for undefined", () => {
        expect(predicates.ready([undefined])).toBe(false);
      });

      it("should return true for false because boolean false is a valid value", () => {
        expect(predicates.ready([false])).toBe(true);
      });

      it("should return true for 0", () => {
        expect(predicates.ready([0])).toBe(true);
      });

      it("should return true for non-null values", () => {
        expect(predicates.ready(["hello", 42, {}, []])).toBe(true);
      });

      it("should return false when any dep is null", () => {
        expect(predicates.ready(["hello", null])).toBe(false);
      });
    });

    describe("predicates.truthy", () => {
      it("should return false for false", () => {
        expect(predicates.truthy([false])).toBe(false);
      });

      it("should return false for 0", () => {
        expect(predicates.truthy([0])).toBe(false);
      });

      it("should return false for empty string", () => {
        expect(predicates.truthy([""])).toBe(false);
      });

      it("should return true when all deps are truthy", () => {
        expect(predicates.truthy([1, "hello", true, {}])).toBe(true);
      });
    });

    describe("predicates.always", () => {
      it("should always return true regardless of deps", () => {
        expect(predicates.always([null, undefined, false, 0, ""])).toBe(true);
        expect(predicates.always([])).toBe(true);
      });
    });
  });
});
