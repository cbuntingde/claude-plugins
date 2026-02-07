/**
 * Helper utility functions
 * Follows camelCase naming convention
 */

const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Format a date to a readable string
 * Uses camelCase for function name
 */
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate percentage with error handling
 * Follows naming conventions: camelCase function, PascalCase parameters
 */
export function calculatePercentage(
  value: number,
  total: number
): number {
  if (total === 0) {
    return 0;
  }
  return (value / total) * 100;
}

/**
 * Validate email format
 * Uses UPPER_SNAKE_CASE for constants
 */
export function isValidEmail(email: string): boolean {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return EMAIL_REGEX.test(email);
}

/**
 * Fetch data with retry logic
 * Demonstrates proper function length and parameter limits
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = MAX_RETRY_ATTEMPTS
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
      });

      if (response.ok) {
        return response;
      }

      if (response.status >= 400 && response.status < 500) {
        // Client errors should not be retried
        return response;
      }
    } catch (error) {
      lastError = error as Error;
      // Wait before retrying with exponential backoff
      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
