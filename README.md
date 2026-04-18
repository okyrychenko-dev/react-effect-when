# @okyrychenko-dev/react-effect-when

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-effect-when.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-effect-when)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-effect-when.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-effect-when)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Declarative conditional effects for React, with less boilerplate and less development noise

`react-effect-when` helps you run effects only when dependencies reach the state you actually care about. Its main value is expressing conditional effects declaratively, while also removing repeated `useRef` guards, `if`-based boilerplate, and some development noise around gated effects in React Strict Mode.

## What Problem It Solves

In real apps, many effects are not meant to run "on every mount-like moment". They should run only when something meaningful becomes true:

- a user and socket are both ready
- a modal is actually open
- analytics should fire once
- a subscription should start only after auth is available

Teams often respond by:

- disabling Strict Mode
- adding ad hoc `useRef(false)` guards
- pushing conditional logic deep inside `useEffect`

`react-effect-when` gives you a cleaner option: express effect timing declaratively instead of repeating local guard logic in every component.

## Main Goals

- Replace repetitive `useRef` guards and early-return boilerplate with a declarative API
- Run effects only when dependencies are actually ready, truthy, or match a custom predicate
- Keep effect intent readable at the call site instead of hiding conditions inside the effect body
- Preserve predictable cleanup behavior and a familiar React mental model
- Provide strong TypeScript support for readiness and predicate-based narrowing
- Reduce some Strict Mode-related development noise in gated-effect scenarios without turning Strict Mode off

## Why Use It

- Run an effect only when `predicate(deps)` becomes true
- Avoid repeating `if (!user || !socket) return` across components
- Reduce extra development noise around initialization, analytics, sockets, and one-time side effects
- Re-run only on meaningful matches with `once: false`
- Use `useEffectWhenReady` and `useEffectWhenTruthy` for common typed cases
- Keep public imports simple through the root package API

## Installation

```bash
npm install @okyrychenko-dev/react-effect-when
# or
yarn add @okyrychenko-dev/react-effect-when
# or
pnpm add @okyrychenko-dev/react-effect-when
```

This package requires the following peer dependencies:

