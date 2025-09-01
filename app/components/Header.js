'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
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
      </nav>
    </header>
  );
}
