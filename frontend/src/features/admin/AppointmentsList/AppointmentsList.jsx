import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { 
  Plus, Calendar, User, Search, RefreshCw, X, Edit, Power, Trash2, Check,
  AlertTriangle, AlertCircle, Info, CheckCircle, HelpCircle, Filter
} from 'lucide-react';
import './AppointmentsList.css';

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

export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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
  
  const [bookedSlots, setBookedSlots] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Toast Notification State
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
    type: 'warning' // 'warning', 'danger', 'success'
  });

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
      setHospitals(hospData);
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

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date) {
      api.getBookedSlots(formData.doctor_id, formData.appointment_date)
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
  }, [formData.doctor_id, formData.appointment_date]);

  const openAddModal = () => {
    const defaultHospitalId = hospitals[0]?.id || '';
    const hospitalDoctors = doctors.filter(d => d.hospital?.id === defaultHospitalId);
    setFormData({
      hospital_id: defaultHospitalId,
      patient_id: patients[0]?.id || '',
      doctor_id: hospitalDoctors[0]?.id || '',
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
        showToast('Appointment updated successfully.', 'success');
      } else {
        await api.createAppointment(payload);
        showToast('New appointment booked successfully.', 'success');
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save appointment.' });
      showToast(err.message || 'Failed to save appointment.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = (appt) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Appointment',
      message: `Are you sure you want to approve the appointment for "${appt.patient?.full_name}"? This will place them in the clinical queue.`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      type: 'success',
      onConfirm: async () => {
        try {
          await api.approveAppointment(appt.id);
          showToast('Appointment approved and queue token generated.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to approve appointment.', 'error');
        }
      }
    });
  };

  const handleCancel = (appt) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel the appointment slot for "${appt.patient?.full_name}"?`,
      confirmText: 'Cancel Appointment',
      cancelText: 'Keep Slot',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.cancelAppointment(appt.id);
          showToast('Appointment has been cancelled.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to cancel appointment.', 'error');
        }
      }
    });
  };

  const handleDelete = (appt) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Appointment Record',
      message: `Are you sure you want to permanently delete the appointment record for patient "${appt.patient?.full_name}"? This action cannot be undone.`,
      confirmText: 'Delete Record',
      cancelText: 'Keep Record',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAppointment(appt.id);
          showToast('Appointment record deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete appointment.', 'error');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Appointment Records',
      message: 'Are you sure you want to permanently delete ALL appointment records? This will remove all appointment slots and cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAllAppointments();
          showToast('All appointment records deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete all appointments.', 'error');
        }
      }
    });
  };

  // Pagination logic
  const totalItems = appointments.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedAppointments = appointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="appointments-container">
      {/* Header section */}
      <div className="appointments-header">
        <div className="appointments-header-info">
          <div className="appointments-header-icon">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="appointments-header-title">Appointments Registry</h2>
            <p className="appointments-header-subtitle">Manage patient booking status, token queuing, and scheduling.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {appointments.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="appointments-delete-all-btn"
            >
              <Trash2 size={16} />
              <span>Delete All</span>
            </button>
          )}
          <button onClick={openAddModal} className="appointments-register-btn">
            <Plus size={16} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Modernized filters bar */}
      <div className="appointments-filters-container">
        <div className="appointments-filters-left">
          <div className="appointments-date-wrapper">
            <input 
              type="date"
              name="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appointments-date-input"
            />
          </div>

          <div className="appointments-status-wrapper">
            <span className="appointments-status-icon">
              <Filter size={14} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appointments-status-select"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
            <span className="appointments-status-arrow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        <button onClick={fetchData} className="appointments-refresh-btn">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="appointments-loading-container">
          <div className="appointments-loading-spinner"></div>
          <span className="appointments-loading-text">Loading appointments registry...</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="appointments-empty-container">
          <div className="appointments-empty-icon-wrapper">
            <Calendar size={24} />
          </div>
          <h3 className="appointments-empty-title">No Appointments Booked</h3>
          <p className="appointments-empty-subtitle">
            {dateFilter || statusFilter 
              ? 'Try resetting the date or status filter.' 
              : 'Add new patient consultation appointments to list them here.'}
          </p>
        </div>
      ) : (
        <div className="appointments-table-card">
          <div className="appointments-table-wrapper">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th className="hospital-th col-token">TOKEN</th>
                  <th className="hospital-th col-patient">PATIENT</th>
                  <th className="hospital-th col-doctor">DOCTOR</th>
                  <th className="hospital-th col-datetime">DATE & TIME</th>
                  <th className="hospital-th col-reason">REASON FOR VISIT</th>
                  <th className="hospital-th col-bookedby">BOOKED BY</th>
                  <th className="hospital-th col-status">STATUS</th>
                  <th className="hospital-th col-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="appointments-tbody">
                {paginatedAppointments.map((appt) => {
                  let statusVariant = 'gray';
                  if (appt.status === 'Pending') statusVariant = 'warning';
                  else if (appt.status === 'Approved') statusVariant = 'success';
                  else if (appt.status === 'Cancelled') statusVariant = 'danger';
                  else if (appt.status === 'Completed') statusVariant = 'primary';

                  return (
                    <tr key={appt.id}>
                      <td className="hospital-td col-token">
                        <span className="token-badge">
                          {appt.token_number ? `#${appt.token_number}` : 'N/A'}
                        </span>
                      </td>
                      <td className="hospital-td col-patient">
                        <div className="patient-cell">
                          <div className="patient-avatar">
                            {appt.patient?.full_name?.charAt(0) || 'P'}
                          </div>
                          <span className="patient-name">{appt.patient?.full_name}</span>
                        </div>
                      </td>
                      <td className="hospital-td col-doctor">
                        <span className="text-xs font-medium text-slate-700">{appt.doctor?.full_name}</span>
                      </td>
                      <td className="hospital-td col-datetime">
                        <span className="text-xs font-semibold text-slate-750 block">{appt.appointment_date}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{appt.appointment_time}</span>
                      </td>
                      <td className="hospital-td col-reason">
                        <span className="text-xs text-slate-600 block truncate max-w-xs">{appt.reason || '-'}</span>
                      </td>
                      <td className="hospital-td col-bookedby">
                        {appt.created_by_detail ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700">{appt.created_by_detail.full_name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {appt.created_by_detail.role === 'ADMIN' ? 'Admin' :
                               appt.created_by_detail.role === 'DOCTOR' ? 'Doctor' : 'Patient'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-450 font-medium">System</span>
                        )}
                      </td>
                      <td className="hospital-td col-status">
                        <Badge variant={statusVariant}>
                          {appt.status}
                        </Badge>
                      </td>
                      <td className="hospital-td col-actions">
                        <div className="actions-wrapper">
                          {/* Approve Action */}
                          {appt.status === 'Pending' && (
                            <button
                              onClick={() => handleApprove(appt)}
                              className="action-btn action-btn-approve"
                              title="Approve Appointment"
                            >
                              <Check size={13} />
                            </button>
                          )}

                          {/* Cancel Action */}
                          {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancel(appt)}
                              className="action-btn action-btn-cancel"
                              title="Cancel Appointment"
                            >
                              <X size={13} />
                            </button>
                          )}

                          {/* Edit Action */}
                          <button
                            onClick={() => openEditModal(appt)}
                            className="action-btn action-btn-edit"
                            title="Edit Details"
                          >
                            <Edit size={13} />
                          </button>

                          {/* Delete Action */}
                          <button
                            onClick={() => handleDelete(appt)}
                            className="action-btn action-btn-delete"
                            title="Delete Appointment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {appointments.length > 0 && (
            <div className="pagination-wrapper">
              <div className="flex items-center gap-4">
                <div className="pagination-info">
                  Showing <span className="pagination-info-highlight">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="pagination-info-highlight">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{' '}
                  of <span className="pagination-info-highlight">{totalItems}</span> appointments
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-xs text-slate-350">|</span>
                  <span className="pagination-info">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="py-1 px-2 border border-slate-200 rounded text-xs bg-slate-50 text-slate-650 cursor-pointer focus:outline-none"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn pagination-nav-btn"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`pagination-btn ${currentPage === pg ? 'pagination-btn-active' : ''}`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn pagination-nav-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal and Form */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEditing ? 'Edit Appointment Details' : 'Book New Appointment'}
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
              label="Select Hospital Branch"
              name="hospital_id"
              value={formData.hospital_id}
              onChange={handleInputChange}
              options={hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))}
              error={formErrors.hospital_id}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <FormGroup>
            <Select
              label="Select Doctor"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleInputChange}
              options={
                doctors.filter(d => d.hospital?.id === formData.hospital_id).length > 0
                  ? doctors.filter(d => d.hospital?.id === formData.hospital_id).map(d => ({ value: d.id, label: d.full_name }))
                  : [{ value: '', label: 'No doctors in this branch' }]
              }
              error={formErrors.doctor_id}
              disabled={isSaving || doctors.filter(d => d.hospital?.id === formData.hospital_id).length === 0}
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

          {formData.doctor_id && formData.appointment_date && (
            <div className="admin-slots-section my-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Available Doctor Shifts & Slots (30 Min)</label>
              {(() => {
                const docObj = doctors.find(d => d.id === formData.doctor_id);
                if (!docObj) return null;
                const availTime = docObj.doctor_profile?.available_time;
                const slots = generateSlots(availTime);
                if (slots.length === 0) {
                  return (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-250">
                      No duty hours configured for this doctor.
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

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <div className="confirm-modal-header">
              <div className={`confirm-modal-icon-wrapper confirm-icon-${confirmModal.type}`}>
                {confirmModal.type === 'danger' ? (
                  <X size={20} />
                ) : confirmModal.type === 'warning' ? (
                  <AlertTriangle size={20} />
                ) : (
                  <CheckCircle size={20} />
                )}
              </div>
              <h3 className="confirm-modal-title">{confirmModal.title}</h3>
            </div>
            
            <div className="confirm-modal-body">
              <p>{confirmModal.message}</p>
            </div>
            
            <div className="confirm-modal-actions">
              <button 
                type="button" 
                className="confirm-btn-cancel" 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button 
                type="button" 
                className={`confirm-btn-action confirm-btn-${confirmModal.type}`}
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? (
                <CheckCircle size={16} />
              ) : toast.type === 'error' ? (
                <AlertCircle size={16} />
              ) : (
                <Info size={16} />
              )}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="toast-close-btn"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
