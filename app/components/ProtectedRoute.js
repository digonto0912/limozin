'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

export default function ProtectedRoute({ children }) {
  const { user, loading, initializing, isAuthenticated } = useAuth();

  console.log('ProtectedRoute render:', { loading, initializing, isAuthenticated, hasUser: !!user });

  // Show loading while initializing or loading
  if (initializing || loading) {
    console.log('ProtectedRoute: showing loading (initializing or loading)');
    return <Loading />;
  }

  // Show loading while not authenticated (AuthContext will handle redirect)
  if (!isAuthenticated) {
    console.log('ProtectedRoute: not authenticated, showing loading while AuthContext redirects');
    return <Loading />;
  }

  console.log('ProtectedRoute: authenticated, showing children');
  return children;
}