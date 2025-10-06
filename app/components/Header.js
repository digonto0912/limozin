'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../../firebase/auth';
import { ArrowRightOnRectangleIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import AdminPanel from './AdminPanel';

export default function Header() {
  const { user, isMasterAdmin } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      const result = await logOut();
      if (result.success) {
        // User will be redirected by the auth state change
      } else {
        alert('Failed to sign out. Please try again.');
      }
    }
  };

  return (
    <>
    <header className="main-header">
      <nav className="navbar">
        <div className="nav-brand">
          <Image 
            src="/save-way-limousine.png" 
            alt="Save Way Limousine Logo" 
            width={50} 
            height={50} 
            className="nav-logo"
          />
          <div className="nav-text">
            <h1>Save Way Limousine</h1>
            <p className="nav-subtitle">Track employee/customer documents and payment dues</p>
          </div>
        </div>
        
        {user && (
          <div className="nav-user">
            <div className="user-info">
              <UserIcon className="h-5 w-5" />
              <span className="user-name">{user.displayName || user.email}</span>
              {isMasterAdmin && (
                <span className="master-admin-badge">Master Admin</span>
              )}
            </div>
            
            <div className="nav-actions">
              {isMasterAdmin && (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="admin-btn"
                  title="Manage Users"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  Admin Panel
                </button>
              )}
              
              <button 
                onClick={handleLogout}
                className="logout-btn"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>
      
      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel 
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </header>
    </>
  );
}
