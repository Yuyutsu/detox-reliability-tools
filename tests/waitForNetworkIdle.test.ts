import { waitForNetworkIdle } from "../src/wait/waitForNetworkIdle";

describe("waitForNetworkIdle", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("resolves immediately after idleDuration when no activeRequestCount is provided", async () => {
    const promise = waitForNetworkIdle({ idleDuration: 200 });
    await jest.advanceTimersByTimeAsync(200);
    await expect(promise).resolves.toBeUndefined();
  });

  it("resolves once the active request count stays at 0 for idleDuration", async () => {
    let count = 2;
    const activeRequestCount = jest.fn(() => count);

    const promise = waitForNetworkIdle({
      timeout: 5000,
      idleDuration: 300,
      activeRequestCount,
    });

    // Advance while count is non-zero — loop polls but no idle timer yet.
    await jest.advanceTimersByTimeAsync(200);
    count = 0; // Requests finish.
    // Advance past idleDuration so the loop detects stable idle.
    await jest.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toBeUndefined();
  });

  it("rejects with a timeout error when requests never finish", async () => {
    const activeRequestCount = jest.fn(() => 1); // Always busy.

    const promise = waitForNetworkIdle({
      timeout: 1000,
      idleDuration: 300,
      activeRequestCount,
    });
    // Attach rejection handler before advancing to avoid unhandled rejection warning.
    const expectation = expect(promise).rejects.toThrow(
      /waitForNetworkIdle: network did not become idle within 1000 ms/
    );
    await jest.advanceTimersByTimeAsync(1100);
    await expectation;
  });

  it("resets the idle timer when a new request appears after going idle", async () => {
    let count = 0;
    const activeRequestCount = jest.fn(() => count);

    const promise = waitForNetworkIdle({
      timeout: 5000,
      idleDuration: 400,
      activeRequestCount,
    });

    // Goes idle briefly, then a new request starts.
    await jest.advanceTimersByTimeAsync(150);
    count = 1; // New request appears.
    await jest.advanceTimersByTimeAsync(200);
    count = 0; // Request finishes again.
    // Now truly idle for idleDuration.
    await jest.advanceTimersByTimeAsync(600);

    await expect(promise).resolves.toBeUndefined();
  });
});