- [React](https://react.dev/) ^18.0.0 || ^19.0.0

## Quick Start

```tsx
import { useEffectWhenReady } from "@okyrychenko-dev/react-effect-when";

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffectWhenReady(
    ([readyUser, readySocket]) => {
      readySocket.emit("identify", readyUser.id);
      return () => readySocket.emit("leave", readyUser.id);
    },
    [user, socket]
  );
}
```

## Strict Mode In Development

This library can reduce some development noise when a side effect should run only after a meaningful condition is satisfied.

Common examples:

- WebSocket or channel initialization
- analytics and tracking calls
- one-time setup effects
- notifications and toasts
- effects that should wait for fully ready data

The goal is not to fight React or replace `useEffect`. The goal is to make effect timing explicit and convenient in the cases where plain `useEffect` becomes noisy or repetitive.

This is not a global fix for Strict Mode re-mount behavior. With `once: true`, the effect still runs once per mount lifecycle after the predicate first matches.

## Core Concepts

- `useEffectWhen` is the base hook. It receives the current dependency tuple and runs only when your predicate returns `true`.
- `once: true` means the effect runs once per mount lifecycle after the predicate first matches.
- `once: false` means the effect re-runs every time dependencies change and the predicate matches again.
- `useEffectWhenReady` is the fastest path when all dependencies must be non-null and non-undefined.
- `useEffectWhenTruthy` is the fastest path when all dependencies must be truthy.
- `predicates.ready`, `predicates.truthy`, and `predicates.always` are reusable building blocks for the base hook.

## Core Use Cases

### Wait for async readiness

Use `useEffectWhenReady` when data, services, or refs load independently and the effect should wait until everything is available.

### Remove repeated guard boilerplate

Use `useEffectWhen` when your current `useEffect` bodies mostly start with early returns and setup checks.

### Re-run only on meaningful matches

Use `once: false` when you want the effect to run every time a threshold or condition is satisfied again.

### Reduce gated-effect dev noise

Use `useEffectWhen` when a side effect should run only after a meaningful condition is satisfied instead of putting repeated guards inside the effect body.

## Comparison

|                                           | Plain `useEffect`               | Generic effect helper | `@okyrychenko-dev/react-effect-when` |
| ----------------------------------------- | ------------------------------- | --------------------- | ------------------------------------ |
| Conditional effect execution              | Manual guards inside the effect | Usually supported     | Built-in                             |
| Wait for non-null async readiness         | Manual guards                   | Varies                | `useEffectWhenReady`                 |
| Wait for truthy values                    | Manual guards                   | Varies                | `useEffectWhenTruthy`                |
| Skip the initial mount                    | Manual `useRef` guard           | Varies                | `useEffectWhenChanged`               |
| Repeat only on meaningful matches         | Manual branching                | Varies                | `once: false`                        |
| Access current deps tuple in the callback | Manual closure usage            | Varies                | Built-in                             |
| Observe skipped states                    | Manual logging                  | Rare                  | `onSkip`                             |
| Root-level simple public API              | Native React only               | Varies                | Yes                                  |

## Key Benefits

- Clear intent: the condition for running the effect is visible at the call site
- Less boilerplate: fewer manual refs, flags, and nested guards
- Better dev ergonomics: less local effect boilerplate and less noise around gated effects
- Familiar semantics: still built on top of normal React effect behavior
- Typed readiness helpers: better safety when dependencies become available

## When To Use It

- Your `useEffect` usually starts with guards like `if (!user || !socket) return`
- You would otherwise add `useRef` flags just to prevent effect running twice in development
- Your effect should wait until values are ready, truthy, or match a custom predicate
- You want cleanup behavior to stay explicit while the trigger condition stays readable
- You want a cleaner way to gate effects during development without disabling `StrictMode`

## When Not To Use It

- A plain `useEffect` already expresses the behavior clearly
- The effect should always run for every dependency change with no gating
- The condition belongs in derived state or render logic rather than in an effect
- You are trying to bypass real remount semantics or "fix" React Strict Mode globally

## Why Not Just Use `useEffect` + `if` + `useRef`

You can. For a one-off case, that is often fine.

The problem appears when the same pattern repeats across a codebase:

- `if` guards hide the real trigger condition inside the effect body
- `useRef(false)` flags add boilerplate and are easy to get wrong
- intent becomes inconsistent from component to component
- Strict Mode double invoke pain gets handled with ad hoc local workarounds

`react-effect-when` gives that pattern one explicit API instead of many custom versions.

## Important Boundary

This library does not disable React Strict Mode, patch React behavior, or guarantee perfectly identical production behavior in every scenario.

What it does is make effect timing explicit and ergonomic in the cases where you want to avoid repeating local guard logic and reduce unnecessary development noise around conditional effects.

## API Reference

### Public imports

Use the root package import for all documented APIs:

```tsx
import {
  createEffectWhen,
  predicates,
  useEffectWhen,
  useEffectWhenChanged,
  useEffectWhenReady,
  useEffectWhenTruthy,
} from "@okyrychenko-dev/react-effect-when";
```

### Hooks

Start with these first:

- `useEffectWhen`
- `useEffectWhenChanged`
- `useEffectWhenReady`
- `useEffectWhenTruthy`

Use `createEffectWhen` when the same predicate repeats across multiple components and deserves a named reusable hook.

### `useEffectWhenChanged(effect, deps)`

Runs an effect only after the initial mount, when `deps` change.

Use this when you want update-only behavior without repeating a `useRef(true)` guard in each component.

This hook does not debounce or throttle updates. If your input changes rapidly, the effect still runs once per changed render.

**Parameters:**

- `effect: (deps: T) => void | (() => void)` - Same cleanup semantics as `useEffect`, plus access to the current dependency tuple
- `deps: T extends DependencyList`

**Example:**

```tsx
import { useEffectWhenChanged } from "@okyrychenko-dev/react-effect-when";

function Search({ query }: { query: string }) {
  useEffectWhenChanged(
    ([nextQuery]) => {
      trackSearchChange(nextQuery);
    },
    [query]
  );
}
```

### `useEffectWhen(effect, deps, predicate, options?)`

Runs an effect only when `predicate(deps)` returns `true`.

**Parameters:**

- `effect: (deps: T) => void | (() => void)` - Same cleanup semantics as `useEffect`, plus access to the current dependency tuple
- `deps: T extends DependencyList` - Passed to React and to the predicate
- `predicate: (deps: T) => boolean` - Condition that controls when the effect runs
- `options?: UseEffectWhenOptions<T>`
  - `once?: boolean` - Run once after the first match or on every match
  - `onSkip?: (deps: T) => void` - Called when dependencies change and the predicate returns `false`; stops firing after the effect runs if `once: true`

`effect` follows normal `useEffect` semantics: React re-evaluates it when `deps` change. By design, `predicate`, `onSkip`, and `once` are kept fresh via refs, so they do not need to appear in the dependency array.

**Example:**

```tsx
import { useEffectWhen } from "@okyrychenko-dev/react-effect-when";

function Game({ score }: { score: number }) {
  useEffectWhen(
    ([currentScore]) => {
      showConfetti(currentScore);
    },
    [score],
    ([value]) => value > 100,
    { once: false }
  );
}
```

### `useEffectWhenReady(effect, deps, options?)`

Runs the effect when all dependency values are non-null and non-undefined.

**Parameters:**

- `effect: (deps: ReadyDeps<T>) => void | (() => void)`
- `deps: T extends DependencyList`
- `options?: UseEffectWhenOptions<T>`

**Example:**

```tsx
import { useEffectWhenReady } from "@okyrychenko-dev/react-effect-when";

function Profile({ user, token }: { user: User | null; token: string | null }) {
  useEffectWhenReady(
    ([readyUser, readyToken]) => {
      trackProfileView(readyUser.id, readyToken);
    },
    [user, token]
  );
}
```

### `useEffectWhenTruthy(effect, deps, options?)`

Runs the effect when all dependency values are truthy.

**Parameters:**

- `effect: (deps: TruthyDeps<T>) => void | (() => void)`
- `deps: T extends DependencyList`
- `options?: UseEffectWhenOptions<T>`

**Example:**

```tsx
import { useEffectWhenTruthy } from "@okyrychenko-dev/react-effect-when";

function SessionBanner({ token, isOnline }: { token: string | null; isOnline: boolean }) {
  useEffectWhenTruthy(
    ([readyToken, online]) => {
      connectBannerChannel(readyToken, online);
    },
    [token, isOnline],
    { once: false }
  );
}
```

### `createEffectWhen(predicate)`

Creates a reusable hook with a baked-in predicate.

Use this when multiple components share the same condition and you want a named hook instead of repeating the predicate inline.

**Parameters:**

- `predicate: (deps: T) => boolean`

**Returns:**

- `(effect: (deps: T) => void | (() => void), deps: T, options?: UseEffectWhenOptions<T>) => void`

If `predicate` is a type guard, the returned hook preserves narrowed dependency types inside `effect`.

**Example:**

```tsx
import { createEffectWhen, type ReadyDeps } from "@okyrychenko-dev/react-effect-when";

const useEffectWhenAuthed = createEffectWhen<
  [User | null, string | null],
  ReadyDeps<[User | null, string | null]>
>(
  (deps): deps is ReadyDeps<[User | null, string | null]> =>
    deps[0] !== null && deps[1] !== null
);

function Dashboard({ user, token }: { user: User | null; token: string | null }) {
  useEffectWhenAuthed(
    ([readyUser, readyToken]) => {
      initializeDashboard(readyUser.id, readyToken);
    },
    [user, token]
  );
}
```

**Example with type narrowing:**

```tsx
import { createEffectWhen, predicates, type ReadyDeps } from "@okyrychenko-dev/react-effect-when";

const useEffectWhenReady = createEffectWhen<
  [User | null, Socket | null],
  ReadyDeps<[User | null, Socket | null]>
>((deps): deps is ReadyDeps<[User | null, Socket | null]> => predicates.ready(deps));

function Connection({ user, socket }: { user: User | null; socket: Socket | null }) {
  useEffectWhenReady(
    ([readyUser, readySocket]) => {
      readySocket.emit("identify", readyUser.id);
    },
    [user, socket]
  );
}
```

**Shared hook example:**

```tsx
// hooks/useEffectWhenAuthed.ts
import { createEffectWhen, type ReadyDeps } from "@okyrychenko-dev/react-effect-when";

export const useEffectWhenAuthed = createEffectWhen<
  [User | null, string | null],
  ReadyDeps<[User | null, string | null]>
>(
  (deps): deps is ReadyDeps<[User | null, string | null]> =>
    deps[0] !== null && deps[1] !== null
);
```

```tsx
// Dashboard.tsx
import { useEffectWhenAuthed } from "./hooks";

function Dashboard({ user, token }: { user: User | null; token: string | null }) {
  useEffectWhenAuthed(
    ([readyUser, readyToken]) => {
      initializeDashboard(readyUser.id, readyToken);
    },
    [user, token]
  );
}
```

```tsx
// Notifications.tsx
import { useEffectWhenAuthed } from "./hooks";

function Notifications({ user, token }: { user: User | null; token: string | null }) {
  useEffectWhenAuthed(
    ([readyUser, readyToken]) => {
      connectNotifications(readyUser.id, readyToken);
    },
    [user, token],
    { once: false }
  );
}
```

### Built-in predicates

- `predicates.ready(deps)` - true when all dependencies are non-null and non-undefined
- `predicates.truthy(deps)` - true when all dependencies are truthy
- `predicates.always(deps)` - always true, equivalent to a plain `useEffect`

**Example:**

```tsx
import { predicates, useEffectWhen } from "@okyrychenko-dev/react-effect-when";

useEffectWhen(
  ([currentUser, currentToken]) => {
    initializeDashboard(currentUser, currentToken);
  },
  [user, token],
  predicates.ready,
  {
    onSkip: ([pendingUser, pendingToken]) => {
      console.debug("Waiting for deps:", {
        user: pendingUser,
        token: pendingToken,
      });
    },
  }
);
```

## Real-World Examples

### Prevent analytics from firing twice in development

```tsx
import { useEffectWhen } from "@okyrychenko-dev/react-effect-when";

function ProductPage({ productId, isReady }: { productId: string; isReady: boolean }) {
  useEffectWhen(
    ([id]) => {
      analytics.track("product_view", { productId: id });
    },
    [productId, isReady],
    ([, ready]) => ready === true
  );
}
```

This is a common React Strict Mode double-invoke pain point in development when analytics should fire only after the page is actually ready.

### Initialize a WebSocket only when auth is ready

```tsx
import { useEffectWhenReady } from "@okyrychenko-dev/react-effect-when";

function RealtimeConnection({
  userId,
  authToken,
}: {
  userId: string | null;
  authToken: string | null;
}) {
  useEffectWhenReady(
    ([readyUserId, readyToken]) => {
      const socket = connectSocket({ userId: readyUserId, token: readyToken });

      return () => {
        socket.close();
      };
    },
    [userId, authToken]
  );
}
```

This keeps WebSocket setup declarative and avoids scattering `if (!userId || !authToken) return` checks through the effect body.

### Show a toast only when a modal actually opens

```tsx
import { useEffectWhen } from "@okyrychenko-dev/react-effect-when";

function Modal({ isOpen }: { isOpen: boolean }) {
  useEffectWhen(
    ([open]) => {
      toast.info("Modal opened");
    },
    [isOpen],
    ([open]) => open === true
  );
}
```

This is useful when development re-mounts would otherwise create extra toast or notification noise.

## More Examples

### Run once when a modal opens

```tsx
import { useEffectWhen } from "@okyrychenko-dev/react-effect-when";

function Modal({ isOpen }: { isOpen: boolean }) {
  useEffectWhen(
    ([open]) => {
      fetchModalData(open);
    },
    [isOpen],
    ([open]) => open === true
  );
}
```

### Sync only when a custom predicate matches

```tsx
import { useEffectWhen } from "@okyrychenko-dev/react-effect-when";

useEffectWhen(
  ([itemList]) => {
    syncToServer(itemList);
  },
  [items, isOnline, hasPermission],
  ([itemList, online, permission]) => online === true && permission === true && itemList.length > 0
);
```

### Observe skipped states with `onSkip`

```tsx
import { predicates, useEffectWhen } from "@okyrychenko-dev/react-effect-when";

useEffectWhen(
  ([currentUser, currentToken]) => {
    initializeDashboard(currentUser, currentToken);
  },
  [user, token],
  predicates.ready,
  {
    onSkip: ([pendingUser, pendingToken]) => {
      console.debug("Still waiting:", {
        user: pendingUser,
        token: pendingToken,
      });
    },
  }
);
```

## Internal Demo

The repository also contains a few internal demo snippets:

- `examples/basic-ready.tsx`
- `examples/custom-predicate.tsx`
- `examples/truthy-repeat.tsx`

Use them for local experimentation only. The README examples are the canonical
public documentation for package usage.

## Behavior Reference

| Scenario                                              | Behavior                                           |
| ----------------------------------------------------- | -------------------------------------------------- |
| Predicate `false` on mount                            | Effect does not run                                |
| Predicate becomes `true`                              | Effect runs                                        |
| Deps change after effect ran (`once: true`)           | Effect does not re-run                             |
| Deps toggle back to falsy, then truthy (`once: true`) | Effect does not re-run                             |
| Predicate `true` again (`once: false`)                | Effect re-runs and the previous cleanup runs first |
| Component unmounts                                    | Cleanup runs once                                  |
| React 18 Strict Mode remount in dev                   | Same behavior as a fresh mount                     |

## Important Semantics

- `predicate` and `onSkip` are stored in refs, so the hook always uses their latest version without adding them to the dependency array.
- `once` is also kept fresh internally, so cleanup logic follows the latest option value across renders.
- Only `deps` control when React re-runs the effect. Changing `predicate` or `onSkip` alone does not trigger a re-run.
- `useEffectWhen` passes the current dependency tuple into `effect`.
- `useEffectWhenReady` and `useEffectWhenTruthy` are the preferred APIs when you want narrowed values for the common built-in conditions.
- In React Strict Mode, behavior is still scoped per mount lifecycle. A real remount is treated as a fresh hook instance.
- Public imports are exposed from the package root. Subpath imports are not required for the documented API.

## Publish Checklist

Before publishing a new version, make sure this command passes:

```bash
npm run release:check
```

## License

MIT © Oleksii Kyrychenko
