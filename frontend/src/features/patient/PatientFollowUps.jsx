import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Badge } from '../../components/ui/Badge/Badge';
import { Calendar, Stethoscope, Clock, AlertCircle } from 'lucide-react';

export const PatientFollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const data = await api.getConsultations();
        const list = [];
        data.forEach(consult => {
          if (consult.follow_up) {
            list.push({
              ...consult.follow_up,
              doctorName: consult.doctor_detail?.full_name,
              hospitalName: consult.doctor_detail?.hospital_name,
              branchName: consult.doctor_detail?.branch_name,
              consultationDate: new Date(consult.created_at).toLocaleDateString()
            });
          }
        });
        // Sort follow-ups so closest future date is first
        list.sort((a, b) => new Date(a.next_visit_date) - new Date(b.next_visit_date));
        setFollowups(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-500 text-sm">Loading follow-ups...</div>;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Follow-Up Consultations Planner</h2>
        <p className="text-xs text-slate-500">Track treatment progression timelines and future visit dates set by your physician.</p>
      </div>

      {followups.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          <Calendar className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="font-semibold text-slate-700">No scheduled follow-up dates.</p>
          <p className="text-xs mt-1 text-slate-400">Recommended review dates and notes from your consultations will populate here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followups.map((item) => {
            const isFuture = item.next_visit_date >= todayStr;
            return (
              <div 
                key={item.id} 
                className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-350 transition ${
                  isFuture ? 'border-blue-200 bg-blue-50/5' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isFuture ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Target Visit Date</span>
                      <span className="font-bold text-slate-800 text-sm">
                        {new Date(item.next_visit_date).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <Badge variant={isFuture ? 'primary' : 'secondary'}>
                    {isFuture ? 'Upcoming' : 'Completed'}
                  </Badge>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-650">
                    <Stethoscope size={14} className="text-slate-400" />
                    <span><strong>Doctor:</strong> Dr. {item.doctorName}</span>
                  </div>
                  <div className="text-slate-500 pl-5 text-[11px]">
                    {item.hospitalName} ({item.branchName})
                  </div>
                  <div className="flex items-center gap-2 text-slate-650">
                    <Clock size={14} className="text-slate-400" />
                    <span><strong>Set during consult on:</strong> {item.consultationDate}</span>
                  </div>

                  {item.follow_up_notes && (
                    <div className="mt-2 pl-2 border-l-2 border-slate-300 text-slate-700 bg-slate-50 p-2 rounded">
                      <div className="font-semibold text-slate-550 flex items-center gap-1 mb-0.5">
                        <AlertCircle size={12} />
                        <span>Physician Instructions:</span>
                      </div>
                      <p>{item.follow_up_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
