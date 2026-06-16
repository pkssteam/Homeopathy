import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../constants/roles';
import { 
  LayoutDashboard, Building2, UserRound, Users, Calendar, 
  Package, CreditCard, FileBarChart, User, Hourglass, 
  ClipboardCheck, Pill, CalendarClock, FileClock, ArrowLeftRight
} from 'lucide-react';
import './Sidebar.css';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  if (!user) return null;

  // Define sidebar menus for each role
  const menus = {
    [ROLES.ADMIN]: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'hospitals', label: 'Hospitals', icon: Building2 },
      { id: 'doctors', label: 'Doctors', icon: UserRound },
      { id: 'patients', label: 'Patients', icon: Users },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'inventory', label: 'Inventory', icon: Package },
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'reports', label: 'Reports', icon: FileBarChart },
      { id: 'profile', label: 'Profile', icon: User }
    ],
    [ROLES.DOCTOR]: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'waiting', label: 'Waiting Patients', icon: Hourglass },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'patients', label: 'Patients', icon: Users },
      { id: 'consultations', label: 'Consultations', icon: ClipboardCheck },
      { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
      { id: 'reports', label: 'Reports', icon: FileBarChart },
      { id: 'followups', label: 'Follow-Ups', icon: CalendarClock },
      { id: 'profile', label: 'Profile', icon: User }
    ],
    [ROLES.PATIENT]: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'doctors', label: 'Book Doctors', icon: UserRound },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
      { id: 'reports', label: 'Medical Reports', icon: FileBarChart },
      { id: 'followups', label: 'Follow-Ups', icon: CalendarClock },
      { id: 'profile', label: 'My Profile', icon: User }
    ],
    [ROLES.INVENTORY_REP]: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'items', label: 'Inventory Items', icon: Package },
      { id: 'requests', label: 'Prescription Requests', icon: FileClock },
      { id: 'doctors', label: 'Assigned Doctors', icon: UserRound },
      { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
      { id: 'reports', label: 'Reports', icon: FileBarChart },
      { id: 'profile', label: 'Profile', icon: User }
    ]
  };

  const roleMenu = menus[user.role] || [];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {roleMenu.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComponent size={18} className="sidebar-link-icon" />
              <span className="sidebar-link-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-footer-text">Logged in as {user.name.split(' ')[0]}</span>
      </div>
    </aside>
  );
};
