import {
  createEffectWhen,
  matchPredicate,
  matchPredicateFor,
  useEffectWhen,
  useEffectWhenMatch,
} from "@okyrychenko-dev/react-effect-when";
import type {
  GuardPredicate,
  MatchedDeps,
  UseEffectWhenEffect,
} from "@okyrychenko-dev/react-effect-when";

interface PendingQuery {
  status: "pending";
}

interface SuccessfulQuery {
  data: { id: string };
  status: "success";
}

interface FailedQuery {
  error: Error;
  status: "error";
}

type Query = PendingQuery | SuccessfulQuery | FailedQuery;
type SettledQuery = SuccessfulQuery | FailedQuery;

// Check both directions, including accidental `any` or `never` inference.
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

function assertType<T extends true>(_value: T): void {
  void _value;
}

declare const query: Query;
declare const nullableId: string | null;
const settledValues: readonly ["success", "error"] = ["success", "error"];
const noValues: readonly [] = [];

const isReady: GuardPredicate<readonly [string | null], readonly [string]> = (
  _deps
): _deps is readonly [string] => _deps[0] !== null;

const isSuccessful: GuardPredicate<readonly [Query], readonly [SuccessfulQuery]> = (
  _deps
): _deps is readonly [SuccessfulQuery] => _deps[0].status === "success";

const useEffectWhenSuccessful = createEffectWhen(isSuccessful);
const matchesSuccess = matchPredicate<"status", Query, "success">("status", "success");
const matchesSettled = matchPredicate<"status", Query, "success" | "error">(
  "status",
  settledValues
);
const matchesNothing = matchPredicate<"status", Query, never>("status", noValues);
const useEffectWhenSettled = createEffectWhen(matchesSettled);
const useEffectWhenNothing = createEffectWhen(matchesNothing);
const matchQuery = matchPredicateFor<Query>();
const useBoundSuccess = createEffectWhen(matchQuery("status", "success"));
const matchesBoundSettled = matchQuery("status", ["success", "error"]);
const useBoundSettled = createEffectWhen(matchesBoundSettled);
const useBoundReadonlySettled = createEffectWhen(matchQuery("status", settledValues));
const useBoundNothing = createEffectWhen(matchQuery("status", []));

function onSkip(_deps: readonly [Query]): void {
  assertType<Equal<typeof _deps, readonly [Query]>>(true);
}

function usePackedPackageTypes(): void {
  useEffectWhen(
    ([_id]) => {
      assertType<Equal<typeof _id, string>>(true);
    },
    [nullableId],
    isReady
  );

  useEffectWhenMatch(
    ([_result]) => {
      assertType<Equal<typeof _result, SuccessfulQuery>>(true);
    },
    [query],
    "status",
    "success",
    { onSkip: (_deps) => assertType<Equal<typeof _deps, readonly [Query]>>(true) }
  );

  useEffectWhenMatch(
    ([_result]) => assertType<Equal<typeof _result, SettledQuery>>(true),
    [query],
    "status",
    settledValues
  );
  useEffectWhenMatch(
    ([_result]) => assertType<Equal<typeof _result, never>>(true),
    [query],
    "status",
    noValues
  );

  useEffectWhenSuccessful(
    ([_result]) => assertType<Equal<typeof _result, SuccessfulQuery>>(true),
    [query]
  );
  useEffectWhen(
    ([_result]) => assertType<Equal<typeof _result, SuccessfulQuery>>(true),
    [query],
    matchesSuccess,
    { onSkip }
  );
  useEffectWhen(
    ([_result]) => assertType<Equal<typeof _result, SettledQuery>>(true),
    [query],
    matchesSettled,
    { onSkip: (_deps) => assertType<Equal<typeof _deps, readonly [Query]>>(true) }
  );
  useEffectWhenSettled(
    ([_result]) => assertType<Equal<typeof _result, SettledQuery>>(true),
    [query],
    { onSkip: (_deps) => assertType<Equal<typeof _deps, readonly [Query]>>(true) }
  );
  useEffectWhenNothing(([_result]) => assertType<Equal<typeof _result, never>>(true), [query]);

  useBoundSuccess(
    ([_result]) => assertType<Equal<typeof _result, SuccessfulQuery>>(true),
    [query],
    {
      onSkip: (_deps) => assertType<Equal<typeof _deps, readonly [Query]>>(true),
    }
  );
  useBoundSettled(([_result]) => assertType<Equal<typeof _result, SettledQuery>>(true), [query]);
  useBoundReadonlySettled(
    ([_result]) => assertType<Equal<typeof _result, SettledQuery>>(true),
    [query]
  );
  useBoundNothing(([_result]) => assertType<Equal<typeof _result, never>>(true), [query]);
  useEffectWhen(
    ([_result]) => assertType<Equal<typeof _result, SettledQuery>>(true),
    [query],
    matchesBoundSettled,
    { onSkip: (_deps) => assertType<Equal<typeof _deps, readonly [Query]>>(true) }
  );
  // @ts-expect-error The bound source union rejects an unknown scalar selection.
  matchQuery("status", "missing");
  // @ts-expect-error The bound source union rejects an unknown array selection.
  matchQuery("status", ["success", "missing"]);
  // @ts-expect-error Only fields common to every source variant can discriminate.
  matchQuery("data", "anything");

  // @ts-expect-error An unknown scalar discriminant must be rejected.
  useEffectWhenMatch(() => undefined, [query], "status", "missing");
  // @ts-expect-error An unknown array discriminant must be rejected.
  useEffectWhenMatch(() => undefined, [query], "status", ["success", "missing"]);
  // @ts-expect-error Explicit factory selection must belong to the source union.
  matchPredicate<"status", Query, "missing">("status", "missing");
  // @ts-expect-error Array selection must belong to the explicit selected union.
  matchPredicate<"status", Query, "success">("status", ["success", "missing"]);
}

const matchedEffect: UseEffectWhenEffect<MatchedDeps<"status", Query, "success">> = ([_result]) => {
  assertType<Equal<typeof _result, SuccessfulQuery>>(true);
};
assertType<
  Equal<MatchedDeps<"status", Query, readonly ["success", "error"]>, readonly [SettledQuery]>
>(true);
assertType<Equal<MatchedDeps<"status", Query, readonly []>, readonly [never]>>(true);

void matchedEffect;
void usePackedPackageTypes;

interface ObjectField {
  metadata: { id: string };
}
// @ts-expect-error Object-valued fields cannot be discriminant keys.
matchPredicateFor<ObjectField>()("metadata", []);
interface OptionalField {
  status?: "success";
}
// @ts-expect-error Optional fields are not required discriminants.
matchPredicateFor<OptionalField>()("status", "success");

interface ObjectStatus {
  status: { id: string };
}
// @ts-expect-error Every variant must have a PropertyKey-valued field.
matchPredicateFor<SuccessfulQuery | ObjectStatus>()("status", "success");
// @ts-expect-error Every variant must require the discriminant field.
matchPredicateFor<SuccessfulQuery | OptionalField>()("status", "success");
