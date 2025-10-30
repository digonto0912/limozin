// Debug script to test authentication in production
// You can run this in browser console to debug authentication issues

console.log('🔍 Authentication Debug Script');
console.log('Environment:', {
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  isProduction: window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost'
});

// Check Firebase config
console.log('Firebase Auth Instance:', {
  hasAuth: !!window.firebase?.auth,
  currentUser: window.firebase?.auth?.currentUser,
  authDomain: window.firebase?.auth?.app?.options?.authDomain
});

// Check COOP headers
fetch(window.location.href, { method: 'HEAD' })
  .then(response => {
    console.log('Response Headers:', {
      coop: response.headers.get('Cross-Origin-Opener-Policy'),
      coep: response.headers.get('Cross-Origin-Embedder-Policy'),
      allHeaders: [...response.headers.entries()]
    });
  })
  .catch(err => console.error('Header check failed:', err));

// Test popup functionality
console.log('Testing popup capability...');
try {
  const testPopup = window.open('about:blank', '_blank', 'width=500,height=600');
  if (testPopup) {
    console.log('✅ Popup creation successful');
    testPopup.close();
  } else {
    console.log('❌ Popup blocked by browser');
  }
} catch (error) {
  console.log('❌ Popup error:', error.message);
}

// Listen for auth state changes
console.log('🔄 Setting up auth state listener...');
if (typeof onAuthStateChanged !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    console.log('🔐 Auth state changed:', {
      user: !!user,
      email: user?.email,
      uid: user?.uid
    });
  });
}

console.log('📝 Debug script complete. Check console for results.');