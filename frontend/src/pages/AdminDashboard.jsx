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
import { ReportsList } from '../features/admin/ReportsList/ReportsList';

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
        return <ReportsList />;
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
