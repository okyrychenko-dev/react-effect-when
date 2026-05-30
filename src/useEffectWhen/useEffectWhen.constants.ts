export const ONCE_CLEANUP_WARNING =
  "[react-effect-when] effect returned a cleanup function while once:true. " +
  "React may tear it down on dependency changes without recreating it. " +
  "Use { once: false } for sockets, subscriptions, listeners, and timers.";
