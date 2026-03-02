'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../../firebase/auth';
import { ArrowRightOnRectangleIcon, UserIcon, Cog6ToothIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import AdminPanel from './AdminPanel';
import { getProductById } from '../config/products';

export default function Header({ productId }) {
  const { user, isMasterAdmin } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Get product info from prop or URL
  const resolvedProductId = productId || (() => {
    const match = pathname?.match(/^\/product\/([^/]+)/);
    return match ? match[1] : null;
  })();
  const product = resolvedProductId ? getProductById(resolvedProductId) : null;

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        const result = await logOut();
        if (result.success) {
          console.log('Sign out successful - reloading page...');
          window.location.href = '/login';
        } else {
          alert('Failed to sign out. Please try again.');
        }
      } catch (error) {
        console.error('Sign out error:', error);
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
            src={product?.logo || '/save-way-limousine.png'} 
            alt={product?.name || 'Save Way Limousine'} 
            width={50} 
            height={50} 
            className="nav-logo"
          />
          <div className="nav-text">
            <h1>{product ? product.name : 'Save Way Limousine'}</h1>
            <p className="nav-subtitle">{product ? product.description : 'Track employee/customer documents and payment dues'}</p>
          </div>
        </div>
        
        {user && (
          <>
            {/* Desktop / Tablet user area */}
            <div className="nav-user nav-user-desktop">
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
                    <span className="btn-label">Admin Panel</span>
                  </button>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="logout-btn"
                  title="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="btn-label">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Mobile user menu */}
            <div className="nav-user-mobile" ref={mobileMenuRef}>
              {isMasterAdmin && (
                <span className="master-admin-badge master-admin-badge-mobile">Admin</span>
              )}
              <button 
                className="nav-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="User menu"
              >
                <EllipsisVerticalIcon className="h-6 w-6" />
              </button>
              
              {mobileMenuOpen && (
                <div className="nav-mobile-dropdown">
                  <div className="nav-mobile-user-info">
                    <UserIcon className="h-5 w-5" />
                    <div className="nav-mobile-user-details">
                      <span className="nav-mobile-user-name">{user.displayName || user.email}</span>
                      {isMasterAdmin && (
                        <span className="master-admin-badge">Master Admin</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="nav-mobile-divider" />
                  
                  {isMasterAdmin && (
                    <button 
                      onClick={() => { setShowAdminPanel(true); setMobileMenuOpen(false); }}
                      className="nav-mobile-action"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      Admin Panel
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="nav-mobile-action nav-mobile-action-danger"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
      
    {/* Admin Panel Modal */}
    {showAdminPanel && (
      <AdminPanel 
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    )}
    </>
  );
}
