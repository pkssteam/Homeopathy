import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Card } from '../../../components/ui/Card/Card';
import { Select } from '../../../components/ui/Select/Select';
import { Plus, Calendar, Clock } from 'lucide-react';
import './AppointmentsList.css';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);

  // Form states
  const [patientName, setPatientName] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [type, setType] = useState('Consultation');

  useEffect(() => {
    const fetchAppointmentsAndDoctors = async () => {
      try {
        const appointmentsData = await api.getAppointments();
        const doctorsData = await api.getDoctors();
        setAppointments(appointmentsData);
        setDoctors(doctorsData);
        if (doctorsData.length > 0) {
          setDoctorId(doctorsData[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointmentsAndDoctors();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!patientName || !doctorId) return;

    const selectedDoc = doctors.find(d => d.id.toString() === doctorId);
    const doctorName = selectedDoc ? selectedDoc.name : 'Unknown Doctor';

    const newApt = {
      patientName,
      doctorName,
      time,
      date: new Date().toISOString().split('T')[0],
      type,
    };

    try {
      const savedApt = await api.bookAppointment(newApt);
      setAppointments([...appointments, savedApt]);
      setPatientName('');
      setShowBookForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    let nextStatus = 'Scheduled';
    if (currentStatus === 'Scheduled') nextStatus = 'In Queue';
    else if (currentStatus === 'In Queue') nextStatus = 'Consulting';
    else if (currentStatus === 'Consulting') nextStatus = 'Completed';
    else return; // Completed remains completed

    try {
      const updated = await api.updateAppointmentStatus(id, nextStatus);
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading appointments schedule...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Appointments & Queue</h2>
          <p className="text-xs text-slate-500">Track active consultations, adjust patient queue status, and schedule visits.</p>
        </div>
        <Button size="md" variant="medical" onClick={() => setShowBookForm(!showBookForm)} className="flex items-center gap-1.5">
          <Plus size={16} />
          <span>Book Appointment</span>
        </Button>
      </div>

      {showBookForm && (
        <Card title="Book New Appointment Slot">
          <form onSubmit={handleBook} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input 
              label="Patient Name" 
              placeholder="e.g. Anita Sharma" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)} 
              required 
            />
            <Select
              label="Select Doctor"
              options={doctors.map(d => ({ value: d.id.toString(), label: `${d.name} (${d.specialty})` }))}
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            />
            <Input 
              label="Time Slot" 
              placeholder="e.g. 10:30 AM" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              required 
            />
            <Select 
              label="Appointment Type" 
              options={[
                { value: 'Consultation', label: 'Initial Consultation' },
                { value: 'Follow-Up', label: 'Follow-Up Visit' },
                { value: 'First Visit', label: 'First Visit' }
              ]}
              value={type} 
              onChange={(e) => setType(e.target.value)} 
            />
            <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowBookForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Confirm Booking</Button>
            </div>
          </form>
        </Card>
      )}

      <Table headers={['Apt ID', 'Patient Name', 'Assigned Doctor', 'Schedule Time', 'Date', 'Type', 'Queue Status', 'Actions']}>
        {appointments.map((apt) => (
          <tr key={apt.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{apt.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-800">{apt.patientName}</td>
            <td className="px-4 py-3 text-slate-700">{apt.doctorName}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1 text-slate-600 font-medium">
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
            <td className="px-4 py-3 text-slate-600">{apt.type}</td>
            <td className="px-4 py-3">
              <Badge variant={
                apt.status === 'Completed' ? 'success' :
                apt.status === 'Consulting' ? 'info' :
                apt.status === 'In Queue' ? 'warning' : 'gray'
              }>
                {apt.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              {apt.status !== 'Completed' ? (
                <Button size="sm" variant="secondary" onClick={() => handleStatusChange(apt.id, apt.status)}>
                  {apt.status === 'Scheduled' && 'Put In Queue'}
                  {apt.status === 'In Queue' && 'Start Consultation'}
                  {apt.status === 'Consulting' && 'Complete Visit'}
                </Button>
              ) : (
                <span className="text-xs text-green-600 font-semibold">Checked Out</span>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
