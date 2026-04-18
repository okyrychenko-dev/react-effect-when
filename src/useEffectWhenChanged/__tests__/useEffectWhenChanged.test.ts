import { renderHook } from "@testing-library/react";
import { StrictMode, createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { useEffectWhenChanged } from "..";
import type { PropsWithChildren } from "react";

function tuple<T>(value: T): [T] {
  return [value];
}

describe("useEffectWhenChanged", () => {
  it("should not run on initial mount", () => {
    const effect = vi.fn<() => void>();

    renderHook(() => useEffectWhenChanged(effect, tuple("initial")));

    expect(effect).not.toHaveBeenCalled();
  });

  it("should run when deps change after mount", () => {
    const effect = vi.fn<() => void>();

    const { rerender } = renderHook(
      ({ deps }: { deps: [string] }) => useEffectWhenChanged(effect, deps),
      { initialProps: { deps: tuple("initial") } }
    );

    rerender({ deps: tuple("next") });

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("should pass the current deps tuple into the effect", () => {
    const effect = vi.fn<([value]: [number]) => void>();

    const { rerender } = renderHook(
      ({ deps }: { deps: [number] }) => useEffectWhenChanged(effect, deps),
      { initialProps: { deps: tuple(1) } }
    );

    rerender({ deps: tuple(2) });

    expect(effect).toHaveBeenCalledWith([2]);
  });

  it("should not run when deps stay the same", () => {
    const effect = vi.fn<() => void>();

    const { rerender } = renderHook(
      ({ value }: { value: string }) => useEffectWhenChanged(effect, tuple(value)),
      { initialProps: { value: "same" } }
    );

    rerender({ value: "same" });

    expect(effect).not.toHaveBeenCalled();
  });

  it("should call previous cleanup before the next run", () => {
    const cleanup1 = vi.fn<() => void>();
    const cleanup2 = vi.fn<() => void>();
    const effect = vi.fn<() => void | (() => void)>();

    effect.mockReturnValueOnce(cleanup1).mockReturnValueOnce(cleanup2);

    const { rerender } = renderHook(
      ({ deps }: { deps: [number] }) => useEffectWhenChanged(() => effect(), deps),
      { initialProps: { deps: tuple(1) } }
    );

    rerender({ deps: tuple(2) });
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup1).not.toHaveBeenCalled();

    rerender({ deps: tuple(3) });
    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("should call cleanup on unmount after the effect has run", () => {
    const cleanup = vi.fn<() => void>();
    const effect = vi.fn<() => () => void>().mockReturnValue(cleanup);

    const { rerender, unmount } = renderHook(
      ({ deps }: { deps: [number] }) => useEffectWhenChanged(effect, deps),
      { initialProps: { deps: tuple(1) } }
    );

    rerender({ deps: tuple(2) });
    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("should not call cleanup on unmount if deps never changed", () => {
    const cleanup = vi.fn<() => void>();
    const effect = vi.fn<() => () => void>().mockReturnValue(cleanup);

    const { unmount } = renderHook(() => useEffectWhenChanged(effect, tuple(1)));

    unmount();

    expect(effect).not.toHaveBeenCalled();
    expect(cleanup).not.toHaveBeenCalled();
  });

  it("should run once per changed update", () => {
    const effect = vi.fn<() => void>();

    const { rerender } = renderHook(
      ({ deps }: { deps: [number] }) => useEffectWhenChanged(effect, deps),
      { initialProps: { deps: tuple(1) } }
    );

    rerender({ deps: tuple(2) });
    rerender({ deps: tuple(3) });
    rerender({ deps: tuple(4) });

    expect(effect).toHaveBeenCalledTimes(3);
  });

  it("should stay skipped across Strict Mode remounts and run on the first real update", () => {
    const effect = vi.fn<() => void>();
    const wrapper = ({ children }: PropsWithChildren) => createElement(StrictMode, null, children);

    const { rerender } = renderHook(
      ({ deps }: { deps: [string] }) => useEffectWhenChanged(effect, deps),
      { initialProps: { deps: tuple("initial") }, wrapper }
    );

    expect(effect).not.toHaveBeenCalled();

    rerender({ deps: tuple("next") });

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("should stay skipped in Strict Mode when the replayed setup sees the same deps", () => {
    const effect = vi.fn<() => void>();
    const wrapper = ({ children }: PropsWithChildren) => createElement(StrictMode, null, children);

    renderHook(() => useEffectWhenChanged(effect, tuple("initial")), { wrapper });

    expect(effect).not.toHaveBeenCalled();
  });
});
