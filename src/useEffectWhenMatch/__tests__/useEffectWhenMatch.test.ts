import { renderHook } from "@testing-library/react";
import { type PropsWithChildren, StrictMode, createElement } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { matchPredicateFor, useEffectWhenMatch } from "..";
import { useEffectWhen } from "../../useEffectWhen";

interface QueryData {
  id: string;
}

interface QueryPending {
  status: "pending";
}

interface QueryError {
  status: "error";
  error: Error;
}

interface QuerySuccess {
  status: "success";
  data: QueryData;
}

type QueryResult = QueryPending | QueryError | QuerySuccess;

interface JobQueued {
  kind: "queued";
}

interface JobDone {
  kind: "done";
  output: string;
}

type Job = JobQueued | JobDone;

function queryResult(result: QueryResult): QueryResult {
  return result;
}

function jobResult(result: Job): Job {
  return result;
}

describe("useEffectWhenMatch", () => {
  it("should run and narrow deps when the field matches", () => {
    const track = vi.fn<(id: string) => void>();
    const query = queryResult({ status: "success", data: { id: "item-1" } });

    renderHook(() =>
      useEffectWhenMatch(
        ([result]) => {
          expectTypeOf(result.data).toEqualTypeOf<QueryData>();

          track(result.data.id);
        },
        [query],
        "status",
        "success"
      )
    );

    expect(track).toHaveBeenCalledWith("item-1");
  });

  it("should run and narrow deps when the field matches one of several values", () => {
    const track = vi.fn<(status: "error" | "success") => void>();
    const query = queryResult({ status: "error", error: new Error("Request failed") });

    renderHook(() =>
      useEffectWhenMatch(
        ([result]) => {
          expectTypeOf(result).toEqualTypeOf<QueryError | QuerySuccess>();

          track(result.status);
        },
        [query],
        "status",
        ["success", "error"] as const
      )
    );

    expect(track).toHaveBeenCalledWith("error");
  });

  it("should use array membership semantics for numeric discriminants", () => {
    const effect = vi.fn();
    const result = { code: Number.NaN };

    renderHook(() => useEffectWhenMatch(effect, [result], "code", [Number.NaN]));

    expect(effect).toHaveBeenCalledWith([result]);
  });

  it("should preserve scalar equality and array membership in bound matching", () => {
    interface NumericResult {
      code: number;
    }

    const matchNumber = matchPredicateFor<NumericResult>();
    const scalarEffect = vi.fn();
    const arrayEffect = vi.fn();
    const result: NumericResult = { code: Number.NaN };

    renderHook(() => {
      useEffectWhen(scalarEffect, [result], matchNumber("code", Number.NaN));
      useEffectWhen(arrayEffect, [result], matchNumber("code", [Number.NaN]));
    });

    expect(scalarEffect).not.toHaveBeenCalled();
    expect(arrayEffect).toHaveBeenCalledWith([result]);
  });

  it("should not run when the field does not match", () => {
    const track = vi.fn<(id: string) => void>();
    const query = queryResult({ status: "pending" });

    renderHook(() =>
      useEffectWhenMatch(([result]) => track(result.data.id), [query], "status", "success")
    );

    expect(track).not.toHaveBeenCalled();
  });

  it("should call onSkip with unnarrowed deps outside the matched values", () => {
    const query = queryResult({ status: "pending" });
    const onSkip = vi.fn<(deps: readonly [QueryResult]) => void>();

    renderHook(() =>
      useEffectWhenMatch(() => undefined, [query], "status", ["success", "error"], { onSkip })
    );

    expect(onSkip).toHaveBeenCalledWith([query]);
  });

  it("should call onSkip with unnarrowed deps outside a single matched value", () => {
    const query = queryResult({ status: "pending" });
    const onSkip = vi.fn<(deps: readonly [QueryResult]) => void>();

    renderHook(() => useEffectWhenMatch(() => undefined, [query], "status", "success", { onSkip }));

    expect(onSkip).toHaveBeenCalledWith([query]);
  });

  it("should never match an empty value array", () => {
    const effect = vi.fn<(deps: readonly [never]) => void>();
    const query = queryResult({ status: "success", data: { id: "item-1" } });

    renderHook(() => useEffectWhenMatch(effect, [query], "status", [] as const));

    expect(effect).not.toHaveBeenCalled();
  });

  it("should re-run when the field changes to a match with once: false", () => {
    const track = vi.fn<(id: string) => void>();

    const { rerender } = renderHook(
      ({ query }: { query: QueryResult }) =>
        useEffectWhenMatch(([result]) => track(result.data.id), [query], "status", "success", {
          once: false,
        }),
      { initialProps: { query: { status: "pending" } } }
    );

    expect(track).not.toHaveBeenCalled();

    rerender({ query: { status: "success", data: { id: "item-2" } } });
    expect(track).toHaveBeenCalledWith("item-2");

    rerender({ query: { status: "success", data: { id: "item-3" } } });
    expect(track).toHaveBeenCalledWith("item-3");
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("should re-run between different matching values with once: false", () => {
    const track = vi.fn<(status: "error" | "success") => void>();

    const { rerender } = renderHook(
      ({ query }: { query: QueryResult }) =>
        useEffectWhenMatch(
          ([result]) => track(result.status),
          [query],
          "status",
          ["success", "error"],
          { once: false }
        ),
      { initialProps: { query: queryResult({ status: "pending" }) } }
    );

    rerender({ query: { status: "success", data: { id: "item-2" } } });
    rerender({ query: { status: "error", error: new Error("Request failed") } });

    expect(track).toHaveBeenNthCalledWith(1, "success");
    expect(track).toHaveBeenNthCalledWith(2, "error");
  });

  it("should work with any discriminant field name, not just `status`", () => {
    const track = vi.fn<(output: string) => void>();
    const job = jobResult({ kind: "done", output: "result-1" });

    renderHook(() =>
      useEffectWhenMatch(
        ([result]) => {
          expectTypeOf(result.output).toEqualTypeOf<string>();

          track(result.output);
        },
        [job],
        "kind",
        "done"
      )
    );

    expect(track).toHaveBeenCalledWith("result-1");
  });

  describe("Strict Mode behavior", () => {
    it("should not re-run on rerender inside Strict Mode when once is true", () => {
      const track = vi.fn<(id: string) => void>();
      const wrapper = ({ children }: PropsWithChildren) =>
        createElement(StrictMode, null, children);

      const { rerender } = renderHook(
        ({ query }: { query: QueryResult }) =>
          useEffectWhenMatch(([result]) => track(result.data.id), [query], "status", "success"),
        {
          initialProps: { query: { status: "success", data: { id: "item-1" } } },
          wrapper,
        }
      );

      expect(track).toHaveBeenCalledTimes(1);

      rerender({ query: { status: "success", data: { id: "item-2" } } });
      expect(track).toHaveBeenCalledTimes(1);
    });

    it("should not double-run an array match", () => {
      const track = vi.fn<(status: "error" | "success") => void>();
      const wrapper = ({ children }: PropsWithChildren) =>
        createElement(StrictMode, null, children);

      const { rerender } = renderHook(
        ({ query }: { query: QueryResult }) =>
          useEffectWhenMatch(([result]) => track(result.status), [query], "status", [
            "success",
            "error",
          ]),
        {
          initialProps: {
            query: queryResult({ status: "error", error: new Error("Request failed") }),
          },
          wrapper,
        }
      );

      expect(track).toHaveBeenCalledTimes(1);

      rerender({ query: { status: "success", data: { id: "item-2" } } });
      expect(track).toHaveBeenCalledTimes(1);
    });
  });
});
