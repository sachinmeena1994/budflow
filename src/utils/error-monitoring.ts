import { toast } from "@/components/ui/sonner";

/**
 * Centralized error monitoring and logging utility
 */
export class ErrorMonitor {
  static log(error: unknown, context?: string) {
    // Log to console (replace with proper monitoring service like Sentry)
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[${timestamp}] ${context || 'Error'}:`, {
      message: errorMessage,
      stack,
      context,
      error
    });
    
    // TODO: Replace with actual monitoring service
    // Example: Sentry.captureException(error, { extra: { context } });
  }

  static logAuthFailure(error: unknown, operation: string) {
    this.log(error, `Auth Operation Failed: ${operation}`);
  }

  static logPermissionFailure(action: string, market?: string) {
    this.log(
      new Error(`Permission denied for action: ${action}${market ? ` in market: ${market}` : ''}`),
      'Permission Check Failed'
    );
  }

  static showUserError(message: string, title = "Error") {
    toast.error(title, {
      description: message,
      duration: 4000
    });
  }

  static showAuthError(message = "Authentication failed. Please try again.") {
    this.showUserError(message, "Authentication Error");
  }
}