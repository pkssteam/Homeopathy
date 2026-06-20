import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { RefreshCw, Calendar } from 'lucide-react';
import './DoctorAppointments.css';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterToday, setFilterToday] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterToday) {
        params.date = new Date().toISOString().split('T')[0];
      }
      const data = await api.getAppointments(params);
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch your appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterToday]);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinical Schedule</h2>
          <p className="text-xs text-slate-500">View and prepare for patients booked under your consultation profile.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="md" 
            variant={filterToday ? 'medical' : 'secondary'} 
            onClick={() => setFilterToday(true)}
          >
            Today's Schedule
          </Button>
          <Button 
            size="md" 
            variant={!filterToday ? 'medical' : 'secondary'} 
            onClick={() => setFilterToday(false)}
          >
            All Appointments
          </Button>
          <Button size="md" variant="secondary" onClick={fetchData} className="px-3">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Calendar size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Patients Scheduled</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {filterToday ? "No clinical consultations booked for today." : "No upcoming consultations currently booked."}
          </p>
        </div>
      ) : (
        <Table headers={['Token', 'Patient Name', 'Phone', 'Date & Time', 'Reason', 'Status']}>
          {appointments.map((appt) => {
            let statusVariant = 'gray';
            if (appt.status === 'Pending') statusVariant = 'warning';
            else if (appt.status === 'Approved') statusVariant = 'success';
            else if (appt.status === 'Cancelled') statusVariant = 'danger';
            else if (appt.status === 'Completed') statusVariant = 'primary';

            return (
              <tr key={appt.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold text-slate-700 text-xs">
                  {appt.token_number ? `#${appt.token_number}` : 'N/A'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 text-sm">
                  {appt.patient?.full_name}
                </td>
                <td className="px-4 py-3 text-slate-655 text-xs">
                  {appt.patient?.phone || '-'}
                </td>
                <td className="px-4 py-3 text-slate-655 text-xs">
                  <div>{appt.appointment_date}</div>
                  <div className="text-[10px] text-slate-400">{appt.appointment_time}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-xs">
                  {appt.reason || '-'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant}>
                    {appt.status}
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
