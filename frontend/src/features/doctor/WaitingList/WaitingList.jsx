import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Hourglass, Play } from 'lucide-react';
import './WaitingList.css';

export const WaitingList = ({ onConsult }) => {
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const apts = await api.getAppointments();
        // Filter doctor's patients in queue
        const inQueue = apts.filter(a => a.doctorName.includes('Amit Patel') && a.status === 'In Queue');
        setWaitingQueue(inQueue);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleStartConsultation = async (id) => {
    try {
      await api.updateAppointmentStatus(id, 'Consulting');
      if (onConsult) onConsult();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading queue list...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Patient Waiting Queue</h2>
        <p className="text-xs text-slate-500">Track clinic patients waiting for consultation checkups. Begin consultations immediately.</p>
      </div>

      <Table headers={['Apt ID', 'Patient Name', 'Schedule Time', 'Status', 'Actions']}>
        {waitingQueue.length > 0 ? waitingQueue.map((apt) => (
          <tr key={apt.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{apt.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-800">{apt.patientName}</td>
            <td className="px-4 py-3 text-slate-650">{apt.time}</td>
            <td className="px-4 py-3">
              <Badge variant="warning">
                {apt.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="medical" onClick={() => handleStartConsultation(apt.id)} className="flex items-center gap-1">
                <Play size={12} fill="currentColor" />
                <span>Call Patient</span>
              </Button>
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-xs font-semibold">
              <div className="flex flex-col items-center gap-2">
                <Hourglass size={24} className="text-slate-300" />
                <span>No patients currently waiting in queue.</span>
              </div>
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};
