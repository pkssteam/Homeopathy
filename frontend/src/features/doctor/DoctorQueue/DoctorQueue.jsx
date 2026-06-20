import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { RefreshCw, Play, CheckCircle, PhoneCall, UserCheck } from 'lucide-react';
import { ConsultationWorkspace } from '../ConsultationWorkspace/ConsultationWorkspace';
import './DoctorQueue.css';

export const DoctorQueue = () => {
  const [queues, setQueues] = useState([]);
  const [activeConsultationEntry, setActiveConsultationEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getQueue({ date: today });
      setQueues(data);
      // Auto-open workspace if a consultation is already in progress
      const inProgress = data.find(q => q.current_status === 'In Progress');
      if (inProgress) {
        setActiveConsultationEntry(inProgress);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch doctor queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      // Fetch queue details and show workspace immediately
      const data = await api.getQueue({ date: today });
      setQueues(data);
      const inProgress = data.find(q => q.id === id);
      if (inProgress) {
        setActiveConsultationEntry(inProgress);
      } else {
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to start consultation.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.completeQueue(id);
      setActiveConsultationEntry(null);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to complete consultation.');
    }
  };

  if (activeConsultationEntry) {
    return (
      <ConsultationWorkspace 
        queueEntry={activeConsultationEntry} 
        onBack={() => setActiveConsultationEntry(null)} 
        onComplete={() => {
          setActiveConsultationEntry(null);
          fetchData();
        }}
      />
    );
  }

  // Find currently active patient (status is 'Called' or 'In Progress')
  const activeEntry = queues.find(q => q.current_status === 'Called' || q.current_status === 'In Progress');
  const waitingEntries = queues.filter(q => q.current_status === 'Waiting');
  const completedEntries = queues.filter(q => q.current_status === 'Completed');

  if (loading && queues.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Consultation Queue</h2>
          <p className="text-xs text-slate-500">Call, track, and complete waiting patients for today's clinic schedule.</p>
        </div>
        <Button size="md" variant="secondary" onClick={fetchData} className="px-3">
          <RefreshCw size={14} />
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Active Consultation Callout */}
      {activeEntry ? (
        <div className="bg-medical-50 border border-medical-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] bg-medical-600 text-white font-bold uppercase px-2 py-0.5 rounded">
              Current Patient
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {activeEntry.appointment?.patient?.full_name} (Token #{activeEntry.appointment?.token_number})
            </h3>
            <p className="text-xs text-slate-655">
              <strong>Reason:</strong> {activeEntry.appointment?.reason || 'General homeopathy consultation'}
            </p>
            <p className="text-xs text-slate-555">
              Status: <span className="font-semibold text-medical-700">{activeEntry.current_status}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {activeEntry.current_status === 'Called' && (
              <Button size="md" variant="medical" onClick={() => handleStartConsultation(activeEntry.id)} className="flex items-center gap-1.5">
                <Play size={16} />
                <span>Start Consultation</span>
              </Button>
            )}
            <Button size="md" variant="primary" onClick={() => handleComplete(activeEntry.id)} className="flex items-center gap-1.5">
              <CheckCircle size={16} />
              <span>Complete Consultation</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-center text-slate-555 text-sm font-medium">
          No patient currently in consultation. Call the next patient in queue below.
        </div>
      )}

      {/* Waiting List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <UserCheck size={16} className="text-slate-500" />
          <span>Waiting Room ({waitingEntries.length} Patients)</span>
        </h3>
        
        {waitingEntries.length === 0 ? (
          <p className="text-xs text-slate-500 bg-white border border-slate-200 p-4 rounded text-center font-medium">
            No patients currently waiting in queue.
          </p>
        ) : (
          <Table headers={['Queue No', 'Token', 'Patient Name', 'Visit Reason', 'Actions']}>
            {waitingEntries.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-bold text-slate-700 text-sm">#{item.queue_number}</td>
                <td className="px-4 py-3 text-slate-500 text-xs font-semibold">Token {item.appointment?.token_number}</td>
                <td className="px-4 py-3 font-semibold text-slate-850 text-sm">{item.appointment?.patient?.full_name}</td>
                <td className="px-4 py-3 text-slate-655 text-xs truncate max-w-xs">{item.appointment?.reason || '-'}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => handleCall(item.id)} className="flex items-center gap-1">
                    <PhoneCall size={12} />
                    <span>Call Patient</span>
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Completed List */}
      {completedEntries.length > 0 && (
        <div className="space-y-3 opacity-75">
          <h4 className="text-sm font-semibold text-slate-800">Completed consultations ({completedEntries.length})</h4>
          <Table headers={['Queue No', 'Token', 'Patient Name', 'Called', 'Completed']}>
            {completedEntries.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 bg-slate-50/20">
                <td className="px-4 py-3 font-bold text-slate-500 text-sm">#{item.queue_number}</td>
                <td className="px-4 py-3 text-slate-400 text-xs font-semibold">Token {item.appointment?.token_number}</td>
                <td className="px-4 py-3 text-slate-655 text-sm">{item.appointment?.patient?.full_name}</td>
                <td className="px-4 py-3 text-slate-500 text-xs font-semibold">
                  {item.called_time ? new Date(item.called_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs font-semibold">
                  {item.completed_time ? new Date(item.completed_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
};
