import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { RefreshCw, Calendar, Plus } from 'lucide-react';
import './DoctorAppointments.css';

// Helper to generate 30-minute slots dynamically
const generateSlots = (availableTimeStr) => {
  if (!availableTimeStr) return [];
  try {
    let slotsConfig = [];
    if (availableTimeStr.startsWith('[')) {
      slotsConfig = JSON.parse(availableTimeStr);
    } else {
      const parts = availableTimeStr.split(' to ');
      if (parts.length === 2) {
        slotsConfig = [{ start: parts[0], end: parts[1] }];
      } else {
        return [];
      }
    }

    const allSlots = [];
    slotsConfig.forEach(shift => {
      if (!shift.start || !shift.end) return;
      const [startH, startM] = shift.start.split(':').map(Number);
      const [endH, endM] = shift.end.split(':').map(Number);

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + 30 <= endMinutes) {
        const hh = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
        const mm = String(currentMinutes % 60).padStart(2, '0');
        allSlots.push(`${hh}:${mm}`);
        currentMinutes += 30;
      }
    });
    return allSlots;
  } catch (e) {
    console.error('Error generating slots:', e);
    return [];
  }
};

export const DoctorAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterToday, setFilterToday] = useState(true);

  // Booking Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '',
    reason: ''
  });

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

  const fetchPatients = async () => {
    try {
      const res = await api.getUsers('PATIENT');
      const activePatients = res.filter(p => p.is_active);
      setPatients(activePatients);
      if (activePatients.length > 0) {
        setFormData(prev => ({ ...prev, patient_id: activePatients[0].id }));
      }
    } catch (err) {
      console.error('Failed to load patients list:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterToday]);

  useEffect(() => {
    if (user?.id && formData.appointment_date) {
      api.getBookedSlots(user.id, formData.appointment_date)
        .then(res => {
          setBookedSlots(res.booked_slots || []);
        })
        .catch(err => {
          console.error(err);
          setBookedSlots([]);
        });
    } else {
      setBookedSlots([]);
    }
  }, [user?.id, formData.appointment_date]);

  const openAddModal = () => {
    fetchPatients();
    setFormData({
      patient_id: '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '',
      reason: ''
    });
    setFormErrors({});
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
      setFormErrors({ patient_id: 'Patient is required' });
      return;
    }
    if (!formData.appointment_date) {
      setFormErrors({ appointment_date: 'Date is required' });
      return;
    }
    if (!formData.appointment_time) {
      setFormErrors({ appointment_time: 'Time slot is required' });
      return;
    }

    setIsSaving(true);
    const payload = {
      hospital_id: user?.hospital_id || user?.hospital?.id || '',
      patient_id: formData.patient_id,
      doctor_id: user.id,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time.includes(':') && formData.appointment_time.split(':').length === 2 
        ? `${formData.appointment_time}:00` 
        : formData.appointment_time,
      reason: formData.reason,
      status: 'Pending'
    };

    try {
      await api.createAppointment(payload);
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to schedule appointment.' });
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="flex gap-2 items-center">
          <Button 
            size="md" 
            variant="medical"
            onClick={openAddModal}
            className="flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Book Appointment</span>
          </Button>
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

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Schedule Patient Appointment"
        icon={Calendar}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <FormGroup>
            <Select
              label="Select Patient"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleInputChange}
              options={patients.map(p => ({ value: p.id, label: p.full_name }))}
              error={formErrors.patient_id}
              disabled={isSaving}
              required
            />
            <Input
              label="Appointment Date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              error={formErrors.appointment_date}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Appointment Time"
              name="appointment_time"
              type="time"
              value={formData.appointment_time}
              onChange={handleInputChange}
              error={formErrors.appointment_time}
              disabled={isSaving}
              required
            />
          </FormGroup>

          {user?.id && formData.appointment_date && (
            <div className="doctor-slots-section my-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Your Available Shifts & Slots (30 Min)</label>
              {(() => {
                const availTime = user?.doctor_profile?.available_time;
                const slots = generateSlots(availTime);
                if (slots.length === 0) {
                  return (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-250">
                      No duty hours configured for your profile. Please update your timing slots in Profile setup.
                    </p>
                  );
                }
                return (
                  <div className="grid grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto pr-1">
                    {slots.map(slotTime => {
                      const isBooked = bookedSlots.includes(slotTime);
                      const isSelected = formData.appointment_time?.startsWith(slotTime);

                      let btnClass = "p-2 rounded text-xs font-bold border transition-all text-center ";
                      if (isBooked) {
                        btnClass += "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed";
                      } else if (isSelected) {
                        btnClass += "bg-blue-600 border-blue-600 text-white shadow-sm";
                      } else {
                        btnClass += "bg-white border-emerald-500 text-emerald-800 hover:bg-emerald-50 cursor-pointer";
                      }

                      return (
                        <button
                          key={slotTime}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setFormData({ ...formData, appointment_time: slotTime })}
                          className={btnClass}
                        >
                          <div>{slotTime}</div>
                          <div className={`text-[8px] mt-0.5 ${isBooked ? 'text-slate-400' : isSelected ? 'text-blue-100' : 'text-emerald-600'}`}>
                            {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          <Input
            label="Reason for Visit / Symptoms"
            name="reason"
            placeholder="e.g. Follow-up consultation"
            value={formData.reason}
            onChange={handleInputChange}
            disabled={isSaving}
          />

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSaving}>
              {isSaving ? 'Booking...' : 'Confirm Appointment'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  );
};
