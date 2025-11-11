/**
 * Logging Configuration
 *
 * Control verbosity of console logs in development and production.
 * Set ENABLE_VERBOSE_LOGS to false to significantly improve performance.
 */

// Detect environment
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

/**
 * CRITICAL PERFORMANCE SETTING
 *
 * Set to FALSE to disable verbose logging and improve performance by 50-70%
 *
 * Current issue: With ENABLE_VERBOSE_LOGS = true:
 * - http.ts logs 8 times per request
 * - 50 API calls = 400+ logs in console
 * - Browser slows down significantly
 *
 * Recommended: FALSE in production, FALSE or TRUE in development (your choice)
 */
export const ENABLE_VERBOSE_LOGS = false;

/**
 * Always log errors regardless of verbose setting
 */
export const ALWAYS_LOG_ERRORS = true;

/**
 * Always log warnings regardless of verbose setting
 */
export const ALWAYS_LOG_WARNINGS = true;

/**
 * Module-specific logging (only works if ENABLE_VERBOSE_LOGS = true)
 */
export const MODULE_LOGGING = {
  http: false,              // HTTP client (VERY VERBOSE - 8 logs per request)
  api: false,               // API calls
  auth: false,              // Authentication
  csrf: false,              // CSRF tokens
  dashboard: false,         // Dashboard loading
  services: false,          // General services
  forms: false,             // Form submissions
  uploads: false,           // File uploads
};

/**
 * Conditional console.log wrapper
 * Only logs if ENABLE_VERBOSE_LOGS is true
 */
export const vlog = (...args: any[]) => {
  if (ENABLE_VERBOSE_LOGS) {
    console.log(...args);
  }
};

/**
 * Conditional console.info wrapper
 */
export const vinfo = (...args: any[]) => {
  if (ENABLE_VERBOSE_LOGS) {
    console.info(...args);
  }
};

/**
 * Conditional console.debug wrapper
 */
export const vdebug = (...args: any[]) => {
  if (ENABLE_VERBOSE_LOGS) {
    console.debug(...args);
  }
};

/**
 * Always log errors (unless specifically disabled)
 */
export const verror = (...args: any[]) => {
  if (ALWAYS_LOG_ERRORS) {
    console.error(...args);
  }
};

/**
 * Always log warnings (unless specifically disabled)
 */
export const vwarn = (...args: any[]) => {
  if (ALWAYS_LOG_WARNINGS) {
    console.warn(...args);
  }
};

/**
 * Module-specific logging
 * Usage: mlog('http', 'Request sent', data)
 */
export const mlog = (module: keyof typeof MODULE_LOGGING, ...args: any[]) => {
  if (ENABLE_VERBOSE_LOGS && MODULE_LOGGING[module]) {
    console.log(`[${module}]`, ...args);
  }
};

/**
 * Performance helper: measure execution time
 * Only runs if ENABLE_VERBOSE_LOGS is true
 */
export const vtime = (label: string) => {
  if (ENABLE_VERBOSE_LOGS) {
    console.time(label);
  }
};

export const vtimeEnd = (label: string) => {
  if (ENABLE_VERBOSE_LOGS) {
    console.timeEnd(label);
  }
};

export default {
  isDevelopment,
  isProduction,
  ENABLE_VERBOSE_LOGS,
  ALWAYS_LOG_ERRORS,
  ALWAYS_LOG_WARNINGS,
  MODULE_LOGGING,
  vlog,
  vinfo,
  vdebug,
  verror,
  vwarn,
  mlog,
  vtime,
  vtimeEnd,
};
