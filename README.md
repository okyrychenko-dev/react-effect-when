# @okyrychenko-dev/react-effect-when

[![npm version](https://img.shields.io/npm/v/@okyrychenko-dev/react-effect-when.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-effect-when)
[![npm downloads](https://img.shields.io/npm/dm/@okyrychenko-dev/react-effect-when.svg)](https://www.npmjs.com/package/@okyrychenko-dev/react-effect-when)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Declarative control over when React effects actually fire, especially when Strict Mode makes development noisy

`react-effect-when` helps you run effects only when dependencies reach the state you actually care about. Its main value is reducing development noise from React Strict Mode without disabling `StrictMode`, while also removing repeated `useRef` guards and `if`-based effect boilerplate.

## What Problem It Solves

In real apps, many effects are not meant to run "on every mount-like moment". They should run only when something meaningful becomes true:

- a user and socket are both ready
- a modal is actually open
- analytics should fire once
- a subscription should start only after auth is available

In development, React Strict Mode can make those flows noisy by intentionally re-mounting and re-running effects. Teams often respond by:

- disabling Strict Mode
- adding ad hoc `useRef(false)` guards
- pushing conditional logic deep inside `useEffect`

`react-effect-when` gives you a cleaner option: keep Strict Mode on, but express effect timing declaratively.

## Main Goals

- Reduce Strict Mode effect noise in development without turning Strict Mode off
- Replace repetitive `useRef` guards and early-return boilerplate with a declarative API
- Run effects only when dependencies are actually ready, truthy, or match a custom predicate
- Keep effect intent readable at the call site instead of hiding conditions inside the effect body
- Preserve predictable cleanup behavior and a familiar React mental model
- Provide strong TypeScript support for readiness and predicate-based narrowing

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

This library is especially useful when you want development to feel closer to production for side effects that should not create extra noise.

Common examples:

- WebSocket or channel initialization
- analytics and tracking calls
- one-time setup effects
- notifications and toasts
- effects that should wait for fully ready data

The goal is not to fight React or replace `useEffect`. The goal is to make effect timing explicit and convenient in the cases where plain `useEffect` becomes noisy or repetitive.

## Core Concepts

- `useEffectWhen` is the base hook. It receives the current dependency tuple and runs only when your predicate returns `true`.
- `once: true` means the effect runs once per mount lifecycle after the predicate first matches.
- `once: false` means the effect re-runs every time dependencies change and the predicate matches again.
- `useEffectWhenReady` is the fastest path when all dependencies must be non-null and non-undefined.
- `useEffectWhenTruthy` is the fastest path when all dependencies must be truthy.
- `predicates.ready`, `predicates.truthy`, and `predicates.always` are reusable building blocks for the base hook.

## Core Use Cases

### Reduce Strict Mode dev noise

Use `useEffectWhen` when a side effect should run only after a meaningful condition is satisfied instead of reacting to every mount-like development cycle.

### Wait for async readiness

Use `useEffectWhenReady` when data, services, or refs load independently and the effect should wait until everything is available.

### Remove repeated guard boilerplate

Use `useEffectWhen` when your current `useEffect` bodies mostly start with early returns and setup checks.

### Re-run only on meaningful matches

Use `once: false` when you want the effect to run every time a threshold or condition is satisfied again.

## Comparison

|                                           | Plain `useEffect`               | Generic effect helper | `@okyrychenko-dev/react-effect-when` |
| ----------------------------------------- | ------------------------------- | --------------------- | ------------------------------------ |
| Conditional effect execution              | Manual guards inside the effect | Usually supported     | Built-in                             |
| Wait for non-null async readiness         | Manual guards                   | Varies                | `useEffectWhenReady`                 |
| Wait for truthy values                    | Manual guards                   | Varies                | `useEffectWhenTruthy`                |
| Repeat only on meaningful matches         | Manual branching                | Varies                | `once: false`                        |
| Access current deps tuple in the callback | Manual closure usage            | Varies                | Built-in                             |
| Observe skipped states                    | Manual logging                  | Rare                  | `onSkip`                             |
| Root-level simple public API              | Native React only               | Varies                | Yes                                  |

## Key Benefits

- Clear intent: the condition for running the effect is visible at the call site
- Less boilerplate: fewer manual refs, flags, and nested guards
- Better dev ergonomics: less Strict Mode noise without turning Strict Mode off
- Familiar semantics: still built on top of normal React effect behavior
- Typed readiness helpers: better safety when dependencies become available

## When To Use It

- You want to reduce React Strict Mode double-invoke noise during development
- Your `useEffect` usually starts with guards like `if (!user || !socket) return`
- You would otherwise add `useRef` flags just to prevent effect running twice in development
- Your effect should wait until values are ready, truthy, or match a custom predicate
- You want cleanup behavior to stay explicit while the trigger condition stays readable

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

What it does is make effect timing explicit and ergonomic in the cases where you want to reduce unnecessary development noise and avoid repeating local guard logic.

## API Reference

### Public imports

Use the root package import for all documented APIs:

```tsx
import {
  predicates,
  useEffectWhen,
  useEffectWhenReady,
  useEffectWhenTruthy,
} from "@okyrychenko-dev/react-effect-when";
```

### Hooks

Start with these first:

- `useEffectWhen`
- `useEffectWhenReady`
- `useEffectWhenTruthy`

### `useEffectWhen(effect, deps, predicate, options?)`

Runs an effect only when `predicate(deps)` returns `true`.

**Parameters:**

- `effect: (deps: T) => void | (() => void)` - Same cleanup semantics as `useEffect`, plus access to the current dependency tuple
- `deps: T extends DependencyList` - Passed to React and to the predicate
- `predicate: (deps: T) => boolean` - Condition that controls when the effect runs
- `options?: UseEffectWhenOptions<T>`
  - `once?: boolean` - Run once after the first match or on every match
  - `onSkip?: (deps: T) => void` - Called when dependencies change and the predicate returns `false`; stops firing after the effect runs if `once: true`

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
