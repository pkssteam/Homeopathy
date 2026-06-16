import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { DashboardOverview } from '../features/doctor/DashboardOverview/DashboardOverview';
import { WaitingList } from '../features/doctor/WaitingList/WaitingList';
import { ConsultationsList } from '../features/doctor/ConsultationsList/ConsultationsList';
import { PrescriptionsList } from '../features/doctor/PrescriptionsList/PrescriptionsList';
import { FollowUpsList } from '../features/doctor/FollowUpsList/FollowUpsList';
import { ProfileList } from '../features/admin/ProfileList/ProfileList';

export const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'waiting':
        return <WaitingList onConsult={() => setActiveTab('consultations')} />;
      case 'appointments':
      case 'consultations':
        return <ConsultationsList />;
      case 'prescriptions':
        return <PrescriptionsList />;
      case 'followups':
        return <FollowUpsList />;
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
