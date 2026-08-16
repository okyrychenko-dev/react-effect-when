# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-08-16

### Added
- Added `useEffectWhenMatch(effect, deps, key, value, options?)`, a prototype hook that gates an effect on a single discriminated-union dependency's `key` field equaling `value` and passes the matched variant to `effect`. Not limited to a `status` field — `key` can be any discriminant property. Exports `Discriminant<K>` and `MatchedDeps<K, Q, V>` as named types

### Changed
- Repositioned the package around its main differentiator: type-safe narrowing of gated deps, not React Strict Mode noise reduction. Updated `package.json` description/keywords and reordered the README so the narrowed-deps example leads, with Strict Mode benefits demoted to a secondary, shrunk section
- Added a `use client` banner to the build output (`tsup.config.ts`) so the package can be imported from Next.js App Router server components without a hooks-on-the-server error
- Documented `react-hooks/exhaustive-deps`'s `additionalHooks` option in the README so consumers get dep linting on `useEffectWhen` and its variants

## [1.2.0] - 2026-05-30

### Added
- Added a development-only warning when an effect returns a cleanup function while `once: true`. React may run that cleanup on a dependency change without re-running the setup, leaving the resource torn down but not recreated; the warning steers you toward `{ once: false }` for sockets, subscriptions, listeners, and timers. The guard relies on the literal `process.env.NODE_ENV`, so bundlers strip it from production builds and it stays silent when no `process` global exists

## [1.1.1] - 2026-05-30

### Changed
- Clarified `once` semantics in the README: repositioned `once: true` as the fire-and-forget default and steered resource effects (sockets, subscriptions, listeners, timers) toward `once: false`
- Updated the WebSocket and dashboard examples to use `once: false` for cleanup-backed resources
- Documented that with `once: true`, React may still run the previous cleanup on a dependency change while the setup stays blocked, leaving a resource torn down but not recreated

### Tests
- Added regression tests covering both `once` paths: `once: false` keeps a cleanup-backed resource alive across dependency changes, while `once: true` tears it down without recreating it

## [1.1.0] - 2026-04-18

### Added
- Added `useEffectWhenChanged(effect, deps)` for update-only effects that skip the initial mount

### Changed
- Expanded the README with `useEffectWhenChanged` documentation and comparison guidance
- Documented effect timing semantics more explicitly for `useEffectWhen`

## [1.0.4] - 2026-04-02

### Added
- Added `createEffectWhen(predicate)` for building reusable predicate-based effect hooks
- Added support for guard-predicate factories so created hooks preserve narrowed dependency types inside `effect`

### Changed
- Expanded the README with `createEffectWhen` documentation, including reusable-hook and type-narrowing examples
- Aligned examples so narrowing is shown only in guard-based scenarios
- Simplified test helpers and updated test coverage to exercise real predicate paths without test-only predicate wrappers

## [1.0.3] - 2026-03-23

### Changed
- Repositioned the README around the main library value: reducing React Strict Mode development noise with declarative effect timing
- Added clearer guidance for when to use the library, when not to use it, and why it helps over ad hoc `useEffect` plus `useRef` guards
- Added real-world documentation examples for analytics, WebSocket initialization, and modal/toast scenarios
- Updated package description and keywords to better reflect the Strict Mode and conditional effects use cases
- Bumped the package version to `1.0.3`

## [1.0.2] - 2026-03-22

### Fixed
- Enabled `.d.ts` generation in the `tsup` build so published packages include TypeScript declarations
- Removed a stale-closure edge case for `once` by keeping the option fresh inside the hook lifecycle
- Simplified cleanup handling in `useEffectWhen` without changing the public API
- Clarified `onSkip` semantics in the public docs and type comments
- Removed `EffectResult` from the public type exports
- Reworked Strict Mode coverage to test actual `React.StrictMode` usage and added direct `GuardPredicate` coverage

## [1.0.0] - 2026-03-21

### Added
- `useEffectWhen(effect, deps, predicate, options)` hook
- Root-package exports for `useEffectWhen`, `useEffectWhenReady`, `useEffectWhenTruthy`, and `predicates`
- Typed preset hooks: `useEffectWhenReady` and `useEffectWhenTruthy`
- Built-in predicates: `predicates.ready`, `predicates.truthy`, `predicates.always`
- `once` option (default: `true`) — run effect only once or on every predicate match
- `onSkip` option — callback when predicate returns false
- Full TypeScript generics, no `any` or type assertions
- Release verification via `npm run release:check`
- Predictable React 18 Strict Mode behavior per mount lifecycle
