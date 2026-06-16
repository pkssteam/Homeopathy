import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { Plus, Calendar, User, Search, RefreshCw, Check, X } from 'lucide-react';
import './AppointmentsList.css';

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    hospital_id: '',
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    status: 'Pending'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;

      const [apptsData, hospData, patientsData, doctorsData] = await Promise.all([
        api.getAppointments(params),
        api.getHospitals(),
        api.getUsers('PATIENT'),
        api.getUsers('DOCTOR')
      ]);

      setAppointments(apptsData);
      setHospitals(hospData.filter(h => h.status === 'Active'));
      setPatients(patientsData.filter(p => p.is_active));
      setDoctors(doctorsData.filter(d => d.is_active));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load appointments data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, dateFilter]);

  const openAddModal = () => {
    setFormData({
      hospital_id: hospitals[0]?.id || '',
      patient_id: patients[0]?.id || '',
      doctor_id: doctors[0]?.id || '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '10:00',
      reason: '',
      status: 'Pending'
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (appt) => {
    setFormData({
      hospital_id: appt.hospital?.id || '',
      patient_id: appt.patient?.id || '',
      doctor_id: appt.doctor?.id || '',
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time.substring(0, 5),
      reason: appt.reason || '',
      status: appt.status
    });
    setFormErrors({});
    setSelectedApptId(appt.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.hospital_id) errors.hospital_id = 'Hospital is required';
    if (!formData.patient_id) errors.patient_id = 'Patient is required';
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
    const payload = {
      hospital_id: formData.hospital_id,
      patient_id: formData.patient_id,
      doctor_id: formData.doctor_id,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time.includes(':') && formData.appointment_time.split(':').length === 2 
        ? `${formData.appointment_time}:00` 
        : formData.appointment_time,
      reason: formData.reason,
      status: formData.status
    };

    try {
      if (isEditing) {
        await api.updateAppointment(selectedApptId, payload);
      } else {
        await api.createAppointment(payload);
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save appointment.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveAppointment(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to approve appointment.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to cancel appointment.');
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading appointments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Appointments Registry</h2>
          <p className="text-xs text-slate-500">Manage patient booking status, token queuing, and scheduling.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input 
            type="date"
            name="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40 py-1"
          />
          <Select
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Cancelled', label: 'Cancelled' },
              { value: 'Completed', label: 'Completed' }
            ]}
            className="w-36 py-1"
          />
          <Button size="md" variant="secondary" onClick={fetchData}>
            <RefreshCw size={14} />
          </Button>
          <Button size="md" variant="medical" onClick={openAddModal} className="flex items-center gap-1.5">
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

      {appointments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Calendar size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Appointments Booked</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters or click "Book Appointment" to add a new slot manually.
          </p>
        </div>
      ) : (
        <Table headers={['Token', 'Patient', 'Doctor', 'Date & Time', 'Reason', 'Status', 'Actions']}>
          {appointments.map((appt) => {
            let statusVariant = 'gray';
            if (appt.status === 'Pending') statusVariant = 'warning';
            else if (appt.status === 'Approved') statusVariant = 'success';
            else if (appt.status === 'Cancelled') statusVariant = 'danger';
            else if (appt.status === 'Completed') statusVariant = 'primary';

            return (
              <tr key={appt.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold text-slate-600 text-xs">
                  {appt.token_number ? `#${appt.token_number}` : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{appt.patient?.full_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 text-xs">
                  {appt.doctor?.full_name}
                </td>
                <td className="px-4 py-3 text-slate-650 text-xs">
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
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {appt.status === 'Pending' && (
                      <Button size="sm" variant="success" onClick={() => handleApprove(appt.id)} title="Approve">
                        <Check size={14} />
                      </Button>
                    )}
                    {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                      <Button size="sm" variant="danger" onClick={() => handleCancel(appt.id)} title="Cancel">
                        <X size={14} />
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => openEditModal(appt)}>
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}

      {/* Modal and Form */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEditing ? 'Edit Appointment' : 'Book New Appointment'}
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
            <Select
              label="Select Doctor"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleInputChange}
              options={doctors.map(d => ({ value: d.id, label: d.full_name }))}
              error={formErrors.doctor_id}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <FormGroup>
            <Select
              label="Select Hospital Branch"
              name="hospital_id"
              value={formData.hospital_id}
              onChange={handleInputChange}
              options={hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))}
              error={formErrors.hospital_id}
              disabled={isSaving}
              required
            />
            <Select
              label="Appointment Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Completed', label: 'Completed' }
              ]}
              disabled={isSaving}
            />
          </FormGroup>

          <FormGroup>
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

          <Input
            label="Reason for Visit / Symptoms"
            name="reason"
            placeholder="e.g. Constitutional consult, Joint pain"
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
