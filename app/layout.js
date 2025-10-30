import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './contexts/AuthContext';

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
