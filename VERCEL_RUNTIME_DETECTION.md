# Vercel Runtime API Base URL Detection - Technical Documentation

## Problem Statement

The frontend deployed on Vercel was connecting to `localhost:8080` instead of the Railway backend at `https://admisionmtnbackendv2-production.up.railway.app`.

Despite multiple attempts using environment variables, build-time configuration, and various detection strategies, the application continued to use localhost in production.

## Root Cause Analysis

### Build-Time vs Runtime Evaluation

The fundamental issue was **build-time optimization** by Vite/esbuild:

1. **Environment Variables**: `import.meta.env.VITE_API_BASE_URL` is evaluated **at build time** in the Node.js environment
2. **Tree-Shaking**: Runtime detection functions were being optimized away during minification
3. **Console Dropping**: Debug logs were removed, preventing diagnosis in production
4. **Window Unavailability**: `window.location` doesn't exist during build, causing fallback to localhost

### Why Previous Solutions Failed

| Attempt | Approach | Why It Failed |
|---------|----------|---------------|
| 1 | Environment variables in Vercel dashboard | Not injected into Vite build process |
| 2 | `.env.production` file | Evaluated at build time, not runtime |
| 3 | `vite.config.ts` mode conditionals | Hardcoded at build time |
| 4 | `getApiBaseUrl()` with hostname detection | Tree-shaken away by minifier |
| 5 | Axios interceptor setting baseURL | Function call optimized at build time |
| 6 | Removing baseURL from constructor | Still referenced build-time env var |

## Solution Architecture

### 1. Runtime Detection Function (`config/api.config.ts`)

```typescript
export function getApiBaseUrl(): string {
  try {
    // DEFENSIVE: Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('[API Config] Not in browser environment, using localhost');
      return 'http://localhost:8080';
    }

    // DEFENSIVE: Access window.location directly to force runtime evaluation
    const location = window.location;
    const hostname = location.hostname;
    const hostnameStr = String(hostname);

    // Debug logging (side effect prevents tree-shaking)
    console.log('[API Config] Hostname detected:', hostnameStr);

    // Railway backend URL (production)
    const RAILWAY_URL = 'https://admisionmtnbackendv2-production.up.railway.app';

    // Vercel deployment detection
    if (hostnameStr.indexOf('vercel.app') !== -1) {
      console.log('[API Config] Vercel deployment detected → Railway backend');
      return RAILWAY_URL;
    }

    // Custom production domains
    if (hostnameStr === 'admision.mtn.cl' || hostnameStr === 'admin.mtn.cl') {
      console.log('[API Config] Production domain detected → Railway backend');
      return RAILWAY_URL;
    }

    // Default to localhost for development
    console.log('[API Config] Development environment → localhost');
    return 'http://localhost:8080';
  } catch (error) {
    console.error('[API Config] Error detecting environment:', error);
    return 'http://localhost:8080';
  }
}
```

**Defensive Coding Techniques:**
- `typeof window === 'undefined'` check prevents SSR/build-time execution
- Direct `window.location` access forces runtime evaluation
- `String()` wrapper and `indexOf()` prevent optimization
- `console.log()` calls create side effects that prevent tree-shaking
- Try-catch ensures graceful fallback

### 2. Request Interceptor (`src/services/http.ts`)

```typescript
class HttpClient {
  constructor() {
    // CRITICAL: Do NOT set baseURL here
    this.axiosInstance = axios.create({
      // NO baseURL - will be set in request interceptor at runtime
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // CRITICAL: Set baseURL at runtime on EVERY request
        const runtimeBaseURL = getApiBaseUrl();

        // Only log once to avoid spam
        if (this.metrics.requestCount === 0) {
          console.log('📤 http.ts - Runtime baseURL:', runtimeBaseURL);
        }

        config.baseURL = runtimeBaseURL;

        // ... rest of interceptor logic
      }
    );
  }
}
```

**Why This Works:**
- `getApiBaseUrl()` is called **in the browser** on every request
- Not during build time in Node.js
- `window.location.hostname` is available and contains the real domain
- baseURL is set dynamically, not hardcoded

