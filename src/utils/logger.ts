/**
 * Conditional Logger Utility
 *
 * Only logs in development mode to prevent console spam in production.
 * This significantly improves performance by reducing browser console overhead.
 */

const isDevelopment = import.meta.env.MODE === 'development';

/**
 * Enable/disable logging for specific modules
 * Set to false to completely silence logs even in development
 */
const LOG_CONFIG = {
  http: false,           // HTTP client logs (very verbose - 8 logs per request)
  api: false,            // API service logs
  auth: false,           // Authentication logs
  dashboard: false,      // Dashboard component logs
  services: false,       // General service logs
  errors: true,          // Always log errors
  warnings: true,        // Always log warnings
};

class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  /**
   * Check if logging is enabled for this module
   */
  private isEnabled(level: 'log' | 'error' | 'warn' | 'info' | 'debug'): boolean {
    // Always log errors and warnings
    if (level === 'error' && LOG_CONFIG.errors) return true;
    if (level === 'warn' && LOG_CONFIG.warnings) return true;

    // In production, only log errors and warnings
    if (!isDevelopment) return false;

    // In development, check module-specific config
    const moduleKey = this.module.toLowerCase() as keyof typeof LOG_CONFIG;
    return LOG_CONFIG[moduleKey] ?? LOG_CONFIG.services;
  }

  log(...args: any[]) {
    if (this.isEnabled('log')) {
      console.log(`[${this.module}]`, ...args);
    }
  }

  info(...args: any[]) {
    if (this.isEnabled('info')) {
      console.info(`[${this.module}]`, ...args);
    }
  }

  warn(...args: any[]) {
    if (this.isEnabled('warn')) {
      console.warn(`[${this.module}]`, ...args);
    }
  }

  error(...args: any[]) {
    if (this.isEnabled('error')) {
      console.error(`[${this.module}]`, ...args);
    }
  }

  debug(...args: any[]) {
    if (this.isEnabled('debug')) {
      console.debug(`[${this.module}]`, ...args);
    }
  }

  /**
   * Group logs together (collapsed by default in production)
   */
  group(label: string, collapsed: boolean = !isDevelopment) {
    if (this.isEnabled('log')) {
      if (collapsed) {
        console.groupCollapsed(`[${this.module}] ${label}`);
      } else {
        console.group(`[${this.module}] ${label}`);
      }
    }
  }

  groupEnd() {
    if (this.isEnabled('log')) {
      console.groupEnd();
    }
  }

  /**
   * Measure execution time
   */
  time(label: string) {
    if (this.isEnabled('log')) {
      console.time(`[${this.module}] ${label}`);
    }
  }

  timeEnd(label: string) {
    if (this.isEnabled('log')) {
      console.timeEnd(`[${this.module}] ${label}`);
    }
  }
}

/**
 * Create a logger for a specific module
 */
export function createLogger(module: string): Logger {
  return new Logger(module);
}

/**
 * Default logger for general use
 */
export const logger = new Logger('App');

export default Logger;
