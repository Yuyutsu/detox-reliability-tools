import type { WaitForNetworkIdleOptions } from "../types/detoxReliabilityTypes";
import { sleep } from "../utils/retry";

/**
 * Waits until network requests appear to have finished.
 *
 * Because Detox does not expose a direct network-idle API this utility uses a
 * polling approach: it checks repeatedly whether the active-request counter
 * (maintained by the optional `requestTracker`) has dropped to zero, and only
 * resolves once the count stays at zero for `idleDuration` milliseconds.
 *
 * If no `requestTracker` is provided the function simply waits for
 * `idleDuration` ms as a conservative fallback — useful when you know the
 * app performs a burst of requests after a navigation.
 *
 * @example
 * await waitForNetworkIdle();
 * await waitForNetworkIdle({ timeout: 15000, idleDuration: 1000 });
 */
export async function waitForNetworkIdle(
  options: WaitForNetworkIdleOptions & {
    /** Optional supplier that returns the count of in-flight requests. */
    activeRequestCount?: () => number;
  } = {}
): Promise<void> {
  const {
    timeout = 10000,
    idleDuration = 500,
    activeRequestCount,
  } = options;

  const deadline = Date.now() + timeout;
  const pollInterval = 100;

  if (activeRequestCount === undefined) {
    // No tracker: just honour the idleDuration as a fixed pause.
    await sleep(idleDuration);
    return;
  }

  let idleSince: number | null = null;

  while (Date.now() < deadline) {
    const count = activeRequestCount();
    if (count === 0) {
      if (idleSince === null) {
        idleSince = Date.now();
      } else if (Date.now() - idleSince >= idleDuration) {
        return; // Network has been idle for long enough.
      }
    } else {
      idleSince = null; // Reset idle timer when a new request appears.
    }
    await sleep(pollInterval);
  }

  throw new Error(
    `waitForNetworkIdle: network did not become idle within ${timeout} ms`
  );
}
