import React from 'react';
import { X } from 'lucide-react';
import './MobileDrawer.css';

export const MobileDrawer = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-drawer-body">
          <button className="mobile-drawer-close-floating" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};
