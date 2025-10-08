/**
 * API Configuration
 * Runtime detection of deployment environment
 */

/**
 * Get the API base URL based on the current environment
 * - Vercel deployments: Use Railway backend
 * - Local development: Use localhost
 */
export function getApiBaseUrl(): string {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return 'http://localhost:8080';
  }

  const hostname = window.location.hostname;

  // Vercel deployment detection
  if (hostname.includes('vercel.app') || hostname === 'admision-mtn-front.vercel.app') {
    return 'https://admisionmtnbackendv2-production.up.railway.app';
  }

  // Custom production domain (if configured)
  if (hostname === 'admision.mtn.cl' || hostname === 'admin.mtn.cl') {
    return 'https://admisionmtnbackendv2-production.up.railway.app';
  }

  // Default to localhost for development
  return 'http://localhost:8080';
}

// Export as constant for static imports
export const API_BASE_URL = getApiBaseUrl();
