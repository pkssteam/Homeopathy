import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { ProfileList } from '../features/admin/ProfileList/ProfileList';
import { PatientAppointments } from '../features/patient/PatientAppointments';
import { PatientDoctors } from '../features/patient/PatientDoctors';
import { Card } from '../components/ui/Card/Card';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { ShieldCheck, HeartPulse, Clock, Calendar, Bell } from 'lucide-react';
import { ProfileCompleteModal } from '../components/ui/ProfileCompleteModal/ProfileCompleteModal';

export const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  // Dashboard state
  const [upcomingAppt, setUpcomingAppt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setLoading(true);
      api.getAppointments().then(res => {
        // Find first pending or approved
        const first = res.find(a => a.status === 'Pending' || a.status === 'Approved');
        setUpcomingAppt(first || null);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [activeTab]);

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="dashboard-hero-banner">
              <span className="hero-banner-role">Patient Self-Service Portal</span>
              <h3 className="hero-banner-title">Welcome Back, {user?.full_name || 'Patient'}</h3>
              <p className="hero-banner-subtitle">Access your digital prescriptions, follow-ups, and active appointment tokens.</p>
              <div className="hero-banner-stats">
                {upcomingAppt ? (
                  <div className="hero-stat-pill">
                    <span className="hero-stat-icon">📅</span>
                    <span>Next Visit: {upcomingAppt.appointment_date} @ {upcomingAppt.appointment_time}</span>
                  </div>
                ) : (
                  <div className="hero-stat-pill">
                    <span className="hero-stat-icon">🏥</span>
                    <span>No Scheduled Visits</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Patient Profile Status">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-700 font-semibold bg-green-50 border border-green-200 p-3 rounded">
                    <ShieldCheck size={20} />
                    <span>Secure Patient Session Active</span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-2">
                    <p><strong>Name:</strong> {user?.full_name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                  </div>
                </div>
              </Card>

              <Card title="Upcoming Appointment Status">
                {upcomingAppt ? (
                  <div className="space-y-3">
                    <div className="p-3 border border-slate-200 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="text-medical-600" size={16} />
                        <span className="text-xs font-semibold text-slate-700">Scheduled Visit</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${upcomingAppt.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {upcomingAppt.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-700 space-y-1">
                      <p><strong>Doctor:</strong> {upcomingAppt.doctor?.full_name}</p>
                      <p><strong>Date & Time:</strong> {upcomingAppt.appointment_date} @ {upcomingAppt.appointment_time}</p>
                      {upcomingAppt.token_number && (
                        <p><strong>Token Number:</strong> <span className="text-medical-600 font-bold">#{upcomingAppt.token_number}</span></p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 border border-slate-200 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="text-slate-400" size={16} />
                        <span className="text-xs font-semibold text-slate-700">No Upcoming Appointment</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-550 leading-relaxed">
                      You do not have any scheduled consultations at this time. Use the booking option in the side menu to request a consultation.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );
      case 'doctors':
        return <PatientDoctors />;
      case 'appointments':
        return <PatientAppointments />;
      case 'prescriptions':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">My Remedies & Prescriptions</h2>
            <p className="text-xs text-slate-500">Track and view dilution drops and prescription details requested by your doctor.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              Your prescription log will be displayed here in Phase 4.
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">Lab & Treatment Reports</h2>
            <p className="text-xs text-slate-500">View diagnostic tests and digital assessment folders.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              Clinical reports repository will be enabled in Phase 4.
            </div>
          </div>
        );
      case 'followups':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">Follow-Up Consultations Planner</h2>
            <p className="text-xs text-slate-500">Schedule check-ups and treatment assessments.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              Chronological follow-up bookings will be enabled in Phase 4.
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">System Alerts & Notifications</h2>
            <p className="text-xs text-slate-500">Stay updated on approved schedules and dilution inventory levels.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              Real-time SMS and push notifications logs will be shown in Phase 4.
            </div>
          </div>
        );
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
