import type { WaitForUIStableOptions } from "../types/detoxReliabilityTypes";
import { sleep } from "../utils/retry";

/**
 * Waits for the UI to stabilise by pausing for `delay` milliseconds.
 *
 * Detox synchronises with the JS thread and native animations in many cases,
 * but some edge-cases (e.g. CSS-driven animations, `Animated.loop`, or third-
 * party native components) can leave the UI in a transitional state.  Calling
 * this function gives those animations time to settle before the next
 * interaction.
 *
 * An optional `isStable` predicate lets callers plug in a custom stability
 * check (e.g. polling a Redux store or a visible spinner).  When provided, the
 * function polls until the predicate returns `true` or the timeout expires.
 *
 * @example
 * await waitForUIStable();
 * await waitForUIStable({ delay: 500, timeout: 8000 });
 */
export async function waitForUIStable(
  options: WaitForUIStableOptions & {
    /** Optional async predicate. Resolves to true when the UI is stable. */
    isStable?: () => Promise<boolean> | boolean;
  } = {}
): Promise<void> {
  const { delay = 300, timeout = 5000, isStable } = options;

  if (isStable === undefined) {
    await sleep(delay);
    return;
  }

  const deadline = Date.now() + timeout;
  const pollInterval = 100;

  while (Date.now() < deadline) {
    if (await isStable()) {
      await sleep(delay); // Extra settle time even after stable signal.
      return;
    }
    await sleep(pollInterval);
  }

  throw new Error(
    `waitForUIStable: UI did not stabilise within ${timeout} ms`
  );
}
