import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Calendar, Search } from 'lucide-react';
import './DoctorFollowUps.css';

export const DoctorFollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const data = await api.getConsultations();
        const list = [];
        data.forEach(consult => {
          if (consult.follow_up) {
            list.push({
              ...consult.follow_up,
              patientName: consult.patient_detail?.full_name,
              consultationDate: new Date(consult.created_at).toLocaleDateString()
            });
          }
        });
        // Sort closest future date first
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

  const filtered = followups.filter(f => 
    f.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.follow_up_notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-slate-500 text-sm">Loading follow-ups...</div>;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Follow-Up Consultations Planner</h2>
          <p className="text-xs text-slate-500">View upcoming reviews and monitor recovery progressions scheduled for your patient roster.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            placeholder="Search by patient or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          <Calendar className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="font-semibold text-slate-700">No follow-ups scheduled.</p>
          <p className="text-xs mt-1 text-slate-400">Configure target follow-up dates when completing consultations.</p>
        </div>
      ) : (
        <Table headers={['Follow-Up Date', 'Patient Name', 'Created During Visit', 'Instructions / Notes', 'Timeline status']}>
          {filtered.map((f) => {
            const isFuture = f.next_visit_date >= todayStr;
            return (
              <tr key={f.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-bold text-slate-800 text-sm">
                  {new Date(f.next_visit_date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-850 text-sm">{f.patientName}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{f.consultationDate}</td>
                <td className="px-4 py-3 text-slate-650 text-xs truncate max-w-sm">{f.follow_up_notes || '-'}</td>
                <td className="px-4 py-3">
                  <Badge variant={isFuture ? 'primary' : 'secondary'}>
                    {isFuture ? 'Upcoming' : 'Past Due / Met'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
};
