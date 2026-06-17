import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { DashboardOverview } from '../features/admin/DashboardOverview/DashboardOverview';
import { HospitalsList } from '../features/hospitals/HospitalsList/HospitalsList';
import { AppointmentsList } from '../features/admin/AppointmentsList/AppointmentsList';
import { QueueManagement } from '../features/admin/QueueManagement/QueueManagement';
import { DoctorsList } from '../features/admin/DoctorsList/DoctorsList';
import { PatientsList } from '../features/admin/PatientsList/PatientsList';
import { InventoryRepsList } from '../features/admin/InventoryRepsList/InventoryRepsList';
import { StaffList } from '../features/admin/StaffList/StaffList';
import { ProfileList } from '../features/admin/ProfileList/ProfileList';

import { SettingsPanel } from '../features/admin/SettingsPanel/SettingsPanel';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'hospitals':
        return <HospitalsList />;
      case 'appointments':
        return <AppointmentsList />;
      case 'queue':
        return <QueueManagement />;
      case 'doctors':
        return <DoctorsList />;
      case 'patients':
        return <PatientsList />;
      case 'inventory_reps':
        return <InventoryRepsList />;
      case 'staff':
        return <StaffList />;
      case 'reports':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">System Reports & Analytics</h2>
            <p className="text-xs text-slate-500">Export clinical schedules, hospital status reports, and user access records.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              Operational audits and reports metrics will be enabled in Phase 4.
            </div>
          </div>
        );
      case 'settings':
        return <SettingsPanel />;
      case 'profile':
        return <ProfileList />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderSection()}
    </Layout>
  );
};
