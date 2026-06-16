import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Card } from '../../../components/ui/Card/Card';
import { Plus, Clock, Calendar } from 'lucide-react';
import './AppointmentsList.css';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);

  // Form states
  const [doctorId, setDoctorId] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [type, setType] = useState('Consultation');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const apts = await api.getAppointments();
        const docs = await api.getDoctors();
        // Filter for Suresh Kumar
        const myApts = apts.filter(a => a.patientName.includes('Suresh Kumar'));
        setAppointments(myApts);
        setDoctors(docs);
        if (docs.length > 0) {
          setDoctorId(docs[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!doctorId) return;

    const selectedDoc = doctors.find(d => d.id.toString() === doctorId);
    const doctorName = selectedDoc ? selectedDoc.name : 'Unknown Doctor';

    const newApt = {
      patientName: 'Suresh Kumar',
      doctorName,
      time,
      date: new Date().toISOString().split('T')[0],
      type,
    };

    try {
      const savedApt = await api.bookAppointment(newApt);
      setAppointments([...appointments, savedApt]);
      setShowBookForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading appointment records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Appointments</h2>
          <p className="text-xs text-slate-500">Track checkup status, doctor schedules, and view consultation histories.</p>
        </div>
        <Button size="md" variant="medical" onClick={() => setShowBookForm(!showBookForm)} className="flex items-center gap-1.5">
          <Plus size={16} />
          <span>Book Consultation</span>
        </Button>
      </div>

      {showBookForm && (
        <Card title="Select Consultation Slot">
          <form onSubmit={handleBook} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select Doctor"
              options={doctors.map(d => ({ value: d.id.toString(), label: `${d.name} (${d.specialty})` }))}
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            />
            <Input 
              label="Preferred Time Slot" 
              placeholder="e.g. 10:30 AM" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              required 
            />
            <Select 
              label="Consultation Reason" 
              options={[
                { value: 'Consultation', label: 'General checkup' },
                { value: 'Follow-Up', label: 'Follow-up consultation' },
                { value: 'First Visit', label: 'Constitutional Treatment review' }
              ]}
              value={type} 
              onChange={(e) => setType(e.target.value)} 
            />
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowBookForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Confirm slot</Button>
            </div>
          </form>
        </Card>
      )}

      <Table headers={['Apt ID', 'Doctor Name', 'Schedule Time', 'Scheduled Date', 'Checkup Type', 'Queue Status']}>
        {appointments.map((apt) => (
          <tr key={apt.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{apt.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-800">{apt.doctorName}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1 text-slate-650 font-medium">
                <Clock size={14} className="text-slate-400" />
                <span>{apt.time}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                <span>{apt.date}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-650">{apt.type}</td>
            <td className="px-4 py-3">
              <Badge variant={
                apt.status === 'Completed' ? 'success' :
                apt.status === 'Consulting' ? 'info' :
                apt.status === 'In Queue' ? 'warning' : 'gray'
              }>
                {apt.status}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
