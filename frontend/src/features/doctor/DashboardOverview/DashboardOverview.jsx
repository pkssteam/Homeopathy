import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { api } from '../../../services/api';
import { Users, Hourglass, ClipboardCheck, Bell } from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalConsulted: 12,
    waitingQueue: 0,
    prescriptionsIssued: 0,
    alerts: 2
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const apts = await api.getAppointments();
        const prescriptions = await api.getPrescriptions();
        
        // Filter appointments assigned to Dr. Amit Patel (the default logged-in doctor)
        const docApts = apts.filter(a => a.doctorName.includes('Amit Patel'));
        const waiting = docApts.filter(a => a.status === 'In Queue' || a.status === 'Consulting').length;
        const issued = prescriptions.filter(p => p.doctorName.includes('Amit Patel')).length;

        setStats(prev => ({
          ...prev,
          waitingQueue: waiting,
          prescriptionsIssued: issued
        }));
        setAppointments(docApts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorData();
  }, []);

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading doctor dashboard overview...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-900">Physician Dashboard</h2>
        <p className="text-xs text-slate-500">Welcome, Dr. Amit Patel. Manage your consultations, patient queue, and prescriptions below.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-sky-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients Treated</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">{stats.totalConsulted}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Hourglass size={20} className="text-amber-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients in Queue</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">{stats.waitingQueue}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={20} className="text-green-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prescriptions Made</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">{stats.prescriptionsIssued}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-red-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Urgent Action Items</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">{stats.alerts}</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card title="Today's Consultation Schedule">
            <div className="divide-y divide-slate-100">
              {appointments.length > 0 ? appointments.map((apt) => (
                <div key={apt.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{apt.patientName}</h4>
                    <p className="text-xs text-slate-500">{apt.time} • {apt.type}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    apt.status === 'Consulting' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    apt.status === 'In Queue' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-slate-500 py-2">No appointments scheduled for today.</p>
              )}
            </div>
          </Card>
        </div>
        <div>
          <Card title="Urgent Clinical Reminders">
            <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
              <li>Review Anita Sharma's eczema status (follow-up scheduled for next week).</li>
              <li>Dispense Nux Vomica prescription request for Anita.</li>
              <li>Submit monthly clinical feedback report to Administrator.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
