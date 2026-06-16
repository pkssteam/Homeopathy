import React from 'react';
import { X } from 'lucide-react';
import './MobileDrawer.css';

export const MobileDrawer = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-title">Navigation</span>
          <button className="mobile-drawer-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <div className="mobile-drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
};
