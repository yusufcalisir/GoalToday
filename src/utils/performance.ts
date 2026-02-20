import { featureFlags } from './featureFlags';

/**
 * Utility for performance measurement and logging.
 */
export const performance = {
  /**
   * Tracks the execution time of a synchronous function.
   * @param label A label to identify the measurement.
   * @param fn The function to execute.
   */
  measure: <T>(label: string, fn: () => T): T => {
    if (!__DEV__) return fn();

    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;

    if (duration > 16) {
      console.warn(`[Performance] ${label} took ${duration}ms (potential frame drop)`);
    } else {
      console.log(`[Performance] ${label} took ${duration}ms`);
    }

    return result;
  },

  /**
   * Tracks the execution time of an asynchronous function.
   * @param label A label to identify the measurement.
   * @param fn The async function to execute.
   */
  measureAsync: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    if (!__DEV__) return await fn();

    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;

    console.log(`[Performance] ${label} (Async) took ${duration}ms`);
    return result;
  },

  /**
   * Simple screen load timer.
   */
  startTimer: (label: string) => {
    if (!__DEV__) return () => {};
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      console.log(`[Performance] Screen ${label} loaded in ${duration}ms`);
    };
  }
};
