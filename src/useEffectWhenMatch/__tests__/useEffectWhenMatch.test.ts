import { renderHook } from "@testing-library/react";
import { type PropsWithChildren, StrictMode, createElement } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { useEffectWhenMatch } from "../useEffectWhenMatch";

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

  it("should not run when the field does not match", () => {
    const track = vi.fn<(id: string) => void>();
    const query = queryResult({ status: "pending" });

    renderHook(() =>
      useEffectWhenMatch(([result]) => track(result.data.id), [query], "status", "success")
    );

    expect(track).not.toHaveBeenCalled();
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
  });
});
