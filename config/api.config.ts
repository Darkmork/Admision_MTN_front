/**
 * API Configuration
 * Runtime detection of deployment environment
 *
 * IMPORTANT: This must be evaluated at RUNTIME in the browser,
 * not at build time, to properly detect the hostname.
 */

/**
 * Get the API base URL based on the current environment
 * - Vercel deployments: Use Railway backend
 * - Local development: Use localhost
 *
 * This function is intentionally written to prevent tree-shaking
 * and force runtime evaluation.
 */
export function getApiBaseUrl(): string {
  // This will be called in the browser at runtime
  // DO NOT simplify this code or it will be optimized away

  try {
    // Force runtime evaluation by accessing window directly
    const hostname = (window as any).location.hostname;

    // Log for debugging
    console.log('[API Config] Hostname detected:', hostname);

    // Vercel deployment detection
    if (String(hostname).indexOf('vercel.app') !== -1) {
      console.log('[API Config] Vercel deployment detected → Railway backend');
      return 'https://admisionmtnbackendv2-production.up.railway.app';
    }

    // Custom production domains
    if (hostname === 'admision.mtn.cl' || hostname === 'admin.mtn.cl') {
      console.log('[API Config] Production domain detected → Railway backend');
      return 'https://admisionmtnbackendv2-production.up.railway.app';
    }

    // Default to localhost
    console.log('[API Config] Development environment → localhost');
    return 'http://localhost:8080';
  } catch (e) {
    // Fallback if window is not available (SSR/build time)
    console.warn('[API Config] Window not available, using localhost');
    return 'http://localhost:8080';
  }
}
