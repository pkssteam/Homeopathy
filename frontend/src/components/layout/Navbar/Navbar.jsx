import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Bell, LogOut, User, Menu, Search, Star, Globe } from 'lucide-react';
import './Navbar.css';

export const Navbar = ({ onToggleMenu, activeTab }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'DOCTOR':
        return 'Doctor';
      case 'PATIENT':
        return 'Patient';
      case 'INVENTORY_REP':
        return 'Inventory Representative';
      default:
        return 'User';
    }
  };

  const roleLabel = getRoleLabel(user.role);
  const activeTabLabel = activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ') : 'Dashboard';

  return (
    <header className="navbar">
      {/* Brand & Mobile Hamburger Toggle */}
      <div className="navbar-left">
        <button className="navbar-menu-toggle-btn" onClick={onToggleMenu} aria-label="Toggle navigation menu">
          <Menu size={18} />
        </button>
        <div className="navbar-breadcrumb">
          <span className="breadcrumb-parent">Homeopathy HMS</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{roleLabel} Portal</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-page">{activeTabLabel}</span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="navbar-center">
        <div className="navbar-search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search records, appointments or medicines..." 
            className="navbar-search-input" 
          />
        </div>
      </div>

      {/* Right Icons & Profile Settings */}
      <div className="navbar-actions">
        {/* Localization Mock Icon */}
        <button className="navbar-icon-btn" aria-label="Language selector">
          <Globe size={18} />
        </button>

        {/* Favorite Star Mock Icon */}
        <button className="navbar-icon-btn" aria-label="Star favorites">
          <Star size={18} />
        </button>

        {/* Notifications Icon with Dropdown */}
        <div className="navbar-notifications">
          <button 
            className="navbar-icon-btn" 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="badge-dot"></span>
          </button>
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">System Alerts</div>
              <div className="dropdown-item">⚠️ Low Stock: Arnica Montana 30C drops below threshold</div>
              <div className="dropdown-item">📅 New appointment booked by Patient: Karan Malhotra</div>
              <div className="dropdown-item">✅ Consultation completed for token #02</div>
            </div>
          )}
        </div>
        
        {/* User Profile Dropdown Button */}
        <div className="navbar-user-profile-dropdown">
          <button 
            className="navbar-profile-trigger" 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            aria-label="User menu"
          >
            <div className="profile-circle">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
          
          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <div className="profile-menu-header">
                <p className="menu-user-name">{user.full_name}</p>
                <p className="menu-user-email">{user.email}</p>
              </div>
              <div className="profile-menu-divider"></div>
              <button className="profile-menu-item" onClick={logout}>
                <LogOut size={14} className="menu-item-icon text-danger" />
                <span className="text-danger">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
