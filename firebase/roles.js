// Master Admin Configuration
export const MASTER_ADMIN_EMAIL = 'fardulislamdigonto799@gmail.com';

// User roles
export const USER_ROLES = {
  MASTER_ADMIN: 'master_admin',
  ADMIN: 'admin', 
  USER: 'user'
};

// Role hierarchy and permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.MASTER_ADMIN]: {
    canPromoteToAdmin: true,
    canDemoteFromAdmin: true,
    canDeleteUsers: true,
    canViewAllUsers: true,
    canManageRecords: true,
    canExportData: true,
    canAccessAdminPanel: true
  },
  [USER_ROLES.ADMIN]: {
    canPromoteToAdmin: false,
    canDemoteFromAdmin: false,
    canDeleteUsers: false,
    canViewAllUsers: true,
    canManageRecords: true,
    canExportData: true,
    canAccessAdminPanel: true
  },
  [USER_ROLES.USER]: {
    canPromoteToAdmin: false,
    canDemoteFromAdmin: false,
    canDeleteUsers: false,
    canViewAllUsers: false,
    canManageRecords: true,
    canExportData: false,
    canAccessAdminPanel: false
  }
};

// Helper functions
export const isMasterAdmin = (userEmail) => {
  return userEmail === MASTER_ADMIN_EMAIL;
};

export const getUserRole = (user) => {
  if (!user || !user.email) return USER_ROLES.USER;
  
  if (isMasterAdmin(user.email)) {
    return USER_ROLES.MASTER_ADMIN;
  }
  
  // Check custom claims for admin role
  return user.customClaims?.role || USER_ROLES.USER;
};

export const hasPermission = (user, permission) => {
  const role = getUserRole(user);
  return ROLE_PERMISSIONS[role]?.[permission] || false;
};