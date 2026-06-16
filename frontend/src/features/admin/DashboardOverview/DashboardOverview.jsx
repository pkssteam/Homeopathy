import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { api } from '../../../services/api';
import { Users, UserRound, Package, CreditCard, CalendarCheck } from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    inventory: 0,
    billing: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const patientsList = await api.getPatients();
        const doctorsList = await api.getDoctors();
        const inventoryList = await api.getInventory();
        const billsList = await api.getBills();
        const appointmentsList = await api.getAppointments();

        const totalBilling = billsList.reduce((acc, b) => acc + (b.status === 'Paid' ? b.total : 0), 0);

        setStats({
          patients: patientsList.length,
          doctors: doctorsList.length,
          inventory: inventoryList.length,
          billing: totalBilling
        });
        setAppointments(appointmentsList.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, []);

  if (loading) {
    return <div className="p-4 text-slate-500 font-medium text-sm">Loading system status overview...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-900">Hospital Administration Overview</h2>
        <p className="text-xs text-slate-500">Real-time status summaries, database statistics, and queue tracking.</p>
      </div>

      {/* Grid statistics - Avoid glowing box shadows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overview-card">
          <div className="card-stat-header">
            <Users size={20} className="text-sky-600" />
            <span className="stat-label">Total Patients</span>
          </div>
          <span className="stat-number">{stats.patients}</span>
        </Card>
        <Card className="overview-card">
          <div className="card-stat-header">
            <UserRound size={20} className="text-green-600" />
            <span className="stat-label">Active Doctors</span>
          </div>
          <span className="stat-number">{stats.doctors}</span>
        </Card>
        <Card className="overview-card">
          <div className="card-stat-header">
            <Package size={20} className="text-amber-600" />
            <span className="stat-label">Inventory Items</span>
          </div>
          <span className="stat-number">{stats.inventory}</span>
        </Card>
        <Card className="overview-card">
          <div className="card-stat-header">
            <CreditCard size={20} className="text-emerald-600" />
            <span className="stat-label">Collected Fees</span>
          </div>
          <span className="stat-number">${stats.billing.toFixed(2)}</span>
        </Card>
      </div>

      {/* Main Grid: Appointments & Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card title="Today's Active Appointments">
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex justify-between items-center p-3 border border-slate-100 rounded bg-slate-50/50">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{apt.patientName}</h4>
                    <p className="text-xs text-slate-500">{apt.doctorName} • {apt.time}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    apt.status === 'Consulting' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    apt.status === 'In Queue' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card title="Operational Tasks">
            <div className="flex flex-col gap-3">
              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-xs font-semibold text-slate-700 block">Weekly Statistics</span>
                <span className="text-xs text-slate-500">Total appointments this week: 14</span>
              </div>
              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-xs font-semibold text-slate-700 block">Database Status</span>
                <span className="text-xs text-green-700 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  MySQL & Django REST online
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
