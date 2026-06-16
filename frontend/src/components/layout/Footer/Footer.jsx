import React from 'react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          &copy; {new Date().getFullYear()} Homeopathy Hospital Management System. All rights reserved.
        </p>
        <div className="footer-links">
          <span className="footer-status-dot"></span>
          <span className="footer-status-text">System Status: Online</span>
        </div>
      </div>
    </footer>
  );
};
