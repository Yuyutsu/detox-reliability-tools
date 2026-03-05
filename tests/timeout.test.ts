import { withTimeout } from "../src/utils/timeout";

describe("withTimeout", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("resolves with the promise value when it settles before the timeout", async () => {
    const p = Promise.resolve(42);
    const result = await withTimeout(p, { timeout: 1000 });
    expect(result).toBe(42);
  });

  it("rejects with a timeout error when the promise takes too long", async () => {
    const neverResolves = new Promise<never>(() => {});
    const promise = withTimeout(neverResolves, {
      timeout: 500,
      label: "slow operation",
    });
    jest.advanceTimersByTime(501);
    await expect(promise).rejects.toThrow(
      /Timeout: slow operation did not complete within 500 ms/
    );
  });

  it("uses default timeout of 5000 ms and 'operation' label", async () => {
    const neverResolves = new Promise<never>(() => {});
    const promise = withTimeout(neverResolves);
    jest.advanceTimersByTime(5001);
    await expect(promise).rejects.toThrow(
      /Timeout: operation did not complete within 5000 ms/
    );
  });

  it("propagates errors thrown by the underlying promise", async () => {
    const failing = Promise.reject(new Error("upstream error"));
    await expect(withTimeout(failing, { timeout: 1000 })).rejects.toThrow(
      "upstream error"
    );
  });

  it("clears the internal timer when the promise resolves (no timer leak)", async () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const p = Promise.resolve("data");
    await withTimeout(p, { timeout: 2000 });
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
