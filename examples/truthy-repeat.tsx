/**
 * Internal example for local exploration.
 *
 * This file is not part of the published package API.
 * Canonical public usage examples live in README.md.
 */

import { useEffectWhenTruthy } from "@okyrychenko-dev/react-effect-when";

interface TruthyRepeatExampleProps {
  isOnline: boolean;
  token: string | null;
}

export function TruthyRepeatExample({
  isOnline,
  token,
}: TruthyRepeatExampleProps): null {
  useEffectWhenTruthy(
    ([readyToken, online]) => {
      connectChannel(readyToken, online);
    },
    [token, isOnline],
    { once: false }
  );

  return null;
}

function connectChannel(token: string, isOnline: true): void {
  void token;
  void isOnline;
}
