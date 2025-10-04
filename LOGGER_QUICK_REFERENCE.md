# Logger Quick Reference Guide

## Import

```typescript
import { Logger } from '@/utils/logger';
```

## Basic Usage

```typescript
// Information logs (DEV only)
Logger.info('User successfully logged in');
Logger.info('Data loaded:', { count: items.length });

// Warning logs (DEV only)
Logger.warn('Deprecated API endpoint used');
Logger.warn('Missing optional field:', fieldName);

// Error logs (DEV only, sends to error tracking in PROD)
Logger.error('Failed to load data:', error);
Logger.error('Network request failed:', { url, status });

// Debug logs (DEV + VITE_DEBUG_MODE=true only)
Logger.debug('Component state:', state);
Logger.debug('Calculated value:', result);
```

## What Gets Logged Where

| Logger Method | Development | Production |
|--------------|-------------|------------|
| `Logger.info()` | ✅ Console | ❌ Silent |
| `Logger.warn()` | ✅ Console | ❌ Silent |
| `Logger.error()` | ✅ Console | ⚠️ Error Tracking Service* |
| `Logger.debug()` | ✅ Console (if DEBUG=true) | ❌ Silent |

*Requires Sentry/LogRocket integration (TODO)

## Automatic Data Sanitization

The Logger automatically redacts sensitive fields:

```typescript
// Example: This is SAFE to log
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  password: 'secret123',
  apiKey: 'sk-1234567890abcdef'
};

Logger.info('User data:', userData);

// Output in console (DEV):
// [INFO] 2025-10-04T10:30:00.000Z User data: {
//   name: 'John Doe',
//   email: 'john@example.com',
//   token: 'eyJ[REDACTED]',
//   password: '[REDACTED]',
//   apiKey: 'sk-[REDACTED]'
// }
```

**Protected keywords:** token, password, authorization, secret, apiKey, credentials, auth, jwt, bearer, apiSecret, privateKey, accessToken, refreshToken, sessionId, sessionToken, authToken, passwordHash, salt

## Environment Configuration

### .env.development
```bash
VITE_DEBUG_MODE=true  # Show debug logs
```

### .env.production
```bash
VITE_DEBUG_MODE=false  # Silent (always)
```

## Common Patterns

### API Requests
```typescript
// ❌ DON'T
console.log('Making request to:', url);
console.log('Response:', response.data);

// ✅ DO
Logger.debug('API request:', { method, url });
Logger.debug('API response status:', response.status);
```

### Authentication
```typescript
// ❌ DON'T - Exposes token!
console.log('Token:', token);
console.log('User:', user);

// ✅ DO
Logger.info('Authentication successful');
// Don't log tokens or user objects
```

### Error Handling
```typescript
// ❌ DON'T
console.error('Error:', error);

// ✅ DO
Logger.error('Failed to load applications:', error);
```

### Component Lifecycle
```typescript
// ❌ DON'T
console.log('Component mounted');
console.log('State updated:', newState);

// ✅ DO
Logger.debug('Component mounted');
Logger.debug('State updated');
```

## Production Verification

### After building for production:
```bash
npm run build
npm run preview
```

1. Open browser DevTools Console (F12)
2. Navigate through the application
3. Console should be **completely empty**
4. No logs, warnings, or errors should appear

If you see any console output in production preview, the sanitization failed.

## Pre-Commit Checklist

Before committing code, search for:

```bash
grep -r "console\." src/ services/ components/ pages/
```

If this returns any results, replace `console.*` with `Logger.*`

## Need Help?

- Full documentation: `CONSOLE_SANITIZATION_REPORT.md`
- Logger implementation: `src/utils/logger.ts`
- Questions? Ask the team lead

---

**Last Updated:** 2025-10-04
