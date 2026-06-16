import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card/Card';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { CalendarClock, Phone } from 'lucide-react';
import './FollowUpsList.css';

export const FollowUpsList = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        const data = await api.getFollowUps();
        // Filter doctor's followups
        const docFollowups = data.filter(f => f.doctorName.includes('Amit Patel'));
        setFollowups(docFollowups);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, []);

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading follow-up records...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Follow-Up Case Reminders</h2>
        <p className="text-xs text-slate-500">Track and schedule recovery follow-up sessions for patients with chronic conditions.</p>
      </div>

      <Table headers={['ID', 'Patient Name', 'Monitoring Condition', 'Follow-up Date', 'Status', 'Actions']}>
        {followups.map((fu) => (
          <tr key={fu.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{fu.id}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <CalendarClock size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-850">{fu.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-650">{fu.condition}</td>
            <td className="px-4 py-3 text-slate-600 font-medium">{fu.nextDate}</td>
            <td className="px-4 py-3">
              <Badge variant={fu.status === 'Scheduled' ? 'info' : 'warning'}>
                {fu.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="secondary" className="flex items-center gap-1">
                <Phone size={12} />
                <span>Contact Patient</span>
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
