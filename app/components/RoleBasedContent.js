'use client';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../../firebase/roles';
import { UserIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function RoleBasedContent({ children, adminContent, userContent }) {
  const { user, userRole, hasPermission, loading } = useAuth();

  console.log('RoleBasedContent render:', { loading, hasUser: !!user, userRole });

  if (loading) {
    console.log('RoleBasedContent: showing loading');
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Check if user can manage records (admins and master admin)
  const canManageRecords = hasPermission('canManageRecords');
  const canViewAllData = hasPermission('canViewAllUsers') || hasPermission('canManageRecords');

  console.log('RoleBasedContent permissions:', { canManageRecords, canViewAllData, userRole });

  // If user can manage records, show full dashboard
  if (canManageRecords) {
    console.log('RoleBasedContent: user can manage records, showing full dashboard');
    return children;
  }

  // For regular users, show limited content
  return (
    <div className="user-dashboard">
      <div className="user-welcome-section">
        <div className="welcome-card">
          <div className="welcome-header">
            <div className="user-avatar">
              <UserIcon className="h-12 w-12" />
            </div>
            <div className="welcome-info">
              <h2>Welcome, {user?.displayName || user?.email?.split('@')[0]}!</h2>
              <div className="user-role-badge">
                <span className={`role-indicator role-${userRole}`}>
                  {userRole === USER_ROLES.ADMIN && <UserGroupIcon className="h-4 w-4" />}
                  {userRole === USER_ROLES.MASTER_ADMIN && <ShieldCheckIcon className="h-4 w-4" />}
                  {userRole === USER_ROLES.USER && <UserIcon className="h-4 w-4" />}
                  {userRole || 'User'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="welcome-content">
            <div className="info-section">
              <h3>Your Account Status</h3>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Account Type:</span>
                  <span className="status-value">{userRole || 'Standard User'}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Email:</span>
                  <span className="status-value">{user?.email}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Last Login:</span>
                  <span className="status-value">Just now</span>
                </div>
              </div>
            </div>

            <div className="access-info">
              <h3>Available Features</h3>
              <div className="feature-list">
                <div className="feature-item available">
                  <span className="feature-icon">👤</span>
                  <div className="feature-details">
                    <strong>Profile Management</strong>
                    <p>Update your personal information and preferences</p>
                  </div>
                </div>
                <div className="feature-item unavailable">
                  <span className="feature-icon">📊</span>
                  <div className="feature-details">
                    <strong>Business Analytics</strong>
                    <p>Available for administrators only</p>
                  </div>
                </div>
                <div className="feature-item unavailable">
                  <span className="feature-icon">👥</span>
                  <div className="feature-details">
                    <strong>User Management</strong>
                    <p>Available for administrators only</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="upgrade-section">
              <h3>Need More Access?</h3>
              <p>If you need access to business data and management features, please contact your system administrator.</p>
              <div className="contact-info">
                <p><strong>Administrator:</strong> Business Manager</p>
                <p><strong>Contact:</strong> Ask for admin privileges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}