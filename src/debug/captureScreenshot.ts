import type { DetoxDevice } from "../types/detoxReliabilityTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

/**
 * Captures a screenshot using Detox's `device.takeScreenshot` API and returns
 * the file path.
 *
 * If the Detox `device` global is not available (e.g. in unit-test
 * environments) the function logs a warning and returns `null` instead of
 * throwing, so it can safely be called from `afterEach` blocks without
 * masking the original failure.
 *
 * @example
 * await debug.captureScreenshot("login-failure");
 *
 * @param name  A descriptive label embedded in the screenshot file name.
 * @param deviceInstance  Detox `device` (injected for testability).
 */
export async function captureScreenshot(
  name: string = "screenshot",
  deviceInstance: DetoxDevice | undefined = g.device as DetoxDevice | undefined
): Promise<string | null> {
  if (!deviceInstance || typeof deviceInstance.takeScreenshot !== "function") {
    console.warn(
      "[detox-reliability-tools] captureScreenshot: Detox `device` is not " +
        "available — skipping screenshot capture."
    );
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const screenshotName = `${name}-${timestamp}`;

  try {
    const path = await deviceInstance.takeScreenshot(screenshotName);
    console.log(
      `[detox-reliability-tools] Screenshot saved: ${path}`
    );
    return path;
  } catch (err) {
    console.warn(
      `[detox-reliability-tools] captureScreenshot failed: ${String(err)}`
    );
    return null;
  }
}
