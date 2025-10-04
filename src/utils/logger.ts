/**
 * Centralized Production-Grade Logging Utility
 *
 * Features:
 * - Environment-aware logging (DEV only by default)
 * - Automatic sensitive data sanitization
 * - Zero console output in production builds
 * - Configurable debug mode via VITE_DEBUG_MODE
 * - Error tracking service integration ready
 *
 * Usage:
 * import { Logger } from '@/utils/logger';
 *
 * Logger.info('User logged in');
 * Logger.error('API request failed', error);
 * Logger.debug('Component state', state);
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  args: any[];
}

class LoggerService {
  private isDevelopment: boolean;
  private isDebugMode: boolean;
  private sensitiveKeys = [
    'token',
    'password',
    'authorization',
    'secret',
    'apiKey',
    'credentials',
    'auth',
    'jwt',
    'bearer',
    'apiSecret',
    'privateKey',
    'accessToken',
    'refreshToken',
    'sessionId',
    'sessionToken',
    'authToken',
    'passwordHash',
    'salt',
  ];

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
  }

  /**
   * Sanitize arguments to remove sensitive data before logging
   */
  private sanitizeArgs(args: any[]): any[] {
    return args.map(arg => this.sanitizeValue(arg));
  }

  private sanitizeValue(value: any): any {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Handle primitive types
    if (typeof value !== 'object') {
      return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeValue(item));
    }

    // Handle objects
    const sanitized: any = {};
    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive information
      const isSensitive = this.sensitiveKeys.some(sensitiveKey =>
        lowerKey.includes(sensitiveKey.toLowerCase())
      );

      if (isSensitive) {
        // Redact sensitive values
        if (typeof val === 'string' && val.length > 0) {
          // Show first 3 chars for debugging, rest is redacted
          sanitized[key] = val.substring(0, 3) + '[REDACTED]';
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeValue(val);
      }
    }

    return sanitized;
  }

  /**
   * Format log prefix with level and timestamp
   */
  private formatPrefix(level: LogLevel): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase();
    return `[${levelUpper}] ${timestamp}`;
  }

  /**
   * Log informational messages (development only)
   */
  info(...args: any[]): void {
    if (this.isDevelopment) {
      const sanitized = this.sanitizeArgs(args);
      console.info(this.formatPrefix('info'), ...sanitized);
    }
  }

  /**
   * Log warning messages (development only)
   */
  warn(...args: any[]): void {
    if (this.isDevelopment) {
      const sanitized = this.sanitizeArgs(args);
      console.warn(this.formatPrefix('warn'), ...sanitized);
    }
  }

  /**
   * Log error messages
   * In development: logs to console
   * In production: should send to error tracking service (Sentry, LogRocket, etc.)
   */
  error(...args: any[]): void {
    if (this.isDevelopment) {
      const sanitized = this.sanitizeArgs(args);
      console.error(this.formatPrefix('error'), ...sanitized);
    } else {
      // In production, send to error tracking service
      // TODO: Integrate with Sentry/LogRocket/DataDog
      // Example: Sentry.captureException(args[0]);
      this.reportToErrorTracking(args);
    }
  }

  /**
   * Log debug messages (development + debug mode only)
   * Requires VITE_DEBUG_MODE=true in .env
   */
  debug(...args: any[]): void {
    if (this.isDevelopment && this.isDebugMode) {
      const sanitized = this.sanitizeArgs(args);
      console.debug(this.formatPrefix('debug'), ...sanitized);
    }
  }

  /**
   * Log table data (development only)
   * Useful for visualizing arrays of objects
   */
  table(data: any[]): void {
    if (this.isDevelopment) {
      const sanitized = this.sanitizeArgs([data])[0];
      console.table(sanitized);
    }
  }

  /**
   * Group related log messages (development only)
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * End grouped log messages (development only)
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Report errors to tracking service in production
   * Override this method to integrate with your error tracking service
   */
  private reportToErrorTracking(args: any[]): void {
    // Placeholder for error tracking integration
    // In production, this would send errors to:
    // - Sentry: Sentry.captureException()
    // - LogRocket: LogRocket.captureException()
    // - DataDog: DD_LOGS.logger.error()

    // For now, silently fail in production
    // Never use console in production
  }

  /**
   * Get current environment info for debugging
   */
  getEnvironmentInfo(): { isDevelopment: boolean; isDebugMode: boolean } {
    return {
      isDevelopment: this.isDevelopment,
      isDebugMode: this.isDebugMode,
    };
  }
}

// Export singleton instance
export const Logger = new LoggerService();

// Type export for external use
export type { LogLevel, LogEntry };
