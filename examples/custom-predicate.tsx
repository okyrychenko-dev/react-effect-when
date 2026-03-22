/**
 * Internal example for local exploration.
 *
 * This file is not part of the published package API.
 * Canonical public usage examples live in README.md.
 */

import { useEffectWhen } from "@okyrychenko-dev/react-effect-when";

interface SyncItem {
  id: string;
}

interface CustomPredicateExampleProps {
  hasPermission: boolean;
  isOnline: boolean;
  items: ReadonlyArray<SyncItem>;
}

export function CustomPredicateExample({
  hasPermission,
  isOnline,
  items,
}: CustomPredicateExampleProps): null {
  useEffectWhen(
    ([itemList]) => {
      syncToServer(itemList);
    },
    [items, isOnline, hasPermission],
    ([itemList, online, permission]) =>
      online === true && permission === true && itemList.length > 0
  );

  return null;
}

function syncToServer(items: ReadonlyArray<SyncItem>): void {
  void items;
}
