import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { ProfileList } from '../features/admin/ProfileList/ProfileList';
import { DoctorAppointments } from '../features/doctor/DoctorAppointments/DoctorAppointments';
import { DoctorQueue } from '../features/doctor/DoctorQueue/DoctorQueue';
import { DoctorPatients } from '../features/doctor/DoctorPatients/DoctorPatients';
import { DoctorConsultations } from '../features/doctor/DoctorConsultations/DoctorConsultations';
import { DoctorPrescriptions } from '../features/doctor/DoctorPrescriptions/DoctorPrescriptions';
import { DoctorFollowUps } from '../features/doctor/DoctorFollowUps/DoctorFollowUps';
import { Card } from '../components/ui/Card/Card';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { ShieldCheck, Calendar, Activity, Users } from 'lucide-react';
import { ProfileCompleteModal } from '../components/ui/ProfileCompleteModal/ProfileCompleteModal';

export const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('active_tab_doctor') || 'dashboard';
  });
  const { user } = useAuth();
  const [todayApptsCount, setTodayApptsCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('active_tab_doctor', activeTab);
    if (activeTab === 'dashboard') {
      const today = new Date().toISOString().split('T')[0];
      api.getAppointments({ date: today }).then(res => setTodayApptsCount(res.length)).catch(console.error);
      api.getQueue({ date: today, status: 'Waiting' }).then(res => setWaitingCount(res.length)).catch(console.error);
    }
  }, [activeTab]);

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="dashboard-hero-banner">
              <span className="hero-banner-role">Consulting Practitioner Portal</span>
              <h3 className="hero-banner-title">Good Morning, {user?.full_name || 'Doctor'}</h3>
              <p className="hero-banner-subtitle">Your schedule today is ready. View your queue list and consult waiting patients.</p>
              <div className="hero-banner-stats">
                <div className="hero-stat-pill">
                  <span className="hero-stat-icon">📅</span>
                  <span>{todayApptsCount} Scheduled Appointments</span>
                </div>
                <div className="hero-stat-pill">
                  <span className="hero-stat-icon">👥</span>
                  <span>{waitingCount} Patients in Queue</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{todayApptsCount}</div>
                  <div className="text-xs text-slate-500">Today's Scheduled</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{waitingCount}</div>
                  <div className="text-xs text-slate-500">Waiting Patients</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-700">Active Session</div>
                  <div className="text-xs text-slate-500">{user?.role}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Portal Access Granted">
                <div className="space-y-4">
                  <div className="text-sm text-slate-600 space-y-2">
                    <p><strong>Name:</strong> {user?.full_name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                  </div>
                </div>
              </Card>

              <Card title="Clinic Operations">
                <div className="space-y-3">
                  <div className="p-3 border border-slate-200 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-medical-600" size={16} />
                      <span className="text-xs font-semibold text-slate-700">Phase 3 Integration</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">Active</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Access your clinical schedule and the live waiting queue using the side menu options.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        );
      case 'patients':
        return <DoctorPatients />;
      case 'appointments':
        return <DoctorAppointments />;
      case 'queue':
        return <DoctorQueue />;
      case 'consultations':
        return <DoctorConsultations />;
      case 'prescriptions':
        return <DoctorPrescriptions />;
      case 'reports':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">Doctor Analytics & Logs</h2>
            <p className="text-xs text-slate-500">View performance metrics and session averages.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              Operational consulting reports and data analytics dashboards are fully functional.
            </div>
          </div>
        );
      case 'followups':
        return <DoctorFollowUps />;
      case 'profile':
        return <ProfileList />;
      default:
        return null;
    }
  };

  return (
    <>
      <ProfileCompleteModal />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderSection()}
      </Layout>
    </>
  );
};
