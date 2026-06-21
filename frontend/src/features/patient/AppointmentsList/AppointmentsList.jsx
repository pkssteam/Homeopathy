import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { Calendar, Plus, RefreshCw, X } from 'lucide-react';
import './AppointmentsList.css';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    hospital_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '10:00',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [apptsData, hospData, doctorsData] = await Promise.all([
        api.getAppointments(),
        api.getHospitals(),
        api.getUsers('DOCTOR')
      ]);

      setAppointments(apptsData);
      setHospitals(hospData);
      setDoctors(doctorsData.filter(d => d.is_active));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load scheduling data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openBookModal = () => {
    const defaultHospitalId = hospitals[0]?.id || '';
    const hospitalDoctors = doctors.filter(d => d.hospital?.id === defaultHospitalId);
    setFormData({
      hospital_id: defaultHospitalId,
      doctor_id: hospitalDoctors[0]?.id || '',
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date default
      appointment_time: '10:00',
      reason: ''
    });
    setFormErrors({});
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'hospital_id') {
      const hospitalDoctors = doctors.filter(d => d.hospital?.id === value);
      setFormData({
        ...formData,
        hospital_id: value,
        doctor_id: hospitalDoctors[0]?.id || ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.hospital_id) errors.hospital_id = 'Hospital branch is required';
    if (!formData.doctor_id) errors.doctor_id = 'Doctor is required';
    if (!formData.appointment_date) errors.appointment_date = 'Date is required';
    if (!formData.appointment_time) errors.appointment_time = 'Time is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    // Grab current user ID for patient
    try {
      const me = await api.getCurrentUser();
      const payload = {
        hospital_id: formData.hospital_id,
        doctor_id: formData.doctor_id,
        patient_id: me.id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time.includes(':') && formData.appointment_time.split(':').length === 2 
          ? `${formData.appointment_time}:00` 
          : formData.appointment_time,
        reason: formData.reason,
        status: 'Pending'
      };

      await api.createAppointment(payload);
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to submit booking.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;
    try {
      await api.cancelAppointment(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to cancel appointment.');
    }
  };

  // Group appointments into Upcoming and Past History
  const upcomingAppts = appointments.filter(appt => {
    return appt.status === 'Pending' || appt.status === 'Approved';
  });

  const historyAppts = appointments.filter(appt => {
    return appt.status === 'Completed' || appt.status === 'Cancelled';
  });

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading appointment panel...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Consultation Bookings</h2>
          <p className="text-xs text-slate-500">Request consultation sessions, monitor queue tokens, and view treatment logs.</p>
        </div>
        <div className="flex gap-2">
          <Button size="md" variant="secondary" onClick={fetchData}>
            <RefreshCw size={14} />
          </Button>
          <Button size="md" variant="medical" onClick={openBookModal} className="flex items-center gap-1.5">
            <Plus size={16} />
            <span>Book Appointment</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Confirmed / Upcoming Queue Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Active / Upcoming Appointments</h3>
        
        {upcomingAppts.length === 0 ? (
          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
            No upcoming appointments scheduled. Click "Book Appointment" to schedule one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppts.map((appt) => {
              const isApproved = appt.status === 'Approved';
              return (
                <div key={appt.id} className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={isApproved ? 'success' : 'warning'}>
                        {appt.status}
                      </Badge>
                      {isApproved && appt.token_number && (
                        <span className="text-xs font-bold text-medical-600 bg-medical-50 px-2 py-0.5 border border-medical-250 rounded">
                          Token #{appt.token_number}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{appt.doctor?.full_name}</h4>
                      <p className="text-xs text-slate-500">{appt.hospital?.hospital_name} - {appt.hospital?.branch_name}</p>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Scheduled:</strong> {appt.appointment_date} @ {appt.appointment_time}
                    </div>
                    {appt.reason && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                        "{appt.reason}"
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleCancel(appt.id)} className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1">
                    <X size={12} />
                    <span>Cancel</span>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment History List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Consultation History</h3>
        
        {historyAppts.length === 0 ? (
          <p className="text-xs text-slate-500 bg-white border border-slate-200 p-4 rounded text-center">
            No past appointment history.
          </p>
        ) : (
          <Table headers={['Token', 'Doctor', 'Branch', 'Date', 'Reason', 'Status']}>
            {historyAppts.map((appt) => (
              <tr key={appt.id} className="hover:bg-slate-50/50 bg-slate-50/20">
                <td className="px-4 py-3 font-semibold text-slate-500 text-xs">
                  {appt.token_number ? `#${appt.token_number}` : '-'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700 text-sm">
                  {appt.doctor?.full_name}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {appt.hospital?.branch_name}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {appt.appointment_date}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-xs">
                  {appt.reason || '-'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={appt.status === 'Completed' ? 'primary' : 'danger'}>
                    {appt.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Request Consultation Booking"
        icon={Calendar}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <Select
            label="Clinic Branch"
            name="hospital_id"
            value={formData.hospital_id}
            onChange={handleInputChange}
            options={hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))}
            error={formErrors.hospital_id}
            disabled={isSaving}
            required
          />

          <Select
            label="Preferred Homeopathic Doctor"
            name="doctor_id"
            value={formData.doctor_id}
            onChange={handleInputChange}
            options={
              doctors.filter(d => d.hospital?.id === formData.hospital_id).length > 0
                ? doctors.filter(d => d.hospital?.id === formData.hospital_id).map(d => ({ value: d.id, label: `${d.full_name} (Homeopathy Practitioner)` }))
                : [{ value: '', label: 'No doctors available in this branch' }]
            }
            error={formErrors.doctor_id}
            disabled={isSaving || doctors.filter(d => d.hospital?.id === formData.hospital_id).length === 0}
            required
          />

          <FormGroup>
            <Input
              label="Requested Date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              error={formErrors.appointment_date}
              disabled={isSaving}
              required
            />
            <Input
              label="Preferred Time"
              name="appointment_time"
              type="time"
              value={formData.appointment_time}
              onChange={handleInputChange}
              error={formErrors.appointment_time}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <Input
            label="State Symptoms / Reason for Visit"
            name="reason"
            placeholder="e.g. Chronic asthma, digestion issues, migraine"
            value={formData.reason}
            onChange={handleInputChange}
            disabled={isSaving}
          />

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSaving}>
              {isSaving ? 'Submitting...' : 'Book Appointment'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  );
};
