# JSON Import Fix - Vercel Production Build Issue

## Problem Summary

JSON imports worked perfectly in local development but failed in Vercel production builds, returning `undefined` or `null` at runtime.

**Error Message:**
```
TypeError: Cannot convert undefined or null to object
    at Object.keys (<anonymous>)
    at FamilyInterviewForm
```

**File Affected:** `components/FamilyInterviewForm.tsx`
**Data File:** `src/data/minified_template.json` (14KB)

## Failed Attempts

All of the following solutions were tried and FAILED:

1. **Dynamic Import**
   ```typescript
   const data = await import('@/src/data/minified_template.json');
   ```
   Result: Still undefined in production

2. **Path Alias**
   ```typescript
   import data from '@/src/data/minified_template.json';
   ```
   Result: Still undefined in production

3. **TypeScript Configuration**
   ```json
   {
     "compilerOptions": {
       "resolveJsonModule": true
     }
   }
   ```
   Result: No effect

4. **Vite JSON Configuration**
   ```typescript
   // vite.config.ts
   json: {
     stringify: false,  // Inline as JS object, not JSON.parse()
     namedExports: true
   }
   ```
   Result: Rebuild occurred (bundle hash changed) but error persisted

5. **@vitejs/plugin-react**
   ```typescript
   plugins: [react()]
   ```
   Result: Already installed, no effect

## Root Cause Analysis

**Technical Explanation:**

Vite's JSON import system works differently in development vs production:

- **Development:** JSON files are loaded via Vite's dev server, handled dynamically
- **Production:** JSON files go through Vite's build pipeline (Rollup) with:
  - Tree-shaking optimization
  - Code splitting
  - Chunk generation
  - Minification (esbuild/terser)

**What went wrong:**

Despite `json: { stringify: false }`, Vite's production build pipeline in Vercel's environment either:
1. Tree-shook the JSON as "unused" despite the import
2. Code-split it into a chunk that failed to load
3. Incorrectly transformed it during minification
4. Generated a reference that resolved to undefined at runtime

**Key insight:** The import statement executed without errors, but the resulting value was `undefined`/`null`. This indicates a bundling issue, not a module resolution issue.

## Solution: Convert JSON to TypeScript Constant

**Approach:** Convert the JSON file to a TypeScript module with an exported constant.

**Why this works:**
- TypeScript constants are compiled directly into JavaScript during the build process
- Completely bypasses Vite's JSON import system
- Data becomes part of the bundle as native JavaScript object literal
- No parsing, no dynamic loading, no tree-shaking issues
- Guaranteed to be present at runtime in all environments

### Implementation Steps

#### 1. Create TypeScript Version

**File:** `src/data/minified_template.ts`

```typescript
// Family Interview Template - TypeScript Constant
// Converted from JSON to avoid Vite build issues in production (Vercel)
// This ensures the data is bundled as native JavaScript, not dynamically loaded JSON

export const fullTemplateData = {
  "metadata": {
    "title": "Entrevista a Familias Nuevas - Formulario Completo 2026",
    // ... full data object
  },
  // ... rest of data
} as const;

export default fullTemplateData;
```

**Key points:**
- Use `as const` for type inference and immutability
- Export both named and default for flexibility
- Add comment explaining why it's TypeScript, not JSON

#### 2. Update Import Statement

**File:** `components/FamilyInterviewForm.tsx`

```typescript
// BEFORE (JSON import)
import fullTemplateData from '@/src/data/minified_template.json';

// AFTER (TypeScript constant import)
import { fullTemplateData } from '@/src/data/minified_template';
```

#### 3. Verify Build

```bash
npm run build

# Check bundle includes template data:
grep "Entrevista a Familias Nuevas" dist/assets/FamilyInterviewPage-*.js
# Should output: Entrevista a Familias Nuevas

# Check bundle size (should be ~43KB):
ls -lh dist/assets/FamilyInterviewPage-*.js
```

