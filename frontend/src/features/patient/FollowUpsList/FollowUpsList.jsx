import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { CalendarClock } from 'lucide-react';
import './FollowUpsList.css';

export const FollowUpsList = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const data = await api.getFollowUps();
        // Filter for patient: Suresh Kumar
        const myFollowups = data.filter(f => f.name.includes('Suresh Kumar'));
        setFollowups(myFollowups);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, []);

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading follow-ups...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Your Follow-Up Schedules</h2>
        <p className="text-xs text-slate-500">View upcoming follow-up appointments and recovery progress evaluations.</p>
      </div>

      <Table headers={['Follow-up ID', 'Checkup Description', 'Assigned Physician', 'Scheduled Check Date', 'Status']}>
        {followups.map((fu) => (
          <tr key={fu.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{fu.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <CalendarClock size={16} className="text-slate-400" />
                <span>{fu.condition}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-650">{fu.doctorName}</td>
            <td className="px-4 py-3 text-slate-600 font-semibold">{fu.nextDate}</td>
            <td className="px-4 py-3">
              <Badge variant="info">
                {fu.status}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
