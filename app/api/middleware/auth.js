import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { MASTER_ADMIN_EMAIL, USER_ROLES, isMasterAdmin } from '../../../firebase/roles';

/**
 * Check user role and permissions for API access
 * @param {string} userEmail - The email of the user making the request
 * @returns {Promise<{role: string, hasAccess: boolean, canManageRecords: boolean, canViewAllUsers: boolean}>}
 */
export async function checkApiAccess(userEmail) {
  if (!userEmail) {
    return {
      role: null,
      hasAccess: false,
      canManageRecords: false,
      canViewAllUsers: false,
      canDeleteUsers: false,
      isMasterAdmin: false
    };
  }

  // Check if master admin
  if (isMasterAdmin(userEmail)) {
    return {
      role: USER_ROLES.MASTER_ADMIN,
      hasAccess: true,
      canManageRecords: true,
      canViewAllUsers: true,
      canDeleteUsers: true,
      isMasterAdmin: true
    };
  }

  try {
    // Check user role from database
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      // User not found in database, create them if they're authenticated
      console.log(`User ${userEmail} not found in database, creating default user record`);
      
      // Create a basic user record
      try {
        const usersRef = collection(db, 'users');
        const defaultUserData = {
          email: userEmail,
          role: USER_ROLES.USER,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await addDoc(usersRef, defaultUserData);
        console.log(`Created user record for ${userEmail}`);
        
        return {
          role: USER_ROLES.USER,
          hasAccess: false,
          canManageRecords: false,
          canViewAllUsers: false,
          canDeleteUsers: false,
          isMasterAdmin: false
        };
      } catch (createError) {
        console.error('Error creating user record:', createError);
        return {
          role: USER_ROLES.USER,
          hasAccess: false,
          canManageRecords: false,
          canViewAllUsers: false,
          canDeleteUsers: false,
          isMasterAdmin: false
        };
      }
    }

    const userData = querySnapshot.docs[0].data();
    const userRole = userData.role || USER_ROLES.USER;

    // Define permissions based on role
    const permissions = {
      [USER_ROLES.MASTER_ADMIN]: {
        hasAccess: true,
        canManageRecords: true,
        canViewAllUsers: true,
        canDeleteUsers: true,
        isMasterAdmin: true
      },
      [USER_ROLES.ADMIN]: {
        hasAccess: true,
        canManageRecords: true,
        canViewAllUsers: true,
        canDeleteUsers: false,
        isMasterAdmin: false
      },
      [USER_ROLES.USER]: {
        hasAccess: false,
        canManageRecords: false,
        canViewAllUsers: false,
        canDeleteUsers: false,
        isMasterAdmin: false
      }
    };

    return {
      role: userRole,
      ...(permissions[userRole] || permissions[USER_ROLES.USER])
    };

  } catch (error) {
    console.error('Error checking user access:', error);
    return {
      role: USER_ROLES.USER,
      hasAccess: false,
      canManageRecords: false,
      canViewAllUsers: false,
      canDeleteUsers: false,
      isMasterAdmin: false
    };
  }
}

/**
 * Middleware to check if user has permission to access records
 */
export async function requireRecordsAccess(request) {
  const userEmail = request.headers.get('x-user-email');
  
  if (!userEmail) {
    return {
      error: { error: 'Authentication required. User email missing.' },
      status: 401
    };
  }

  const access = await checkApiAccess(userEmail);
  
  if (!access.canManageRecords) {
    return {
      error: { 
        error: 'Insufficient permissions. This resource requires admin access.',
        userRole: access.role
      },
      status: 403
    };
  }

  return { access, error: null };
}

/**
 * Middleware to check if user has permission to view all users
 */
export async function requireUserViewAccess(request) {
  const userEmail = request.headers.get('x-user-email');
  
  if (!userEmail) {
    return {
      error: { error: 'Authentication required. User email missing.' },
      status: 401
    };
  }

  const access = await checkApiAccess(userEmail);
  
  if (!access.canViewAllUsers) {
    return {
      error: { 
        error: 'Insufficient permissions. This resource requires admin access.',
        userRole: access.role
      },
      status: 403
    };
  }

  return { access, error: null };
}