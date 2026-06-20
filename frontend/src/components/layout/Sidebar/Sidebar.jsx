import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../constants/roles';
import {
  LayoutDashboard, Building2, User, Stethoscope, HeartPulse, Package, Calendar,
  FileText, Settings, ArrowLeftRight, Bell, Folder, Phone, ChevronLeft, ChevronRight
} from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ activeTab, setActiveTab, onItemClick, isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();

  if (!user) return null;

  const menus = {
    [ROLES.ADMIN]: [
      { id: 'dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
      { id: 'hospitals',      label: 'Hospitals',         icon: Building2 },
      { id: 'doctors',        label: 'Doctors',           icon: Stethoscope },
      { id: 'patients',       label: 'Patients',          icon: HeartPulse },
      { id: 'inventory_reps', label: 'Inventory Reps',    icon: Package },
      { id: 'appointments',   label: 'Appointments',      icon: Calendar },
      { id: 'queue',          label: 'Queue Management',  icon: Package },
      { id: 'reports',        label: 'Reports',           icon: FileText },
      { id: 'profile',        label: 'Profile',           icon: User },
    ],
    [ROLES.DOCTOR]: [
      { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
      { id: 'patients',      label: 'Patients',     icon: HeartPulse },
      { id: 'appointments',  label: 'Appointments', icon: Calendar },
      { id: 'queue',         label: 'Patient Queue',icon: Package },
      { id: 'consultations', label: 'Consultations',icon: Stethoscope },
      { id: 'prescriptions', label: 'Prescriptions',icon: Folder },
      { id: 'reports',       label: 'Reports',      icon: FileText },
      { id: 'followups',     label: 'Follow-Ups',   icon: Calendar },
      { id: 'profile',       label: 'Profile',      icon: User },
    ],
    [ROLES.PATIENT]: [
      { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
      { id: 'my_visits',     label: 'My Visits',    icon: HeartPulse },
      { id: 'doctors',       label: 'Doctors',      icon: Stethoscope },
      { id: 'appointments',  label: 'Appointments', icon: Calendar },
      { id: 'prescriptions', label: 'Prescriptions',icon: Folder },
      { id: 'reports',       label: 'Reports',      icon: FileText },
      { id: 'followups',     label: 'Follow-Ups',   icon: Calendar },
      { id: 'notifications', label: 'Notifications',icon: Bell },
      { id: 'profile',       label: 'Profile',      icon: User },
    ],
    [ROLES.INVENTORY_REP]: [
      { id: 'dashboard',             label: 'Dashboard',            icon: LayoutDashboard },
      { id: 'assigned_doctors',      label: 'Assigned Doctors',     icon: Stethoscope },
      { id: 'inventory',             label: 'Inventory',            icon: Package },
      { id: 'prescription_requests', label: 'Prescription Requests',icon: Folder },
      { id: 'transactions',          label: 'Transactions',         icon: ArrowLeftRight },
      { id: 'reports',               label: 'Reports',              icon: FileText },
      { id: 'profile',               label: 'Profile',              icon: User },
    ],
  };

  const roleMenu = menus[user.role] || [];
  const displayName = user.full_name || user.email || 'User';

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      {/*
        ── Profile header
        The collapse toggle is INSIDE this row, absolutely pinned to the
        right edge so it floats half-inside / half-outside the sidebar.
      ── */}
      <div className="sidebar-profile-container">
        <div className="sidebar-avatar-wrapper">
          <div className="sidebar-avatar">{getInitials(displayName)}</div>
          <span className="sidebar-status-dot online"></span>
        </div>

        {!isCollapsed && (
          <div className="sidebar-profile-info">
            <h4 className="profile-name" title={displayName}>{displayName}</h4>
            <span className="profile-role">
              {user.role === 'INVENTORY_REP'
                ? 'Inventory Rep'
                : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </span>
          </div>
        )}

        {/* Floating collapse circle — half inside, half outside the sidebar */}
        {onToggleCollapse && (
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* ── Navigation list ── */}
      <nav className="sidebar-nav">
        {roleMenu.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
              onClick={() => {
                setActiveTab(item.id);
                if (onItemClick) onItemClick();
              }}
            >
              <Icon size={18} className="sidebar-link-icon" />
              {!isCollapsed && <span className="sidebar-link-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Emergency / Hospital phone card — always at the very bottom ── */}
      <div className="sidebar-emergency-container">
        <div className="sidebar-emergency-card">
          {/* Phone icon floats: half above the card top edge */}
          <div className="emergency-float-icon">
            <Phone size={16} />
          </div>
          {!isCollapsed && (
            <div className="emergency-info">
              <span className="emergency-title">Emergency Call</span>
              <a href="tel:0987654321" className="emergency-phone">0987654321</a>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};