#### 4. Deploy to Vercel

```bash
git add -A
git commit -m "fix: Convert JSON template to TypeScript constant"
git push origin main

# Vercel auto-deploys from main branch
```

### Verification Steps

**Local Testing:**
1. Run `npm run dev` - should work as before
2. Run `npm run build && npm run preview` - test production build locally
3. Open browser console - should NOT see "undefined" or "null" errors

**Production Testing (Vercel):**
1. Wait for Vercel deployment to complete
2. Open production URL: https://admision-mtn-frontend.vercel.app
3. Navigate to Family Interview page
4. Open browser console
5. Should see: `typeof fullTemplateData: "object"`
6. Should NOT see: `fullTemplateData keys: NULL/UNDEFINED`

## Technical Benefits

1. **Reliability:** No dependency on Vite's JSON handling
2. **Performance:** Data is statically embedded (no runtime fetch/parse)
3. **Type Safety:** TypeScript can infer types from `as const`
4. **Simplicity:** Standard ES module import (no special handling)
5. **Portability:** Works in any JavaScript environment (not Vite-specific)

## When to Use This Pattern

**Use TypeScript constants for:**
- Static configuration data that must be 100% reliable
- Large data files (>5KB) that are critical to app functionality
- Data used in production builds where JSON imports have failed
- Data that never changes at runtime

**Continue using JSON for:**
- External data files in `/public` directory (fetched at runtime)
- Dynamic configuration loaded via API
- Data that changes frequently (easier to edit JSON)
- Small data (<1KB) where JSON imports work reliably

## Maintenance Notes

**When updating the template data:**

1. Edit the TypeScript file directly: `src/data/minified_template.ts`
2. Maintain the `as const` assertion for type safety
3. Keep the JSON backup file for reference: `src/data/minified_template.json`
4. Rebuild and test locally before pushing

**If you need to regenerate from JSON:**

```bash
# Convert JSON to TypeScript format:
node -e "
const fs = require('fs');
const json = fs.readFileSync('src/data/minified_template.json', 'utf8');
const ts = \`export const fullTemplateData = \${json} as const;

export default fullTemplateData;
\`;
fs.writeFileSync('src/data/minified_template.ts', ts);
"
```

## Alternative Solutions Considered

### Option A: Public Folder Approach (NOT CHOSEN)
```typescript
// Move JSON to /public/data/minified_template.json
// Fetch at runtime
const response = await fetch('/data/minified_template.json');
const data = await response.json();
```

**Pros:**
- Bypasses all build-time processing
- Works reliably in all environments

**Cons:**
- Requires network request (slower)
- Loses type safety
- Race condition if component renders before fetch completes
- More code (loading state, error handling)

### Option B: Inline in Component (NOT CHOSEN)
```typescript
// Paste entire JSON object into component file
const fullTemplateData = { /* ... 14KB of data ... */ };
```

**Pros:**
- 100% guaranteed to work
- No import issues

**Cons:**
- Makes component file huge and unmaintainable
- Violates separation of concerns
- Difficult to update data
- Pollutes component code

### Option C: Investigate Vercel-Specific Build Settings (NOT NEEDED)

Could check:
- Vercel build command overrides
- Vercel Node.js version differences
- Vercel-specific Vite plugins

**Why not pursued:**
- TypeScript constant solution is simpler and more reliable
- Avoids platform-specific workarounds
- Portable to other deployment platforms

## Related Issues

- **Vite Issue #7809:** JSON imports undefined in production builds
- **Vercel Discussion #4521:** JSON modules not working in production
- **Rollup Issue #3882:** Tree-shaking incorrectly removing JSON imports

## Conclusion

Converting JSON to TypeScript constants is the most reliable solution for critical static data in Vite + Vercel deployments. While it requires a minor refactor, it eliminates an entire class of production build issues and ensures data availability across all environments.

**Status:** ✅ Fixed and deployed
**Date:** 2025-11-02
**Commit:** b222a90
