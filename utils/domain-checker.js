/**
 * Domain Information Utility
 * Run this in browser console to get domain info for Firebase Console setup
 */

export const getDomainInfo = () => {
  if (typeof window === 'undefined') {
    console.log('This utility must be run in the browser');
    return;
  }
  
  const info = {
    currentDomain: window.location.hostname,
    fullUrl: window.location.href,
    protocol: window.location.protocol,
    port: window.location.port,
    isLocalhost: window.location.hostname === 'localhost',
    isVercel: window.location.hostname.includes('vercel.app'),
    isCustomDomain: !window.location.hostname.includes('vercel.app') && 
                   !window.location.hostname.includes('localhost') &&
                   !window.location.hostname.includes('firebaseapp.com')
  };
  
  console.group('🌐 Domain Information for Firebase Console');
  console.log('Current domain:', info.currentDomain);
  console.log('Full URL:', info.fullUrl);
  console.log('Is localhost:', info.isLocalhost);
  console.log('Is Vercel deployment:', info.isVercel);
  console.log('Is custom domain:', info.isCustomDomain);
  
  console.log('\n📋 Domains to add to Firebase Console:');
  const domainsToAdd = [];
  
  if (!info.isLocalhost) {
    domainsToAdd.push(info.currentDomain);
  }
  
  if (!domainsToAdd.includes('localhost')) {
    domainsToAdd.push('localhost');
  }
  
  domainsToAdd.forEach((domain, index) => {
    console.log(`${index + 1}. ${domain}`);
  });
  
  console.log('\n🔧 Steps to fix:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select project: limozin-85645');
  console.log('3. Go to Authentication > Settings');
  console.log('4. Scroll to "Authorized domains"');
  console.log('5. Add the domains listed above');
  console.log('6. Wait 5-10 minutes for changes to propagate');
  
  console.groupEnd();
  
  return info;
};

// Auto-run when script loads
if (typeof window !== 'undefined') {
  // Run after page loads
  window.addEventListener('load', () => {
    setTimeout(getDomainInfo, 1000);
  });
}

// Also export for manual use
window.getDomainInfo = getDomainInfo;