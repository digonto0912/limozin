'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithGoogle, handleRedirectResult } from '../../firebase/auth';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, initializing } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      console.log('Login page: Checking for redirect result...');
      setIsLoading(true);
      
      try {
        const result = await handleRedirectResult();
        if (result.success && result.user) {
          console.log('Login page: Redirect sign-in successful, reloading to home...');
          // Force reload to home page for clean state
          window.location.href = '/';
          return;
        } else if (result.error && result.error !== 'No redirect result found') {
          console.error('Login page: Redirect result error:', result.error);
          setError(result.error);
        }
      } catch (error) {
        console.error('Login page: Error handling redirect result:', error);
        setError('Authentication failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure Firebase is initialized
    const timer = setTimeout(checkRedirectResult, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        if (result.isRedirect) {
          // Don't set loading to false for redirect, page will reload
          console.log('Redirecting for authentication...');
          return;
        } else {
          // Popup authentication succeeded - reload to home page
          console.log('Popup authentication successful, reloading to home...');
          window.location.href = '/';
          return;
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Authentication failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Show loading while AuthContext is initializing
  if (initializing || loading) {
    return <div className="auth-container">
      <div className="auth-card">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Image 
            src="/save-way-limousine.png" 
            alt="Save Way Limousine Logo" 
            width={60} 
            height={60} 
            className="auth-logo"
          />
          <h1>Welcome Back</h1>
          <p>Sign in to your Save Way Limousine account</p>
        </div>

        <div className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleSignIn}
            className="google-signin-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner-small"></div>
                Signing In...
              </>
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        <div className="auth-footer">
          <p>
            New to Save Way Limousine?{' '}
            <Link href="/signup" className="auth-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}