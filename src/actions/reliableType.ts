import type {
  DetoxMatcher,
  ElementFactory,
  ReliableTypeOptions,
} from "../types/detoxReliabilityTypes";
import { retry, sleep } from "../utils/retry";
import { withTimeout } from "../utils/timeout";

/**
 * Improves typing reliability in text inputs.
 *
 * The function:
 * 1. Waits for the input element to be visible and focused.
 * 2. Clears existing text before typing.
 * 3. Retries the typing operation if the input is not ready.
 * 4. Supports an optional per-character delay for slow renderers.
 *
 * @example
 * await reliableType(by.id("emailInput"), "test@example.com");
 *
 * @param matcher       A Detox matcher.
 * @param text          The text string to type.
 * @param options       Retry, timeout, and character-delay configuration.
 * @param elementFn     Detox's global `element` function (injected for testability).
 * @param waitForFn     Detox's global `waitFor` function (injected for testability).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

export async function reliableType(
  matcher: DetoxMatcher,
  text: string,
  options: ReliableTypeOptions = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elementFn: ElementFactory = g.element as ElementFactory,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  waitForFn: (el: any) => any = g.waitFor
): Promise<void> {
  const { attempts = 3, delay = 500, timeout = 5000, characterDelay } = options;

  if (typeof elementFn !== "function") {
    throw new Error(
      "reliableType: Detox `element` global is not available. " +
        "Ensure Detox is initialised before calling this utility."
    );
  }

  // Wait until the element is visible.
  await withTimeout(
    waitForFn(elementFn(matcher)).toBeVisible().withTimeout(timeout),
    { timeout: timeout + 1000, label: "input element to become visible" }
  );

  await retry(
    async () => {
      const el = elementFn(matcher);
      await el.tap(); // focus the input
      await el.clearText();

      if (characterDelay !== undefined && characterDelay > 0) {
        // Type one character at a time with a delay between each.
        for (const char of text) {
          await el.typeText(char);
          await sleep(characterDelay);
        }
      } else {
        await el.typeText(text);
      }
    },
    { attempts, delay }
  );
}
