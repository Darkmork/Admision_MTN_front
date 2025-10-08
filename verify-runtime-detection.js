/**
 * Vercel Runtime Detection Verification Script
 *
 * Run this in the browser console on Vercel to verify runtime detection is working
 *
 * Expected output:
 * ✅ Running on Vercel (admision-mtn-front.vercel.app)
 * ✅ Should use Railway backend
 * ✅ Detected URL: https://admisionmtnbackendv2-production.up.railway.app
 */

(function() {
  console.log('=== Vercel Runtime Detection Verification ===\n');

  // 1. Check environment
  const hostname = window.location.hostname;
  console.log('1. Current hostname:', hostname);

  const isVercel = hostname.includes('vercel.app');
  const isProduction = hostname === 'admision.mtn.cl' || hostname === 'admin.mtn.cl';
  const isLocal = hostname === 'localhost';

  console.log('   - Is Vercel:', isVercel ? '✅' : '❌');
  console.log('   - Is Production:', isProduction ? '✅' : '❌');
  console.log('   - Is Local:', isLocal ? '✅' : '❌');

  // 2. Check expected backend URL
  const expectedURL = (isVercel || isProduction)
    ? 'https://admisionmtnbackendv2-production.up.railway.app'
    : 'http://localhost:8080';

  console.log('\n2. Expected backend URL:', expectedURL);

  // 3. Check actual API requests
  const checkRequests = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const apiRequests = entries.filter(entry =>
        entry.name.includes('/api/')
      );

      if (apiRequests.length > 0) {
        console.log('\n3. Recent API requests:');
        apiRequests.forEach(req => {
          const url = new URL(req.name);
          const isCorrect = (isVercel || isProduction)
            ? url.origin === 'https://admisionmtnbackendv2-production.up.railway.app'
            : url.origin === 'http://localhost:8080';

          console.log(`   ${isCorrect ? '✅' : '❌'} ${req.name}`);
        });

        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    // Trigger a test request
    console.log('\n3. Triggering test API request...');
    fetch('/api/health')
      .then(() => {
        setTimeout(() => {
          observer.disconnect();
          console.log('\n4. Verification complete!');
          console.log('   Check Network tab for requests to:', expectedURL);
        }, 1000);
      })
      .catch(err => {
        console.error('   ❌ Test request failed:', err.message);
        observer.disconnect();
      });
  };

  checkRequests();

  // 4. Provide manual verification steps
  console.log('\n=== Manual Verification Steps ===');
  console.log('1. Open Network tab in DevTools');
  console.log('2. Filter by "api"');
  console.log('3. Reload the page');
  console.log('4. Check that all API requests go to:', expectedURL);
  console.log('\n=== Console Output to Look For ===');
  console.log('Look for these messages in the console:');
  console.log('  [API Config] Hostname detected:', hostname);
  if (isVercel) {
    console.log('  [API Config] Vercel deployment detected → Railway backend');
  } else if (isProduction) {
    console.log('  [API Config] Production domain detected → Railway backend');
  } else {
    console.log('  [API Config] Development environment → localhost');
  }
  console.log('  📤 http.ts - Runtime baseURL:', expectedURL);

  // 5. Debugging help
  console.log('\n=== Troubleshooting ===');
  if (isVercel && expectedURL.includes('localhost')) {
    console.error('❌ ERROR: On Vercel but using localhost!');
    console.log('Possible causes:');
    console.log('  1. Runtime detection code was optimized away');
    console.log('  2. getApiBaseUrl() not being called');
    console.log('  3. Build-time env var still being used');
    console.log('\nRun this to check:');
    console.log('  window.location.hostname.indexOf("vercel.app")');
  } else if (isVercel && expectedURL.includes('railway.app')) {
    console.log('✅ SUCCESS: Vercel is using Railway backend!');
  } else if (isLocal && expectedURL.includes('localhost')) {
    console.log('✅ SUCCESS: Localhost is using local backend!');
  }

  console.log('\n===========================================\n');
})();
