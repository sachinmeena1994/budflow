
import { sleep } from "@/lib/utils";

/**
 * Base API client with common utilities for mocking API calls
 */
export const apiClient = {
  /**
   * Simulate API call with configurable delay and optional error
   */
  async mockCall<T>(
    data: T,
    options?: {
      delay?: number;
      shouldFail?: boolean;
      errorMessage?: string;
    }
  ): Promise<T> {
    const delay = options?.delay || Math.random() * 500 + 200;
    
    await sleep(delay);
    
    if (options?.shouldFail) {
      throw new Error(options.errorMessage || "API request failed");
    }
    
    return data;
  }
};
