import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { api } from '../../../services/api';
import { Calendar, FileHeart, Heart, Info } from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const apts = await api.getAppointments();
        const prs = await api.getPrescriptions();
        
        // Filter records for logged in patient: Suresh Kumar
        const myApts = apts.filter(a => a.patientName.includes('Suresh Kumar'));
        const myPrs = prs.filter(p => p.patientName.includes('Suresh Kumar'));

        setAppointments(myApts);
        setPrescriptions(myPrs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading patient profile overview...</div>;

  const nextApt = appointments.find(a => a.status !== 'Completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-900">Welcome, Suresh Kumar</h2>
        <p className="text-xs text-slate-500">Access your healthcare profile, view diagnostic schedules, and order dilutions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          {/* Next Scheduled Checkup */}
          <Card title="Your Next Appointment">
            {nextApt ? (
              <div className="flex items-start gap-4 p-4 border border-slate-100 rounded bg-emerald-50/50">
                <div className="w-10 h-10 rounded bg-green-150 text-green-700 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">{nextApt.doctorName}</h4>
                  <p className="text-xs text-slate-500">{nextApt.type} • {nextApt.time} ({nextApt.date})</p>
                  <div className="mt-2">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-amber-200 bg-amber-50 text-amber-800`}>
                      Queue Status: {nextApt.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50 rounded border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-semibold">You have no upcoming appointments scheduled.</p>
              </div>
            )}
          </Card>

          {/* Active Remedies */}
          <Card title="Active Remedies & Dosages">
            <div className="space-y-3">
              {prescriptions.length > 0 ? prescriptions.map((pr) => (
                <div key={pr.id} className="flex justify-between items-center p-3 border border-slate-150 rounded bg-white">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{pr.medicine}</h4>
                    <p className="text-xs text-slate-500">{pr.dosage} • {pr.duration}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-green-200 bg-green-50 text-green-700">
                    {pr.status}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-slate-500">No active remedies on file.</p>
              )}
            </div>
          </Card>

        </div>
        
        {/* Healthcare Tips Card */}
        <div>
          <Card title="Homeopathic Wellness Guidance">
            <div className="space-y-4">
              <div className="flex gap-2.5 items-start">
                <Info size={16} className="text-medical-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">
                  <strong>Avoid Strong Odors:</strong> Do not consume coffee, mint, or camphor items 30 minutes before or after taking homeopathy dilutions.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <Heart size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">
                  <strong>Dry Administration:</strong> Dissolve pills directly under the tongue without touching them with your hands, to maintain efficacy.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
