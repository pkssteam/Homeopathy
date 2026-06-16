import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { DashboardOverview } from '../features/admin/DashboardOverview/DashboardOverview';
import { HospitalsList } from '../features/admin/HospitalsList/HospitalsList';
import { DoctorsList } from '../features/admin/DoctorsList/DoctorsList';
import { PatientsList } from '../features/admin/PatientsList/PatientsList';
import { AppointmentsList } from '../features/admin/AppointmentsList/AppointmentsList';
import { InventoryList } from '../features/admin/InventoryList/InventoryList';
import { BillingList } from '../features/admin/BillingList/BillingList';
import { ReportsList } from '../features/admin/ReportsList/ReportsList';
import { ProfileList } from '../features/admin/ProfileList/ProfileList';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'hospitals':
        return <HospitalsList />;
      case 'doctors':
        return <DoctorsList />;
      case 'patients':
        return <PatientsList />;
      case 'appointments':
        return <AppointmentsList />;
      case 'inventory':
        return <InventoryList />;
      case 'billing':
        return <BillingList />;
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
