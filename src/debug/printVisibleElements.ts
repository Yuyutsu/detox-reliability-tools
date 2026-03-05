/**
 * Logs currently visible element IDs and labels to the console.
 *
 * Detox does not expose a DOM-like API for listing visible elements, so this
 * utility relies on `element` + `by` matchers to query common identifiers
 * supplied by the caller.  This is intentionally simple: it is designed to
 * provide a quick "what is on screen?" snapshot when a test fails in CI.
 *
 * @example
 * await debug.printVisibleElements(["loginButton", "emailInput", "errorBanner"]);
 *
 * @param elementIds    A list of accessibility identifiers to probe.
 * @param elementFn     Detox's global `element` function (injected for testability).
 * @param byFn          Detox's global `by` object (injected for testability).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

export async function printVisibleElements(
  elementIds: string[] = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elementFn: ((matcher: any) => any) | undefined = g.element,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  byFn: any = g.by
): Promise<void> {
  if (typeof elementFn !== "function" || !byFn) {
    console.warn(
      "[detox-reliability-tools] printVisibleElements: Detox globals are not " +
        "available — skipping element inspection."
    );
    return;
  }

  console.log("[detox-reliability-tools] Checking visible elements:");

  for (const id of elementIds) {
    try {
      // `getAttributes` is the most reliable way to probe an element without
      // throwing when it doesn't exist.  Falls back to a no-op tap check.
      const el = elementFn(byFn.id(id));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const attrs: any = await (el as any).getAttributes();
      const visible = attrs?.visible ?? "unknown";
      console.log(`  [${id}] visible=${String(visible)}`);
    } catch {
      console.log(`  [${id}] not found / not accessible`);
    }
  }
}

/**
 * Logs the current top-level screen name using Detox's `getCurrentActivity`
 * (Android) or the equivalent iOS API, if available.
 *
 * Falls back to a simple console message when the API is unavailable.
 *
 * @example
 * await debug.logCurrentScreen();
 */
export async function logCurrentScreen(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deviceInstance: any = g.device
): Promise<void> {
  if (!deviceInstance) {
    console.warn(
      "[detox-reliability-tools] logCurrentScreen: Detox `device` is not " +
        "available — skipping screen log."
    );
    return;
  }

  try {
    if (typeof deviceInstance.getCurrentActivity === "function") {
      const activity: string = await deviceInstance.getCurrentActivity();
      console.log(`[detox-reliability-tools] Current activity: ${activity}`);
    } else {
      console.log(
        "[detox-reliability-tools] logCurrentScreen: getCurrentActivity is " +
          "not supported on this platform."
      );
    }
  } catch (err) {
    console.warn(
      `[detox-reliability-tools] logCurrentScreen failed: ${String(err)}`
    );
  }
}
