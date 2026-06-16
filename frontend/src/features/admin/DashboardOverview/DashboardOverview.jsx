import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { api } from '../../../services/api';
import { Building, Users, ShieldAlert, Award } from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    hospitals: 0,
    users: 0,
    todayAppointments: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentHospitals, setRecentHospitals] = useState([]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const [hospitalsList, usersList, apptsList] = await Promise.all([
          api.getHospitals(),
          api.getUsers(),
          api.getAppointments()
        ]);

        const todayAppts = apptsList.filter(a => a.appointment_date === todayStr);
        const pendingAppts = apptsList.filter(a => a.status === 'Pending');

        setStats({
          hospitals: hospitalsList.length,
          users: usersList.length,
          todayAppointments: todayAppts.length,
          pendingApprovals: pendingAppts.length
        });
        setRecentHospitals(hospitalsList.slice(0, 3));
      } catch (err) {
        console.error('Error fetching overview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading admin overview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="dashboard-hero-banner">
        <span className="hero-banner-role">Administration Control Desk</span>
        <h3 className="hero-banner-title">Welcome Back, Hospital Director</h3>
        <p className="hero-banner-subtitle">Monitor clinical schedules, active branch locations, and user roles.</p>
        <div className="hero-banner-stats">
          <div className="hero-stat-pill">
            <span className="hero-stat-icon">🏥</span>
            <span>{stats.hospitals} Branches</span>
          </div>
          <div className="hero-stat-pill">
            <span className="hero-stat-icon">👥</span>
            <span>{stats.users} Registered Accounts</span>
          </div>
          <div className="hero-stat-pill">
            <span className="hero-stat-icon">📅</span>
            <span>{stats.todayAppointments} Daily Bookings</span>
          </div>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overview-card">
          <div className="card-stat-header">
            <Building size={20} className="text-medical-600" />
            <span className="stat-label">Hospitals & Branches</span>
          </div>
          <span className="stat-number">{stats.hospitals}</span>
        </Card>
        <Card className="overview-card">
          <div className="card-stat-header">
            <Users size={20} className="text-sky-600" />
            <span className="stat-label">Total Accounts</span>
          </div>
          <span className="stat-number">{stats.users}</span>
        </Card>
        <Card className="overview-card">
          <div className="card-stat-header">
            <ShieldAlert size={20} className="text-amber-600" />
            <span className="stat-label">Pending Approvals</span>
          </div>
          <span className="stat-number">{stats.pendingApprovals}</span>
        </Card>
        <Card className="overview-card">
          <div className="card-stat-header">
            <Award size={20} className="text-emerald-600" />
            <span className="stat-label">Today's Appointments</span>
          </div>
          <span className="stat-number">{stats.todayAppointments}</span>
        </Card>
      </div>

      {/* Main Grid: Recent Hospitals & System Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card title="Recently Registered Locations">
            <div className="space-y-3">
              {recentHospitals.length === 0 ? (
                <p className="text-xs text-slate-400 p-2">No hospitals registered yet.</p>
              ) : (
                recentHospitals.map((hosp) => (
                  <div key={hosp.id} className="flex justify-between items-center p-3 border border-slate-100 rounded bg-slate-50/50">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{hosp.hospital_name}</h4>
                      <p className="text-xs text-slate-500">{hosp.branch_name} • {hosp.city}, {hosp.state}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                      hosp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {hosp.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        <div>
          <Card title="System Environment">
            <div className="flex flex-col gap-3">
              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-xs font-semibold text-slate-700 block">Database Status</span>
                <span className="text-xs text-green-700 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  MySQL Database Connected
                </span>
              </div>
              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-xs font-semibold text-slate-700 block">Auth Engine</span>
                <span className="text-[11px] text-slate-500">
                  Django REST Framework + SimpleJWT (Bearer token) enabled.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
