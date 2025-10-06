'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, ShieldCheckIcon, UserIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { isMasterAdmin, USER_ROLES, MASTER_ADMIN_EMAIL } from '../../firebase/roles';

export default function AdminPanel({ isOpen, onClose }) {
  const { user, userRole, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState('');
  const [isDeleting, setIsDeleting] = useState('');

  // Check user permissions
  const isUserMasterAdmin = user && isMasterAdmin(user.email);
  const canViewUsers = hasPermission('canViewAllUsers');
  const canAccessPanel = hasPermission('canAccessAdminPanel');
  const canDeleteUsers = hasPermission('canDeleteUsers');
  const canPromoteUsers = hasPermission('canPromoteToAdmin');

  useEffect(() => {
    if (isOpen && canViewUsers) {
      fetchUsers();
    }
  }, [isOpen, canViewUsers]);

  // Add modal-open class to body when modal is mounted
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users', {
        headers: {
          'x-user-email': user.email
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (targetEmail, newRole) => {
    if (!targetEmail || !newRole) return;

    setIsUpdating(targetEmail);
    setError('');

    try {
      const response = await fetch('/api/users/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({
          email: targetEmail,
          role: newRole,
          action: 'update'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }

      const result = await response.json();
      
      // Update local state
      setUsers(prev => {
        const updated = prev.map(u => 
          u.email === targetEmail ? { ...u, role: newRole } : u
        );
        
        // If user doesn't exist in list, add them
        if (!prev.find(u => u.email === targetEmail)) {
          updated.push({
            email: targetEmail,
            role: newRole,
            updatedAt: new Date().toISOString()
          });
        }
        
        return updated;
      });

      // Show success message
      alert(`Successfully updated ${targetEmail} to ${newRole}`);

    } catch (err) {
      console.error('Error updating user role:', err);
      setError(`Failed to update user role: ${err.message}`);
    } finally {
      setIsUpdating('');
    }
  };



  const deleteUser = async (targetEmail) => {
    if (!targetEmail || targetEmail === MASTER_ADMIN_EMAIL) {
      return;
    }

    // Double confirmation for deletion
    const confirmMessage = `⚠️ DANGER: Complete Account Deletion ⚠️

This will permanently delete:
• User account: ${targetEmail}
• All user data from database
• All records created by this user
• All payment history
• Firebase authentication account

This action CANNOT be undone!

Type "DELETE" to confirm:`;

    const confirmation = window.prompt(confirmMessage);
    
    if (confirmation !== 'DELETE') {
      if (confirmation !== null) {
        alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    // Final confirmation
    const finalConfirm = window.confirm(
      `Are you absolutely sure you want to permanently delete ${targetEmail}?\n\n` +
      `This will remove ALL data associated with this account and CANNOT be recovered.\n\n` +
      `Click OK to proceed with permanent deletion.`
    );

    if (!finalConfirm) {
      return;
    }

    setIsDeleting(targetEmail);
    setError('');

    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(targetEmail)}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email,
          'x-target-email': targetEmail
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      const result = await response.json();
      
      // Remove user from local state
      setUsers(prev => prev.filter(u => u.email !== targetEmail));

      // Show success message with details
      alert(
        `✅ User Deleted Successfully\n\n` +
        `${result.message}\n\n` +
        `Details:\n` +
        `• Firestore data: ${result.details?.firestoreDeleted ? 'Deleted' : 'Not found'}\n` +
        `• Records deleted: ${result.details?.recordsDeleted || 0}\n` +
        `• Payments deleted: ${result.details?.paymentsDeleted || 0}\n` +
        `• Auth deletion: ${result.details?.authDeletionNote || 'Completed'}`
      );

    } catch (err) {
      console.error('Error deleting user:', err);
      setError(`Failed to delete user: ${err.message}`);
      alert(`❌ Deletion Failed\n\n${err.message}`);
    } finally {
      setIsDeleting('');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.MASTER_ADMIN:
        return 'role-master-admin';
      case USER_ROLES.ADMIN:
        return 'role-admin';
      case USER_ROLES.USER:
      default:
        return 'role-user';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.MASTER_ADMIN:
        return <ShieldCheckIcon className="h-4 w-4" />;
      case USER_ROLES.ADMIN:
        return <UserGroupIcon className="h-4 w-4" />;
      case USER_ROLES.USER:
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  // Show message for users without admin/master admin privileges
  if (!canViewUsers) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>User Dashboard</h2>
            <button className="close-button" onClick={onClose}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <UserIcon className="h-16 w-16 mx-auto text-gray-400" />
            </div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Welcome, {user?.displayName || user?.email}!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              You are currently a <strong>{userRole || 'user'}</strong>.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              User management features are available to administrators only.
            </p>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                💡 If you need admin access, please contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>User Role Management</h2>
            <p className="text-sm text-gray-600">Master Admin Panel</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="admin-panel-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}



          {/* Users List */}
          <div className="users-list-section">
            <div className="users-list-header">
              <h3>Current Users</h3>
              <button 
                onClick={fetchUsers}
                disabled={isLoading}
                className="refresh-btn"
                title="Refresh user list"
              >
                {isLoading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
            
            {isLoading ? (
              <div className="loading-state">Loading users...</div>
            ) : (
              <div className="users-list">
                {users
                  .filter(userItem => userItem.email !== MASTER_ADMIN_EMAIL)
                  .map((userItem, index) => (
                  <div key={userItem.email || index} className="user-item">
                    <div className="user-info">
                      {getRoleIcon(userItem.role)}
                      <div>
                        <div className="user-email">{userItem.email}</div>
                        <div className={`user-role ${getRoleColor(userItem.role)}`}>
                          {userItem.role || USER_ROLES.USER}
                        </div>
                      </div>
                    </div>
                    <div className="user-actions">
                      {/* Role selection - only for master admin */}
                      {isUserMasterAdmin ? (
                        <select
                          value={userItem.role || USER_ROLES.USER}
                          onChange={(e) => updateUserRole(userItem.email, e.target.value)}
                          disabled={isUpdating === userItem.email || isDeleting === userItem.email}
                          className="role-select"
                        >
                          <option value={USER_ROLES.USER}>User</option>
                          <option value={USER_ROLES.ADMIN}>Admin</option>
                        </select>
                      ) : (
                        <span className={`role-badge ${getRoleColor(userItem.role)}`}>
                          {userItem.role || USER_ROLES.USER}
                        </span>
                      )}
                      
                      {/* Delete button - only for master admin */}
                      {canDeleteUsers && (
                        <button
                          onClick={() => deleteUser(userItem.email)}
                          disabled={isUpdating === userItem.email || isDeleting === userItem.email}
                          className="delete-user-btn"
                          title="Delete user permanently"
                        >
                          {isDeleting === userItem.email ? (
                            <div className="loading-spinner-small"></div>
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      
                      {isUpdating === userItem.email && (
                        <div className="loading-spinner-small"></div>
                      )}
                    </div>
                  </div>
                ))}

                {users.filter(u => u.email !== MASTER_ADMIN_EMAIL).length === 0 && !isLoading && (
                  <div className="empty-state">
                    <p>No users found. Users will appear here when they sign up.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
