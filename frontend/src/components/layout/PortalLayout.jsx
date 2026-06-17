import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar/Navbar';
import { Sidebar } from './Sidebar/Sidebar';
import { MobileDrawer } from './MobileDrawer/MobileDrawer';
import { Footer } from './Footer/Footer';
import { Bell, LogOut } from 'lucide-react';
import './PortalLayout.css';

export const PortalLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Desktop Header States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleMobileDrawer = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'DOCTOR': return 'Doctor';
      case 'PATIENT': return 'Patient';
      case 'INVENTORY_REP': return 'Inventory';
      default: return 'User';
    }
  };

  const roleLabel = getRoleLabel(user?.role);
  const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  return (
    <div className={`portal-layout role-${user?.role || 'default'} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar onToggleMenu={toggleMobileDrawer} activeTab={activeTab} />
      
      <div className="portal-container">
        {/* Desktop Sidebar */}
        <aside className="portal-sidebar-desktop">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </aside>

        {/* Main Content Viewport */}
        <div className="portal-viewport">
          
          {/* Desktop Only Small Nav Card Header */}
          <header className="portal-desktop-header">
            <div className="desktop-header-left">
              <span className="desktop-brand">Welcome to Homeopathy Hospital 🏥</span>
            </div>

            <div className="desktop-header-right">
              {/* Notifications Icon with Dropdown */}
              <div className="desktop-notifications-wrapper">
                <button 
                  className="desktop-header-icon-btn"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  aria-label="View alerts"
                >
                  <Bell size={18} />
                  <span className="desktop-badge-dot"></span>
                </button>
                {showNotifications && (
                  <div className="desktop-notifications-dropdown">
                    <div className="desktop-dropdown-header">System Alerts</div>
                    <div className="desktop-dropdown-item">⚠️ Low Stock: Arnica Montana 30C drops below threshold</div>
                    <div className="desktop-dropdown-item">📅 New appointment booked by Patient: Karan Malhotra</div>
                    <div className="desktop-dropdown-item">✅ Consultation completed for token #02</div>
                  </div>
                )}
              </div>

              {/* Profile Initials Dropdown */}
              <div className="desktop-profile-wrapper">
                <button 
                  className="desktop-profile-trigger-btn"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  aria-label="Open user options"
                >
                  <div className="desktop-profile-circle">
                    {initials}
                  </div>
                </button>
                {showProfileMenu && (
                  <div className="desktop-profile-dropdown-menu">
                    <div className="desktop-profile-menu-header">
                      <p className="desktop-menu-user-name">{user?.full_name}</p>
                      <p className="desktop-menu-user-email">{user?.email}</p>
                    </div>
                    <div className="desktop-profile-menu-divider"></div>
                    <button className="desktop-profile-menu-item" onClick={logout}>
                      <LogOut size={14} className="desktop-menu-item-icon text-danger" />
                      <span className="text-danger">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="portal-main-content">
            <div className="portal-max-width">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onItemClick={() => setIsMobileOpen(false)} 
          isCollapsed={false}
        />
      </MobileDrawer>
    </div>
  );
};
