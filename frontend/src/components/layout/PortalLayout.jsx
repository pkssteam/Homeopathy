import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from './Navbar/Navbar';
import { Sidebar } from './Sidebar/Sidebar';
import { MobileDrawer } from './MobileDrawer/MobileDrawer';
import { Footer } from './Footer/Footer';
import './PortalLayout.css';

export const PortalLayout = ({ children, activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileDrawer = () => {
    setIsMobileOpen(!isMobileOpen);
  };

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
