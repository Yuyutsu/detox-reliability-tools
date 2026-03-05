import { waitForUIStable } from "../src/wait/waitForUIStable";

describe("waitForUIStable", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("resolves after the default delay (300 ms) when no isStable is provided", async () => {
    const promise = waitForUIStable();
    await jest.advanceTimersByTimeAsync(300);
    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves after a custom delay when no isStable is provided", async () => {
    const promise = waitForUIStable({ delay: 150 });
    await jest.advanceTimersByTimeAsync(150);
    await expect(promise).resolves.toBeUndefined();
  });

  it("polls isStable and resolves once it returns true", async () => {
    let stable = false;
    const isStable = jest.fn(async () => stable);

    const promise = waitForUIStable({
      isStable,
      delay: 0,
      timeout: 5000,
    });

    // Advance while unstable.
    await jest.advanceTimersByTimeAsync(300);
    stable = true;
    // Advance enough for the poll loop to detect stability + settle delay.
    await jest.advanceTimersByTimeAsync(300);

    await expect(promise).resolves.toBeUndefined();
    expect(isStable).toHaveBeenCalled();
  });

  it("rejects when isStable never returns true within the timeout", async () => {
    const isStable = jest.fn(async () => false);

    const promise = waitForUIStable({
      isStable,
      delay: 100,
      timeout: 500,
    });
    // Attach rejection handler before advancing timers.
    const expectation = expect(promise).rejects.toThrow(
      /waitForUIStable: UI did not stabilise within 500 ms/
    );
    await jest.advanceTimersByTimeAsync(700);
    await expectation;
  });

  it("supports a synchronous isStable predicate", async () => {
    const isStable = jest.fn(() => true);

    const promise = waitForUIStable({ isStable, delay: 0, timeout: 1000 });
    await jest.advanceTimersByTimeAsync(200);

    await expect(promise).resolves.toBeUndefined();
  });
});

