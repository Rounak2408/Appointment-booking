import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Navigation Bar Component
 */
const Navbar = () => {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          Appointment Booking
        </Link>
        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/signup" onClick={closeMenu}>Sign Up</Link>
            </>
          ) : (
            <>
              {!isAdmin && <Link to="/book-appointment" onClick={closeMenu}>Book Appointment</Link>}
              {!isAdmin && <Link to="/my-appointments" onClick={closeMenu}>Dashboard</Link>}
              {isAdmin && <Link to="/admin" onClick={closeMenu}>Admin Dashboard</Link>}
              <Link to="/profile" onClick={closeMenu}>Profile</Link>
              <div className="navbar-user">
                <button onClick={() => { logout(); closeMenu(); }} className="btn btn-secondary" style={{ 
                  padding: '8px 20px',
                  fontSize: '14px',
                  width: '100%'
                }}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
