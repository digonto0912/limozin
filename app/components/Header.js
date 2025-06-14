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
        <div className="nav-menu">
          <Link href="/" className="nav-link active">Dashboard</Link>
          <Link href="#" className="nav-link">Records</Link>
          <Link href="#" className="nav-link">Reports</Link>
        </div>
        <div className="nav-actions">
          <button className="btn btn-primary">
            Add Record
          </button>
        </div>
      </nav>
    </header>
  );
}
