'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '../config/products';
import { useAuth } from '../contexts/AuthContext';
import { Bars3BottomLeftIcon, Bars3Icon } from '@heroicons/react/24/outline';
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
              <Image
                src="/save-way-limousine.png"
                alt="Save Way"
                width={32}
                height={32}
                className="sidebar-brand-logo"
              />
              <div className="sidebar-brand-text">
                <h3>Save Way</h3>
                <span className="sidebar-brand-subtitle">Products</span>
              </div>
            </div>
          )}
          
          {/* Desktop collapse button */}
          <button
            className="sidebar-collapse-btn sidebar-collapse-btn-desktop"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Bars3Icon className="h-5 w-5" /> : <Bars3BottomLeftIcon className="h-5 w-5" />}
          </button>

          {/* Mobile close button */}
          <button
            className="sidebar-close-btn-mobile"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
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
                    borderColor: isActive ? product.color : 'rgba(255,255,255,0.15)',
                    boxShadow: isActive ? `0 0 0 2px ${product.color}33` : 'none'
                  }}
                >
                  <Image
                    src={product.logo}
                    alt={product.shortName}
                    width={28}
                    height={28}
                    className="sidebar-nav-logo"
                  />
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
