import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ onHelpClick }) {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🐄</span>
          <span className="brand-text">Breed<span className="brand-accent">Vision</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Identify
          </Link>
          <Link to="/history" className={`nav-link ${pathname === '/history' ? 'active' : ''}`}>
            History
          </Link>
          <button
            onClick={onHelpClick}
            className="nav-link nav-link-help"
            aria-label="Open help"
          >
            Help
          </button>
        </div>
      </div>
    </nav>
  );
}
