import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Bell, LogOut, User } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo-icon">💚</span>
        <span className="navbar-title">Homepathy HMS</span>
        <span className="navbar-subtitle">Hospital Portal</span>
      </div>
      <div className="navbar-actions">
        {user && (
          <>
            <div className="navbar-notifications">
              <button 
                className="navbar-btn" 
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
              >
                <Bell size={18} />
                <span className="badge-dot"></span>
              </button>
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="dropdown-header">System Notifications</div>
                  <div className="dropdown-item">⚠️ Low Stock: Nux Vomica 30C drops below 20 vials</div>
                  <div className="dropdown-item">📅 New Appointment scheduled: Anita Sharma</div>
                  <div className="dropdown-item">💳 Bill BIL-503 paid (Rohan Verma)</div>
                </div>
              )}
            </div>
            
            <div className="navbar-user-profile">
              <div className="user-icon">
                <User size={16} />
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role.replace('_', ' ')}</span>
              </div>
            </div>

            <button className="navbar-logout-btn" onClick={logout} title="Log Out">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
