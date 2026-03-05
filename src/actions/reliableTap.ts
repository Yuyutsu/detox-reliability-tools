import type {
  DetoxMatcher,
  ElementFactory,
  ReliableTapOptions,
} from "../types/detoxReliabilityTypes";
import { retry, sleep } from "../utils/retry";
import { withTimeout } from "../utils/timeout";

/**
 * Safely taps an element that may not be immediately ready.
 *
 * The function:
 * 1. Waits until the element exists (via Detox's `waitFor` / `toBeVisible`).
 * 2. Retries the tap if the UI is not ready.
 * 3. Fails with a clear error message when all attempts are exhausted.
 *
 * @example
 * await reliableTap(by.id("loginButton"));
 *
 * @param matcher  A Detox matcher (e.g. `by.id("...")`, `by.text("...")`).
 * @param options  Retry and timeout configuration.
 * @param elementFn  Detox's global `element` function (injected for testability).
 * @param waitForFn  Detox's global `waitFor` function (injected for testability).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

export async function reliableTap(
  matcher: DetoxMatcher,
  options: ReliableTapOptions = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elementFn: ElementFactory = g.element as ElementFactory,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  waitForFn: (el: any) => any = g.waitFor
): Promise<void> {
  const { attempts = 3, delay = 500, timeout = 5000 } = options;

  if (typeof elementFn !== "function") {
    throw new Error(
      "reliableTap: Detox `element` global is not available. " +
        "Ensure Detox is initialised before calling this utility."
    );
  }

  // Wait until the element is visible before attempting to tap.
  await withTimeout(
    waitForFn(elementFn(matcher)).toBeVisible().withTimeout(timeout),
    { timeout: timeout + 1000, label: "element to become visible" }
  );

  await retry(
    async () => {
      await elementFn(matcher).tap();
    },
    { attempts, delay }
  );

  // Allow a brief settling period after tap.
  await sleep(50);
}
