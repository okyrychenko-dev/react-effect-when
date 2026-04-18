/**
 * Internal example for local exploration.
 *
 * This file is not part of the published package API.
 * Canonical public usage examples live in README.md.
 */

import { useEffectWhenChanged } from "@okyrychenko-dev/react-effect-when";

interface UseEffectWhenChangedExampleProps {
  query: string;
}

export function UseEffectWhenChangedExample({
  query,
}: UseEffectWhenChangedExampleProps): null {
  useEffectWhenChanged(
    ([nextQuery]) => {
      trackSearchChange(nextQuery);
    },
    [query]
  );

  return null;
}

function trackSearchChange(query: string): void {
  void query;
}
