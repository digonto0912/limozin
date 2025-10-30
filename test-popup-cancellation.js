// Popup Cancellation Test Script
// Run this in browser console to test popup cancellation behavior

console.log('🧪 Testing Popup Cancellation Handling');

// Monitor button state changes
const monitorButtonState = () => {
  const loginBtn = document.querySelector('.google-signin-btn');
  if (loginBtn) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
          console.log('🔘 Button state changed:', {
            disabled: loginBtn.disabled,
            textContent: loginBtn.textContent?.trim(),
            timestamp: new Date().toISOString()
          });
        }
      });
    });
    
    observer.observe(loginBtn, { attributes: true });
    
    // Also monitor text content changes
    const textObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          console.log('🔤 Button text changed:', {
            textContent: loginBtn.textContent?.trim(),
            timestamp: new Date().toISOString()
          });
        }
      });
    });
    
    textObserver.observe(loginBtn, { childList: true, subtree: true });
    
    console.log('✅ Button monitoring started');
    return { observer, textObserver };
  } else {
    console.log('❌ Login button not found');
    return null;
  }
};

// Test popup cancellation
window.testPopupCancellation = () => {
  console.log('🔍 Testing popup cancellation...');
  
  const loginBtn = document.querySelector('.google-signin-btn');
  if (loginBtn && !loginBtn.disabled) {
    console.log('1. Clicking login button...');
    loginBtn.click();
    
    console.log('2. ⚠️ CLOSE the Google popup that appears (do NOT select an account)');
    console.log('3. Watch the button state - it should return to normal');
    
    // Monitor for 30 seconds
    setTimeout(() => {
      console.log('📊 Final button state:', {
        disabled: loginBtn.disabled,
        textContent: loginBtn.textContent?.trim(),
        isStuck: loginBtn.textContent?.includes('...') && loginBtn.disabled
      });
      
      if (loginBtn.textContent?.includes('...') && loginBtn.disabled) {
        console.log('❌ BUG: Button is stuck in loading state');
      } else {
        console.log('✅ SUCCESS: Button state properly reset');
      }
    }, 10000);
  } else {
    console.log('❌ Login button not available or already disabled');
  }
};

// Auto-start monitoring if on login page
if (window.location.pathname === '/login') {
  const monitors = monitorButtonState();
  
  console.log('📋 Instructions:');
  console.log('1. Run testPopupCancellation() to test');
  console.log('2. Or manually click the Google login button');
  console.log('3. Close the popup without selecting an account');
  console.log('4. The button should return to normal (not stuck in loading)');
  
  // Test the current button state
  const loginBtn = document.querySelector('.google-signin-btn');
  if (loginBtn) {
    console.log('🔘 Current button state:', {
      disabled: loginBtn.disabled,
      textContent: loginBtn.textContent?.trim()
    });
  }
} else {
  console.log('ℹ️ Navigate to /login page to test popup cancellation');
}

console.log('🚀 Popup cancellation test ready!');