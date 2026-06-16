import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { DashboardOverview } from '../features/inventory/DashboardOverview/DashboardOverview';
import { InventoryList } from '../features/inventory/InventoryList/InventoryList';
import { PrescriptionRequestsList } from '../features/inventory/PrescriptionRequestsList/PrescriptionRequestsList';
import { AssignedDoctorsList } from '../features/inventory/AssignedDoctorsList/AssignedDoctorsList';
import { TransactionsList } from '../features/inventory/TransactionsList/TransactionsList';
import { ProfileList } from '../features/admin/ProfileList/ProfileList';

export const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'items':
        return <InventoryList />;
      case 'requests':
        return <PrescriptionRequestsList />;
      case 'doctors':
        return <AssignedDoctorsList />;
      case 'transactions':
        return <TransactionsList />;
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
