// Production Authentication Test
// Run this in browser console on production to test authentication

console.log('🚀 Production Authentication Test');

// Check environment
const isProduction = window.location.hostname.includes('vercel.app') || 
                    window.location.hostname.includes('.app') ||
                    window.location.protocol === 'https:' ||
                    window.location.hostname !== 'localhost';

console.log('Environment Check:', {
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  isProduction: isProduction,
  shouldUseRedirect: isProduction
});

// Check COOP headers
fetch(window.location.href, { method: 'HEAD' })
  .then(response => {
    console.log('🔒 Security Headers:', {
      coop: response.headers.get('Cross-Origin-Opener-Policy'),
      coep: response.headers.get('Cross-Origin-Embedder-Policy'),
      referrer: response.headers.get('Referrer-Policy')
    });
  })
  .catch(err => console.warn('Could not check headers:', err));

// Monitor for COOP errors
let coopErrorCount = 0;
const originalConsoleError = console.error;
console.error = function(...args) {
  if (args.some(arg => 
    typeof arg === 'string' && 
    (arg.includes('Cross-Origin-Opener-Policy') || 
     arg.includes('window.closed') || 
     arg.includes('window.close'))
  )) {
    coopErrorCount++;
    console.log(`❌ COOP Error #${coopErrorCount} detected:`, args[0]);
    return; // Don't log the actual error
  }
  originalConsoleError.apply(console, args);
};

// Test authentication method selection
window.testAuthMethod = () => {
  console.log('🧪 Testing authentication method selection...');
  
  if (typeof signInWithGoogle !== 'undefined') {
    console.log('Attempting authentication...');
    
    // This should automatically use redirect in production
    signInWithGoogle()
      .then(result => {
        console.log('✅ Authentication result:', {
          success: result.success,
          isRedirect: result.isRedirect,
          hasUser: !!result.user
        });
        
        if (result.isRedirect) {
          console.log('🔄 Redirect authentication initiated - page will reload');
        }
      })
      .catch(error => {
        console.error('❌ Authentication failed:', error);
      });
  } else {
    console.log('❌ signInWithGoogle function not available');
  }
};

// Monitor auth state changes
if (typeof onAuthStateChanged !== 'undefined' && typeof auth !== 'undefined') {
  let authStateChanges = 0;
  onAuthStateChanged(auth, (user) => {
    authStateChanges++;
    console.log(`🔐 Auth State Change #${authStateChanges}:`, {
      hasUser: !!user,
      email: user?.email,
      method: 'Firebase Auth State Listener'
    });
  });
}

// Summary of what should happen
console.log('📋 Expected Production Behavior:');
console.log('1. Environment detected as production ✓');
console.log('2. COOP headers set to "unsafe-none" ✓');
console.log('3. Authentication will use redirect method (no popup) ✓');
console.log('4. No COOP errors should appear ✓');

console.log('🧪 Run testAuthMethod() to test authentication');

// Auto-test after 2 seconds if on login page
if (window.location.pathname === '/login') {
  setTimeout(() => {
    console.log('🎯 Auto-testing on login page...');
    const loginBtn = document.querySelector('.google-signin-btn');
    if (loginBtn && !loginBtn.disabled) {
      console.log('Found login button - you can click it to test redirect auth');
    }
  }, 2000);
}