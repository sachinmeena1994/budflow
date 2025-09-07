
import { toast } from "@/components/ui/sonner";

// Error types
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical"
}

interface ErrorOptions {
  severity?: ErrorSeverity;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Centralized error handling function
 * 
 * @param error - Error object or string message
 * @param options - Configuration options for the error display
 */
export function handleError(error: unknown, options?: ErrorOptions): void {
  // Default options
  const severity = options?.severity || ErrorSeverity.ERROR;
  const duration = options?.duration || 2000;

  // Extract error message
  let message = "An unknown error occurred";
  
  if (error instanceof Error) {
    message = error.message;
    // Log to console for debugging
    console.error(`${severity.toUpperCase()}: ${error.message}`, error);
  } else if (typeof error === 'string') {
    message = error;
    console.error(`${severity.toUpperCase()}: ${error}`);
  } else {
    console.error(`${severity.toUpperCase()}: Unknown error`, error);
  }

  // Display toast based on severity
  switch (severity) {
    case ErrorSeverity.INFO:
      toast.info(message, { duration });
      break;
    case ErrorSeverity.WARNING:
      toast.warning(message, { duration });
      break;
    case ErrorSeverity.ERROR:
      toast.error(message, { duration });
      break;
    case ErrorSeverity.CRITICAL:
      toast.error(message, { 
        duration,
        className: "border-destructive bg-destructive/20",
      });
      break;
  }
}

/**
 * Higher-order function to wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: ErrorOptions
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      return undefined;
    }
  };
}
