# Rollback Plan - RSA Encryption Removal

**Date**: October 16, 2025
**Purpose**: Remove RSA encryption from frontend authentication
**Reason**: Simplification - credentials will be sent over HTTPS only

---

## Changes Made

### Files Modified

1. **src/services/authService.ts**
   - Removed: `encryptCredentials()` call in `login()` method
   - Changed: Direct credential sending without encryption
   - Lines affected: ~50-80

2. **src/services/professorAuthService.ts**
   - Removed: `encryptCredentials()` call in `login()` method
   - Changed: Direct credential sending without encryption
   - Lines affected: ~50-80

3. **src/services/encryptionService.ts**
   - Status: Kept but marked as deprecated
   - Added: Warning comments about deprecation

### Backup Location

All original files backed up to:
```
/Users/jorgegangale/Desktop/rollback-backups/rsa-removal-YYYYMMDD-HHMMSS/
```

---

## How to Rollback

### Option 1: Manual Rollback (Recommended)

```bash
# 1. Navigate to frontend directory
cd '/Users/jorgegangale/Library/Mobile Documents/com~apple~CloudDocs/Proyectos/Admision_MTN/Admision_MTN_front'

# 2. Restore from backup
cp /Users/jorgegangale/Desktop/rollback-backups/rsa-removal-*/src/services/authService.ts.backup \
   src/services/authService.ts

cp /Users/jorgegangale/Desktop/rollback-backups/rsa-removal-*/src/services/professorAuthService.ts.backup \
   src/services/professorAuthService.ts

# 3. Restart frontend
npm run dev
```

### Option 2: Git Rollback (If committed)

```bash
# View commits
git log --oneline -5

# Rollback to before RSA removal
git revert <commit-hash>

# Or hard reset (CAUTION: loses changes)
git reset --hard <commit-hash-before-changes>
```

### Option 3: Automated Script

```bash
# Run the rollback script
./scripts/rollback-rsa-removal.sh
```

---

## Verification After Rollback

1. **Check imports are restored:**
   ```bash
   grep "encryptionService" src/services/authService.ts
   grep "encryptionService" src/services/professorAuthService.ts
   ```
   Should show: `import { encryptCredentials } from './encryptionService';`

2. **Check encryption is being used:**
   ```bash
   grep "encryptCredentials" src/services/authService.ts
   ```
   Should show: `const encryptedPayload = await encryptCredentials(...)`

3. **Test login:**
   - Open http://localhost:5173
   - Open browser DevTools → Network tab
   - Login with: jorge.gangale@mtn.cl / admin123
   - Check request payload shows: `encryptedData`, `encryptedKey`, `iv`, `authTag`

4. **Backend compatibility:**
   - Backend `mock-user-service.js` supports both encrypted and plain text
   - No backend changes needed for rollback

---

## Code Comparison

### Before (WITH RSA Encryption)

```typescript
// authService.ts
async login(email: string, password: string) {
  try {
    // Encrypt credentials
    const encryptedPayload = await encryptCredentials(email, password);

    const response = await api.post<AuthResponse>('/api/auth/login',
      encryptedPayload
    );

    // ... rest of code
  }
}
```

### After (WITHOUT RSA Encryption)

```typescript
// authService.ts
async login(email: string, password: string) {
  try {
    // Send credentials directly (over HTTPS)
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password
    });

    // ... rest of code
  }
}
```

---

## Testing Checklist

After rollback, verify:

- [ ] Frontend compiles without errors
- [ ] Login page loads
- [ ] Admin login works (jorge.gangale@mtn.cl / admin123)
- [ ] Professor login works
- [ ] JWT token is stored
- [ ] Protected routes work
- [ ] No console errors
- [ ] Network tab shows encrypted payload

---

## Backend Compatibility

**IMPORTANT**: The backend `mock-user-service.js` is **backward compatible**:

```javascript
// Backend automatically detects encryption
if (req.body.encryptedData) {
  // RSA encrypted request
  credentials = await decryptCredentials(req.body);
} else {
  // Plain text request
  credentials = { email: req.body.email, password: req.body.password };
}
```

This means:
- ✅ Rollback frontend only - backend works with both
- ✅ No backend changes needed
- ✅ No downtime required
- ✅ Can rollback anytime

---

## Contact

If rollback fails or issues occur:
1. Check this document for troubleshooting
2. Review backup files in `/Users/jorgegangale/Desktop/rollback-backups/`
3. Check git history: `git log`
4. Review console errors in browser DevTools

---

## Rollback Success Criteria

After executing rollback:

1. ✅ Login request shows encrypted payload in Network tab
2. ✅ No "encryptCredentials is not defined" errors
3. ✅ Successful login with admin credentials
4. ✅ JWT token stored in localStorage
5. ✅ Dashboard loads after login

---

**Last Updated**: October 16, 2025
**Status**: Ready for rollback execution
