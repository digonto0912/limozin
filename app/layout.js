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
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
