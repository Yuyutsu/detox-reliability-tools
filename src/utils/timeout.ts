import type { TimeoutOptions } from "../types/detoxReliabilityTypes";

/**
 * Races a promise against a timeout.  Rejects with a descriptive error when
 * the timeout expires before the promise settles.
 *
 * @example
 * const result = await withTimeout(
 *   element(by.id("spinner")).waitToBeVisible(),
 *   { timeout: 3000, label: "spinner to appear" }
 * );
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  options: TimeoutOptions = {}
): Promise<T> {
  const { timeout = 5000, label = "operation" } = options;

  let timerId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(
        new Error(
          `Timeout: ${label} did not complete within ${timeout} ms`
        )
      );
    }, timeout);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
  }
}
