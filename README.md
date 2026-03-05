# detox-reliability-tools

A small utility library that improves **reliability, stability, and debugging of Detox end-to-end tests for React Native applications**.

It reduces flaky tests, simplifies waiting logic, and provides better debugging information when tests fail — all without requiring any changes to Detox itself.

---

## Why Your Detox Tests Are Flaky

Detox tests commonly fail because of:

- **UI elements not ready** when tests run
- **Network requests still pending** after a navigation
- **Animations still running** when the next interaction starts
- **Asynchronous state updates** from Redux, Context, or native modules
- **Intermittent CI timing issues** caused by slower build machines

These problems cause tests that pass locally but fail in CI. `detox-reliability-tools` provides utilities that act as a **stability layer on top of Detox APIs**, making tests more deterministic and easier to debug.

---

## Installation

```sh
npm install --save-dev detox-reliability-tools
# or
yarn add --dev detox-reliability-tools
```

Detox (`>=20.0.0`) is a peer dependency and must already be installed.

---

## Quick Start

```ts
import { reliableTap, waitForUIStable, debug } from "detox-reliability-tools";

describe("Login flow", () => {
  afterEach(async () => {
    // Capture a screenshot on every test — useful when failures happen in CI.
    await debug.captureScreenshot("after-test");
  });

  it("should login successfully", async () => {
    await waitForUIStable();
    await reliableTap(by.id("loginButton"));
  });
});
```

---

## API Reference

### `reliableTap(matcher, options?)`

Safely taps an element that may not be immediately ready.

- Waits until the element is visible using Detox's `waitFor`.
- Retries the tap if the UI is not ready.
- Fails with a clear error message when all attempts are exhausted.

```ts
import { reliableTap } from "detox-reliability-tools";

await reliableTap(by.id("loginButton"));

// With custom options:
await reliableTap(by.id("loginButton"), {
  attempts: 5,   // retry up to 5 times (default: 3)
  delay: 300,    // wait 300 ms between retries (default: 500)
  timeout: 8000, // wait up to 8 s for element to appear (default: 5000)
});
```

---

### `reliableType(matcher, text, options?)`

Improves typing reliability in text inputs.

- Waits for the element to be visible.
- Taps the input to focus it, clears any existing text, then types.
- Retries the full sequence if the input is not ready.
- Supports an optional per-character delay for slow renderers.

```ts
import { reliableType } from "detox-reliability-tools";

await reliableType(by.id("emailInput"), "test@example.com");

// Type one character at a time with a 30 ms pause between characters:
await reliableType(by.id("emailInput"), "test@example.com", {
  characterDelay: 30,
});
```

---

### `waitForNetworkIdle(options?)`

Waits until network requests appear to have finished.

```ts
import { waitForNetworkIdle } from "detox-reliability-tools";

// Simple fixed-delay approach (conservative):
await waitForNetworkIdle();

// With a custom request tracker:
let activeRequests = 0;
// (increment/decrement activeRequests in your network interceptor)

await waitForNetworkIdle({
  timeout: 15000,      // max wait time in ms (default: 10000)
  idleDuration: 1000,  // ms of quiet before "idle" is declared (default: 500)
  activeRequestCount: () => activeRequests,
});
```

---

### `waitForUIStable(options?)`

Helps avoid animation-related flakiness by waiting for the UI to settle.

```ts
import { waitForUIStable } from "detox-reliability-tools";

// Simple fixed pause (uses defaults: delay=300 ms):
await waitForUIStable();

// With a custom stability check:
await waitForUIStable({
  delay: 500,       // extra settle time after stable signal (default: 300)
  timeout: 8000,    // max wait time (default: 5000)
  isStable: async () => {
    // Return true when your app signals that animations are done.
    return myStore.getState().isIdle;
  },
});
```

---

### `retry(action, options?)`

Generic retry helper for any unstable asynchronous operation.

```ts
import { retry } from "detox-reliability-tools";

await retry(
  async () => {
    await element(by.id("submit")).tap();
  },
  {
    attempts: 3, // number of attempts including the first (default: 3)
    delay: 300,  // ms between attempts (default: 500)
  }
);
```

---

### `withTimeout(promise, options?)`

Races a promise against a timeout and throws a descriptive error on expiry.

```ts
import { withTimeout } from "detox-reliability-tools";

const result = await withTimeout(
  element(by.id("spinner")).waitToBeVisible(),
  { timeout: 3000, label: "spinner to appear" }
);
```

---

### `debug` namespace

Debugging utilities to improve failure visibility in CI.

#### `debug.captureScreenshot(name?)`

Saves a screenshot via Detox's `device.takeScreenshot` and returns the file path. Returns `null` (instead of throwing) when called outside a Detox session.

```ts
import { debug } from "detox-reliability-tools";

afterEach(async () => {
  await debug.captureScreenshot("after-each");
});
```

#### `debug.printVisibleElements(elementIds)`

Logs the `visible` attribute of the specified accessibility IDs to the console. Useful for understanding what is on screen when a test fails.

```ts
await debug.printVisibleElements(["loginButton", "emailInput", "errorBanner"]);
// Console output:
//   [detox-reliability-tools] Checking visible elements:
//     [loginButton] visible=true
//     [emailInput] visible=false
//     [errorBanner] not found / not accessible
```

#### `debug.logCurrentScreen()`

Logs the current Android activity (or a "not supported" note on iOS).

```ts
await debug.logCurrentScreen();
// Console output:
//   [detox-reliability-tools] Current activity: com.myapp.MainActivity
```

---

## CI Stability Recommendations

1. **Always capture a screenshot in `afterEach`** — even passing tests benefit from a visual record.
2. **Use `waitForUIStable()` after navigations** to let animations finish before interacting with new screens.
3. **Wrap network-dependent assertions with `waitForNetworkIdle()`** to prevent intermittent failures when requests are slower on CI machines.
4. **Use `retry()` for assertions that depend on eventual state** (e.g. checking a toast message that may appear after a delayed callback).
5. **Set explicit `timeout` values** that are longer in CI than locally — CI machines are slower. Most utilities accept a `timeout` option.

```ts
// Example: CI-aware timeout helper
const CI_TIMEOUT = process.env.CI ? 15000 : 5000;

await reliableTap(by.id("submitButton"), { timeout: CI_TIMEOUT });
await waitForNetworkIdle({ timeout: CI_TIMEOUT });
```

---

## Project Structure

```
src/
  actions/
    reliableTap.ts        # Reliable tap with wait + retry
    reliableType.ts       # Reliable text input with retry
  wait/
    waitForNetworkIdle.ts # Wait for network requests to settle
    waitForUIStable.ts    # Wait for UI animations to settle
  utils/
    retry.ts              # Generic retry + sleep helpers
    timeout.ts            # Promise timeout wrapper
  debug/
    captureScreenshot.ts  # Screenshot capture
    printVisibleElements.ts # Element visibility logging
  types/
    detoxReliabilityTypes.ts # Shared TypeScript types
  index.ts                # Public API entry point
tests/
  retry.test.ts
  timeout.test.ts
  reliableTap.test.ts
  reliableType.test.ts
  waitForNetworkIdle.test.ts
  waitForUIStable.test.ts
  debug.test.ts
```

---

## License

MIT
