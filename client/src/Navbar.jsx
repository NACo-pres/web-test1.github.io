import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navbarStyle = {
    backgroundColor: '#003366',
    padding: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
  };

  const linkStyle = {
    color: '#fff',
    fontWeight: '600',
    textDecoration: 'none',
    padding: '10px 15px',
    transition: 'color 0.3s ease, transform 0.3s ease',
  };

  const hamburgerStyle = {
    color: '#fff',
  };

  const dropdownStyle = {
    backgroundColor: '#003366',
    border: 'none',
  };

  const dropdownItemStyle = {
    color: 'white',
    backgroundColor: '#003366',
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={navbarStyle}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home" style={linkStyle}>
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Home</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: 'none' }}
        >
          <span className="navbar-toggler-icon" style={hamburgerStyle}></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li
              className="nav-item dropdown"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span
                className="nav-link dropdown-toggle"
                style={linkStyle}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen ? 'true' : 'false'}
              >
                Committee
              </span>
              {isDropdownOpen && (
                <ul className="dropdown-menu show" style={dropdownStyle}>
                  <li>
                    <Link className="dropdown-item" to="/committees" style={dropdownItemStyle}>
                      Committees
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/committee-member" style={dropdownItemStyle}>
                      Committee Members
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/committee-applications" style={dropdownItemStyle}>
                      Committee Applications
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/applicants-without-position" style={linkStyle}>
                Applicants Without Position
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/final-leaders-list" style={linkStyle}>
                Final Leaders List
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
