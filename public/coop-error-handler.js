// COOP Error Handler - Add this to your main layout or auth context
// This will catch and handle COOP-related errors globally

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  // Check if it's a COOP-related error
  if (error && (
    error.message?.includes('Cross-Origin-Opener-Policy') ||
    error.message?.includes('window.closed') ||
    error.message?.includes('window.close') ||
    error.code === 'auth/popup-blocked' ||
    error.code === 'auth/popup-closed-by-user'
  )) {
    console.warn('🛡️ COOP Error detected and handled:', error.message);
    
    // Prevent the error from showing in console
    event.preventDefault();
    
    // Force redirect authentication if not already in progress
    if (typeof signInWithRedirect !== 'undefined' && !window.authRedirectInProgress) {
      console.log('🔄 Forcing redirect authentication due to COOP error');
      window.authRedirectInProgress = true;
      
      // Trigger redirect authentication
      import('../../firebase/auth').then(({ signInWithGoogle }) => {
        signInWithGoogle().catch(err => {
          console.error('Redirect authentication also failed:', err);
          window.authRedirectInProgress = false;
        });
      });
    }
  }
});

// Global error handler for regular errors
window.addEventListener('error', (event) => {
  const error = event.error;
  
  // Check if it's a COOP-related error
  if (error && (
    error.message?.includes('Cross-Origin-Opener-Policy') ||
    error.message?.includes('window.closed') ||
    error.message?.includes('window.close')
  )) {
    console.warn('🛡️ COOP Error caught in global error handler:', error.message);
    
    // Prevent the error from showing in console
    event.preventDefault();
  }
});

console.log('🛡️ COOP Error Handler initialized');