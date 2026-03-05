# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-03-05

### Added

- `reliableTap(matcher, options?)` — waits for element visibility then retries tap with configurable attempts, delay, and timeout.
- `reliableType(matcher, text, options?)` — focuses input, clears existing text, and types with retry support and optional per-character delay.
- `waitForNetworkIdle(options?)` — polling-based detection of network idle state with configurable timeout and idle duration.
- `waitForUIStable(options?)` — waits for UI animations to settle via a fixed delay or a custom async `isStable` predicate.
- `retry(action, options?)` — generic retry helper for any asynchronous operation.
- `withTimeout(promise, options?)` — races a promise against a deadline and throws a descriptive error on expiry.
- `debug.captureScreenshot(name?)` — captures a Detox screenshot; degrades gracefully outside a Detox session.
- `debug.printVisibleElements(elementIds)` — logs the visible state of accessibility-identified elements to the console.
- `debug.logCurrentScreen()` — logs the current Android activity (or a not-supported message on iOS).
- Full TypeScript strict-mode typings, exported from the package root.
- Comprehensive Jest test suite (7 suites, 41 tests).
- CI workflow (GitHub Actions) running lint + tests + build on Node 18, 20, and 22.
- Automated npm publish workflow triggered on GitHub Release.
