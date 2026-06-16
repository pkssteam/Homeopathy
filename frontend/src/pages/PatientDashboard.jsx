import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { DashboardOverview } from '../features/patient/DashboardOverview/DashboardOverview';
import { DoctorsList } from '../features/patient/DoctorsList/DoctorsList';
import { AppointmentsList } from '../features/patient/AppointmentsList/AppointmentsList';
import { PrescriptionsList } from '../features/patient/PrescriptionsList/PrescriptionsList';
import { ReportsList } from '../features/patient/ReportsList/ReportsList';
import { FollowUpsList } from '../features/patient/FollowUpsList/FollowUpsList';
import { ProfileList } from '../features/admin/ProfileList/ProfileList';

export const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'doctors':
        return <DoctorsList onBook={() => setActiveTab('appointments')} />;
      case 'appointments':
        return <AppointmentsList />;
      case 'prescriptions':
        return <PrescriptionsList />;
      case 'reports':
        return <ReportsList />;
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
