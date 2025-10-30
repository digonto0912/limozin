'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChange, handleRedirectResult } from '../../firebase/auth';
import { getUserRole, hasPermission, isMasterAdmin } from '../../firebase/roles';
import { ensureUserInFirestore } from '../../firebase/users';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    
    // Check for redirect result first (for when user returns from OAuth redirect)
    const checkRedirectResult = async () => {
      try {
        console.log('AuthContext: Checking for redirect authentication result...');
        const redirectResult = await handleRedirectResult();
        if (redirectResult.success && redirectResult.user) {
          console.log('AuthContext: Redirect authentication successful:', redirectResult.user.email);
          // The auth state change will handle the rest
        } else {
          console.log('AuthContext: No redirect result or no user in result');
        }
      } catch (error) {
        console.log('AuthContext: No redirect result or error (this is normal):', error.message);
        // This is normal if user didn't come from redirect
      }
    };
    
    // Check redirect result with a small delay to ensure Firebase is ready
    setTimeout(checkRedirectResult, 100);
    
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!isMounted) return;
      
      console.log('Auth state change:', { user: !!user, email: user?.email });
      
      try {
        setUser(user);
        
        if (user) {
          console.log('User authenticated, ensuring Firestore record...');
          
          // Ensure user exists in Firestore database
          try {
            await ensureUserInFirestore(user);
            console.log('Firestore user record ensured successfully');
          } catch (firestoreError) {
            console.error('Error ensuring user in Firestore:', firestoreError);
            // Continue anyway to not block the auth flow
          }
          
          const role = getUserRole(user);
          console.log('User role determined:', role);
          if (isMounted) setUserRole(role);
        } else {
          console.log('User not authenticated');
          if (isMounted) setUserRole(null);
        }
        
        console.log('Setting loading to false');
        if (isMounted) {
          setLoading(false);
          setInitializing(false);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        // Always set loading to false to prevent infinite loading
        if (isMounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    });

    // Set a timeout as a safety net to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setLoading(false);
        setInitializing(false);
      }
    }, 8000); // 8 second timeout to allow for redirect authentication

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // Handle routing based on authentication state
  useEffect(() => {
    if (initializing || loading) return; // Don't redirect while still initializing

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isProtectedPage = !isAuthPage;

    console.log('AuthContext routing check:', {
      pathname,
      isAuthPage,
      isProtectedPage,
      hasUser: !!user,
      initializing,
      loading
    });

    if (user && isAuthPage) {
      // User is authenticated but on auth page - redirect to home with reload
      console.log('User authenticated on auth page, redirecting to home with reload...');
      window.location.href = '/';
    } else if (!user && isProtectedPage) {
      // User is not authenticated but on protected page - redirect to login with reload
      console.log('User not authenticated on protected page, redirecting to login with reload...');
      window.location.href = '/login';
    }
  }, [user, pathname, initializing, loading, router]);

  const checkPermission = (permission) => {
    return hasPermission(user, permission);
  };

  const value = {
    user,
    loading,
    userRole,
    initializing,
    isAuthenticated: !!user,
    isMasterAdmin: user ? isMasterAdmin(user.email) : false,
    hasPermission: checkPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};