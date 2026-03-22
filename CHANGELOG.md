# Changelog

All notable changes to this project will be documented in this file.

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
