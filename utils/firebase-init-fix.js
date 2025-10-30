/**
 * Test for Firebase init.json 404 error
 * This utility helps identify and fix the auto-initialization issue
 */

export const testFirebaseInitJson = async () => {
  console.group('🧪 Testing Firebase init.json issue');
  
  const testUrls = [
    'https://limozin-85645.firebaseapp.com/__/firebase/init.json',
    'https://limozin-85645.web.app/__/firebase/init.json'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, { mode: 'no-cors' });
      console.log(`Response status: ${response.status}`);
      
      if (response.status === 404) {
        console.warn(`❌ 404 Not Found: ${url}`);
        console.log('This confirms the Firebase Hosting auto-init issue');
      } else {
        console.log(`✅ Response received from: ${url}`);
      }
    } catch (error) {
      console.warn(`❌ Error fetching ${url}:`, error.message);
    }
  }
  
  console.log('\n💡 Solution: The 404 error is expected when using Vercel hosting instead of Firebase Hosting.');
  console.log('✅ Your manual Firebase configuration should prevent this auto-initialization.');
  
  console.groupEnd();
};

export const checkAutoInitialization = () => {
  console.group('🔍 Checking Auto-Initialization Sources');
  
  // Check for Firebase SDK trying to auto-initialize
  const checks = {
    windowFirebaseDefaults: typeof window !== 'undefined' && window.__FIREBASE_DEFAULTS__,
    windowFirebase: typeof window !== 'undefined' && window.firebase,
    documentScripts: typeof document !== 'undefined' ? 
      Array.from(document.scripts).filter(script => 
        script.src.includes('firebase') || 
        script.src.includes('firebaseapp.com')
      ).map(script => script.src) : [],
    metaTags: typeof document !== 'undefined' ?
      Array.from(document.querySelectorAll('meta[name*="firebase"]')).map(meta => ({
        name: meta.name,
        content: meta.content
      })) : []
  };
  
  console.log('Auto-initialization checks:', checks);
  
  // Specific check for the problematic URL pattern
  if (typeof window !== 'undefined') {
    const currentDomain = window.location.hostname;
    const problematicPattern = currentDomain.includes('firebaseapp.com') || 
                              currentDomain.includes('.web.app');
    
    console.log('Domain analysis:', {
      currentDomain,
      isFirebaseHosting: problematicPattern,
      shouldUseManualConfig: !problematicPattern
    });
    
    if (problematicPattern) {
      console.warn('⚠️ You are on Firebase Hosting but using manual config');
      console.log('💡 Consider switching to auto-config for Firebase Hosting');
    } else {
      console.log('✅ Manual configuration is correct for non-Firebase hosting');
    }
  }
  
  console.groupEnd();
  return checks;
};

// Prevent auto-initialization completely
export const preventAutoInit = () => {
  if (typeof window !== 'undefined') {
    // Clear Firebase defaults
    window.__FIREBASE_DEFAULTS__ = null;
    delete window.__FIREBASE_DEFAULTS__;
    
    // Disable app check debug
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = false;
    
    // Clear any cached Firebase instances
    if (window.firebase) {
      console.log('Clearing existing Firebase global object');
      delete window.firebase;
    }
    
    console.log('✅ Auto-initialization prevention applied');
  }
};

// Run automatically when imported
if (typeof window !== 'undefined') {
  preventAutoInit();
  
  // Run checks after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(checkAutoInitialization, 100);
    });
  } else {
    setTimeout(checkAutoInitialization, 100);
  }
}