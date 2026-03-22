/**
 * Internal example for local exploration.
 *
 * This file is not part of the published package API.
 * Canonical public usage examples live in README.md.
 */

import { useState } from "react";
import { useEffectWhenReady } from "@okyrychenko-dev/react-effect-when";

interface User {
  id: string;
}

interface SocketLike {
  emit: (event: string, payload: string) => void;
}

export function BasicReadyExample(): null {
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<SocketLike | null>(null);

  useEffectWhenReady(
    ([readyUser, readySocket]) => {
      readySocket.emit("identify", readyUser.id);
    },
    [user, socket]
  );

  void setUser;
  void setSocket;

  return null;
}