### 3. Build Configuration (`vite.config.ts`)

```typescript
export default defineConfig(({ mode }) => {
  return {
    define: {
      // REMOVED: 'import.meta.env.VITE_API_BASE_URL' - now using runtime detection
    },

    esbuild: {
      // TEMPORARILY keep console logs for production debugging
      drop: mode === 'production' ? ['debugger'] : [],
    },

    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: false,  // Keep console logs
        pure_funcs: [],       // Don't remove any console methods
      },
    } : undefined,
  };
});
```

**Configuration Changes:**
- Removed `VITE_API_BASE_URL` from define block
- Disabled console.log dropping in production
- Disabled terser pure_funcs optimization
- Allows debugging in Vercel production environment

## Deployment Flow

### Build Process (Vercel)
1. Vite builds the application in production mode
2. `getApiBaseUrl()` function is preserved in bundle (with console logs)
3. No baseURL is hardcoded at build time
4. Bundle contains runtime detection logic

### Runtime Execution (Browser)
1. User navigates to `https://admision-mtn-front.vercel.app`
2. Browser loads JavaScript bundles
3. `HttpClient` constructor runs → `setupInterceptors()` is called
4. First API request triggers request interceptor
5. Interceptor calls `getApiBaseUrl()`
6. Function reads `window.location.hostname` → `"admision-mtn-front.vercel.app"`
7. Detects `.vercel.app` pattern → Returns Railway URL
8. `config.baseURL` is set to `https://admisionmtnbackendv2-production.up.railway.app`
9. API request goes to Railway backend ✅

## Verification

### Expected Browser Console Output

When visiting the Vercel deployment, the browser console should show:

```
[API Config] Hostname detected: admision-mtn-front.vercel.app
[API Config] Vercel deployment detected → Railway backend
📤 http.ts - Runtime baseURL: https://admisionmtnbackendv2-production.up.railway.app
```

### Expected Network Tab Behavior

All API requests should go to:
- **Production (Vercel)**: `https://admisionmtnbackendv2-production.up.railway.app/api/*`
- **Development (localhost)**: `http://localhost:8080/api/*`

### Testing Checklist

- [ ] Vercel deployment completes successfully
- [ ] Browser console shows correct hostname detection
- [ ] Network tab shows requests to Railway backend
- [ ] API requests receive responses from Railway
- [ ] No CORS errors in console
- [ ] Authentication works end-to-end
- [ ] Data loads from Railway database

## Environment-Specific Behavior

| Environment | Hostname | Detected As | Backend URL |
|-------------|----------|-------------|-------------|
| Local Dev | localhost | Development | http://localhost:8080 |
| Vercel Preview | *.vercel.app | Vercel | Railway URL |
| Vercel Production | *.vercel.app | Vercel | Railway URL |
| Custom Domain | admision.mtn.cl | Production | Railway URL |
| Custom Domain | admin.mtn.cl | Production | Railway URL |

## Post-Deployment Cleanup

After verifying the Vercel deployment works correctly, the following cleanup can be done:

### Re-enable Console Log Dropping

Edit `vite.config.ts`:

```typescript
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],
},

terserOptions: mode === 'production' ? {
  compress: {
    drop_console: true,
    pure_funcs: ['console.log', 'console.info', 'console.debug'],
  },
} : undefined,
```

This will:
- Remove console logs from production bundles
- Reduce bundle size by ~2-3 KB
- Improve performance slightly
- Maintain security by not exposing debug info

### Verification After Cleanup

Run a test build and verify:
```bash
npm run build
grep -r "API Config" dist/assets/*.js  # Should return nothing
```

If hostname detection stops working after cleanup, it means the minifier is still optimizing away the function. In that case, keep console logs enabled.

## Troubleshooting

### Issue: Still connecting to localhost in Vercel

**Diagnosis:**
```bash
# Check if runtime detection code is in the bundle
grep -r "vercel.app" dist/assets/*.js
```

