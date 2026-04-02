# Changelog

All notable changes to this project will be documented in this file.

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
