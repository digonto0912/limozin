import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './contexts/AuthContext';

// Import Firebase init fix to prevent auto-initialization
if (typeof window !== 'undefined') {
  import('../utils/firebase-init-fix').catch(console.error);
  import('../utils/domain-checker').catch(console.error);
}

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Business Monitoring ERP',
  description: 'Track employee/customer documents and payment dues',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="/coop-error-handler.js" defer></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent Firebase auto-initialization
              window.__FIREBASE_DEFAULTS__ = null;
              window.FIREBASE_APPCHECK_DEBUG_TOKEN = false;
              
              // Clear any Firebase hosting context
              if (typeof window !== 'undefined') {
                delete window.__FIREBASE_DEFAULTS__;
                
                // Additional prevention measures
                if (window.firebase) {
                  delete window.firebase;
                }
                
                // Override fetch for init.json requests
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const url = args[0];
                  if (typeof url === 'string' && url.includes('/__/firebase/init.json')) {
                    console.warn('Blocked Firebase auto-init request:', url);
                    return Promise.reject(new Error('Firebase auto-initialization blocked'));
                  }
                  return originalFetch.apply(this, args);
                };
              }
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
