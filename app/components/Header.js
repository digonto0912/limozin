'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="main-header">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Business Monitoring ERP</h1>
          <p className="nav-subtitle">Track employee/customer documents and payment dues</p>
        </div>
      </nav>
    </header>
  );
}
