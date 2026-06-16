import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Select } from '../../../components/ui/Select/Select';
import { Input } from '../../../components/ui/Input/Input';
import { RefreshCw, Play, CheckCircle, PhoneCall } from 'lucide-react';
import './QueueManagement.css';

export const QueueManagement = () => {
  const [queues, setQueues] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { date: selectedDate };
      if (selectedDoctorId) params.doctor_id = selectedDoctorId;

      const [queueData, doctorsData] = await Promise.all([
        api.getQueue(params),
        api.getUsers('DOCTOR')
      ]);

      setQueues(queueData);
      setDoctors(doctorsData.filter(d => d.is_active));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load queue data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDoctorId, selectedDate]);

  const handleCall = async (id) => {
    try {
      await api.callPatient(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to call patient.');
    }
  };

  const handleStartConsultation = async (id) => {
    try {
      await api.startConsultation(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to start consultation.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.completeQueue(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to complete queue item.');
    }
  };

  if (loading && queues.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading queue entries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Queue Management</h2>
          <p className="text-xs text-slate-500">Monitor and regulate active waiting queues for clinic consultations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input 
            type="date"
            name="selectedDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40 py-1"
          />
          <Select
            name="selectedDoctorId"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            options={[
              { value: '', label: 'All Doctors' },
              ...doctors.map(d => ({ value: d.id, label: d.full_name }))
            ]}
            className="w-48 py-1"
          />
          <Button size="md" variant="secondary" onClick={fetchData}>
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {queues.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <PhoneCall size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Patients in Queue</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Queue entries are created automatically when an appointment is approved.
          </p>
        </div>
      ) : (
        <Table headers={['Queue No', 'Token', 'Patient Name', 'Assigned Doctor', 'Status', 'Called Time', 'Actions']}>
          {queues.map((item) => {
            let statusVariant = 'gray';
            if (item.current_status === 'Waiting') statusVariant = 'warning';
            else if (item.current_status === 'Called') statusVariant = 'info';
            else if (item.current_status === 'In Progress') statusVariant = 'success';
            else if (item.current_status === 'Completed') statusVariant = 'primary';

            return (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-bold text-slate-700 text-sm">
                  #{item.queue_number}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {item.appointment?.token_number ? `Token ${item.appointment.token_number}` : 'N/A'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 text-sm">
                  {item.appointment?.patient?.full_name}
                </td>
                <td className="px-4 py-3 text-slate-650 text-xs">
                  {item.appointment?.doctor?.full_name}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant}>
                    {item.current_status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {item.called_time ? new Date(item.called_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {item.current_status === 'Waiting' && (
                      <Button size="sm" variant="outline" onClick={() => handleCall(item.id)} className="flex items-center gap-1">
                        <PhoneCall size={12} />
                        <span>Call</span>
                      </Button>
                    )}
                    {item.current_status === 'Called' && (
                      <Button size="sm" variant="success" onClick={() => handleStartConsultation(item.id)} className="flex items-center gap-1">
                        <Play size={12} />
                        <span>Start</span>
                      </Button>
                    )}
                    {(item.current_status === 'Called' || item.current_status === 'In Progress') && (
                      <Button size="sm" variant="primary" onClick={() => handleComplete(item.id)} className="flex items-center gap-1">
                        <CheckCircle size={12} />
                        <span>Complete</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
};
