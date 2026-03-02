'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PRODUCTS } from '../config/products';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't render sidebar on auth pages or when not authenticated
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (isAuthPage || !isAuthenticated) return null;

  // Extract active product from URL
  const getActiveProductId = () => {
    const match = pathname.match(/^\/product\/([^/]+)/);
    return match ? match[1] : null;
  };

  const activeProductId = getActiveProductId();

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        <span className="sidebar-mobile-toggle-icon">
          {mobileOpen ? '✕' : '☰'}
        </span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-brand">
              <span className="sidebar-brand-icon">🏢</span>
              <div className="sidebar-brand-text">
                <h3>Save Way</h3>
                <span className="sidebar-brand-subtitle">Products</span>
              </div>
            </div>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
          </button>
        </div>

        {/* Product Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">
            {!collapsed && <span>PRODUCTS</span>}
          </div>
          
          {PRODUCTS.map((product) => {
            const isActive = activeProductId === product.id;
            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
                style={{
                  '--product-color': product.color,
                }}
                onClick={() => setMobileOpen(false)}
                title={product.name}
              >
                <span
                  className="sidebar-nav-icon"
                  style={{ 
                    backgroundColor: isActive ? product.color : 'transparent',
                    borderColor: product.color
                  }}
                >
                  {product.icon}
                </span>
                {!collapsed && (
                  <div className="sidebar-nav-text">
                    <span className="sidebar-nav-name">{product.name}</span>
                    <span className="sidebar-nav-desc">{product.shortName}</span>
                  </div>
                )}
                {!collapsed && isActive && (
                  <span className="sidebar-nav-active-dot" style={{ backgroundColor: product.color }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="sidebar-footer">
            <p className="sidebar-footer-text">Save Way Limousine &copy; {new Date().getFullYear()}</p>
          </div>
        )}
      </aside>
    </>
  );
}