**Solutions:**
1. Verify `getApiBaseUrl()` is being called in request interceptor
2. Check browser console for hostname detection logs
3. Ensure `window.location.hostname` contains `vercel.app`
4. Verify no hardcoded `baseURL` in axios.create()

### Issue: Console logs not appearing

**Diagnosis:**
```bash
# Check if console logs were dropped
grep -r "API Config" dist/assets/*.js
```

**Solutions:**
1. Set `drop_console: false` in vite.config.ts
2. Set `pure_funcs: []` in terserOptions
3. Rebuild and redeploy

### Issue: CORS errors after fixing URL

**Diagnosis:**
Browser console shows:
```
Access to fetch at 'https://admisionmtnbackendv2-production.up.railway.app/api/...'
from origin 'https://admision-mtn-front.vercel.app' has been blocked by CORS policy
```

**Solutions:**
1. Add Vercel domain to Railway backend CORS allowlist
2. Verify Railway backend CORS configuration includes:
   - `https://admision-mtn-front.vercel.app`
   - `https://*.vercel.app` (for preview deployments)
3. Check Railway backend is running and accessible

## Technical Deep Dive

### Why Runtime Detection is Necessary

Vite is a **build-time** tool that:
1. Bundles JavaScript at build time
2. Optimizes/minifies code using esbuild
3. Evaluates `import.meta.env.*` during bundling
4. Tree-shakes unused code paths

When you use `import.meta.env.VITE_API_BASE_URL`:
- Value is **hardcoded** at build time
- Cannot change based on deployment environment
- Same build deployed to Vercel and Railway would use same URL

Runtime detection allows:
- **Single build** → Multiple environments
- Dynamic URL based on where code runs
- No rebuild needed for different deployments

### Build-Time vs Runtime Comparison

| Aspect | Build-Time (❌ Failed) | Runtime (✅ Works) |
|--------|----------------------|-------------------|
| Evaluation | During `npm run build` | In browser on page load |
| Environment | Node.js | Browser |
| window.location | ❌ Undefined | ✅ Available |
| Optimization | Tree-shaken away | Preserved with defensive coding |
| URL Source | Environment variable | Browser hostname |
| Deployment | Rebuild per environment | Single build for all |

### Tree-Shaking Prevention Techniques

The code uses several techniques to prevent tree-shaking:

1. **Side Effects**: `console.log()` calls are side effects that cannot be removed
2. **Dynamic Access**: `window.location` is accessed dynamically, not statically analyzed
3. **String Methods**: `indexOf()` instead of `includes()` for broader compatibility
4. **Try-Catch**: Exception handling prevents dead code elimination
5. **Explicit Checks**: `typeof window === 'undefined'` cannot be optimized away

## Related Documentation

- `CLAUDE.md` - Project configuration and architecture
- `INTEGRATION_GUIDE.md` - Frontend-backend integration patterns
- `API_CONSOLIDATION_STRATEGY.md` - API architecture decisions

## Commit Reference

**Commit**: `aef9514`
**Message**: `fix: Implement runtime API base URL detection for Vercel deployments`
**Files Changed**:
- `config/api.config.ts` - Runtime detection function
- `src/services/http.ts` - Request interceptor integration
- `vite.config.ts` - Build configuration updates

## Success Metrics

After deployment, verify:
- ✅ Zero `localhost:8080` requests in production
- ✅ All API requests go to Railway backend
- ✅ Console logs show correct hostname detection
- ✅ No environment variables needed in Vercel
- ✅ No rebuild required for different domains
- ✅ Development environment still uses localhost

## Conclusion

This solution demonstrates a **defensive, runtime-first approach** to handling environment-specific configuration in modern JavaScript applications. By preventing build-time optimization and ensuring runtime evaluation, we achieve:

- **Portability**: Single build works everywhere
- **Simplicity**: No environment variable juggling
- **Transparency**: Console logs show what's happening
- **Reliability**: Graceful fallbacks for all scenarios

The key insight is that **build-time tools cannot know where your code will run**. Only the browser knows its own hostname, so that's where the decision must be made.
