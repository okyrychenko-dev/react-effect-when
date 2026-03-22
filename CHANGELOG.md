# Changelog

All notable changes to this project will be documented in this file.

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
