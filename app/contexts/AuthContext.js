'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange } from '../../firebase/auth';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        // Ensure user exists in Firestore database
        await ensureUserInFirestore(user);
        
        const role = getUserRole(user);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkPermission = (permission) => {
    return hasPermission(user, permission);
  };

  const value = {
    user,
    loading,
    userRole,
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