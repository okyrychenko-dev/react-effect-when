import {
  createEffectWhen,
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

type Query = PendingQuery | SuccessfulQuery;

declare const query: Query;
declare const nullableId: string | null;

const isReady: GuardPredicate<readonly [string | null], readonly [string]> = (
  deps
): deps is readonly [string] => deps[0] !== null;

const isSuccessful: GuardPredicate<readonly [Query], readonly [SuccessfulQuery]> = (
  deps
): deps is readonly [SuccessfulQuery] => deps[0].status === "success";

const useEffectWhenSuccessful = createEffectWhen(isSuccessful);

function usePackedPackageTypes(): void {
  useEffectWhen(
    ([id]) => {
      id satisfies string;
    },
    [nullableId] as const,
    isReady
  );

  useEffectWhenMatch(
    ([result]) => {
      result.data.id satisfies string;
    },
    [query],
    "status",
    "success"
  );

  useEffectWhenSuccessful(
    ([result]) => {
      result.data.id satisfies string;
    },
    [query]
  );
}

const matchedEffect: UseEffectWhenEffect<MatchedDeps<"status", Query, "success">> = ([result]) => {
  result.data.id satisfies string;
};

void matchedEffect;
void usePackedPackageTypes;
