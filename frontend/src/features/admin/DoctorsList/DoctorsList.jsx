import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import {
  Plus, User, Stethoscope, RefreshCw, Search, Filter, X,
  Trash2, Power, Edit, AlertTriangle, AlertCircle, Info, CheckCircle, HelpCircle, Eye
} from 'lucide-react';
import './DoctorsList.css';

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'DOCTOR',
    hospital_id: '',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // View Doctor Details
  const [viewOpen, setViewOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [feeInput, setFeeInput] = useState('');
  const [updatingFee, setUpdatingFee] = useState(false);

  const openViewModal = (doc) => {
    setViewDoc(doc);
    setFeeInput(doc.doctor_profile?.consultation_fee ?? '0.00');
    setViewOpen(true);
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    if (!viewDoc?.doctor_profile?.id) {
      showToast('Doctor has not completed their profile yet. Fee cannot be set.', 'error');
      return;
    }
    const fee = parseFloat(feeInput);
    if (isNaN(fee) || fee < 0) {
      showToast('Please enter a valid fee amount.', 'error');
      return;
    }
    setUpdatingFee(true);
    try {
      const updated = await api.setDoctorConsultationFee(viewDoc.doctor_profile.id, fee);
      showToast('Consultation fee updated successfully.', 'success');
      // Update local doc copy
      setViewDoc(prev => ({ ...prev, doctor_profile: { ...prev.doctor_profile, consultation_fee: updated.consultation_fee } }));
      setDoctors(prev => prev.map(d => d.id === viewDoc.id
        ? { ...d, doctor_profile: { ...d.doctor_profile, consultation_fee: updated.consultation_fee } }
        : d
      ));
    } catch (err) {
      showToast(err.message || 'Failed to update consultation fee.', 'error');
    } finally {
      setUpdatingFee(false);
    }
  };

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
    onConfirm: () => { },
    type: 'warning' // 'warning', 'danger', 'success'
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [doctorsData, hospitalsData] = await Promise.all([
        api.getUsers('DOCTOR'),
        api.getHospitals()
      ]);
      setDoctors(doctorsData);
      setHospitals(hospitalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch doctor accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page to 1 when search or status filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const openAddModal = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role: 'DOCTOR',
      hospital_id: hospitals[0]?.id || '',
      is_active: true
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (doc) => {
    setFormData({
      full_name: doc.full_name,
      email: doc.email,
      phone: doc.phone || '',
      password: '', // blank password means no change
      role: 'DOCTOR',
      hospital_id: doc.hospital?.id || '',
      is_active: doc.is_active
    });
    setFormErrors({});
    setSelectedDoctorId(doc.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'is_active' ? value === 'true' : value;
    setFormData({ ...formData, [name]: val });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!isEditing && !formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone || null,
      role: 'DOCTOR',
      hospital_id: formData.hospital_id || null,
      is_active: formData.is_active
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (isEditing) {
        await api.updateUser(selectedDoctorId, payload);
        showToast('Doctor credentials updated successfully.', 'success');
      } else {
        await api.createUser(payload);
        showToast('New doctor account registered successfully.', 'success');
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save doctor details.' });
      showToast(err.message || 'Failed to save doctor details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivation = (doc) => {
    const isActivating = !doc.is_active;
    const actionWord = isActivating ? 'activate' : 'deactivate';
    setConfirmModal({
      isOpen: true,
      title: `${isActivating ? 'Activate' : 'Deactivate'} Doctor Account`,
      message: `Are you sure you want to ${actionWord} the account of "${doc.full_name}"?`,
      confirmText: isActivating ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      type: isActivating ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          if (doc.is_active) {
            await api.deactivateUser(doc.id);
          } else {
            await api.activateUser(doc.id);
          }
          showToast(`Doctor account ${isActivating ? 'activated' : 'deactivated'} successfully.`, 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to update activation status.', 'error');
        }
      }
    });
  };

  const handleDelete = (doc) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Doctor Account',
      message: `Are you sure you want to permanently delete the doctor account for "${doc.full_name}"? This action cannot be undone.`,
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteUser(doc.id);
          showToast('Doctor account deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete doctor account.', 'error');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Doctor Accounts',
      message: 'Are you sure you want to permanently delete ALL doctor accounts? This will remove all doctor records and cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAllUsers('DOCTOR');
          showToast('All doctor accounts deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete all doctor accounts.', 'error');
        }
      }
    });
  };

  // Local filtering logic
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.phone && doc.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.hospital && `${doc.hospital.hospital_name} ${doc.hospital.branch_name}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && doc.is_active) ||
      (statusFilter === 'Inactive' && !doc.is_active);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredDoctors.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const hospitalOptions = [
    { value: '', label: 'None (Independent)' },
    ...hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))
  ];

  return (
    <div className="doctors-container">
      {/* Header card */}
      <div className="doctors-header">
        <div className="doctors-header-info">
          <div className="doctors-header-icon">
            <Stethoscope size={20} />
          </div>
          <div>
            <h2 className="doctors-header-title">Medical Practitioners</h2>
            <p className="doctors-header-subtitle">Manage doctor credentials, clinical assignments, and active states.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {doctors.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="doctors-delete-all-btn"
            >
              <Trash2 size={16} />
              <span>Delete All</span>
            </button>
          )}
          <button onClick={openAddModal} className="doctors-register-btn">
            <Plus size={16} />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar container */}
      <div className="doctors-filters-container">
        <div className="doctors-filters-left">
          <div className="doctors-search-wrapper">
            <span className="doctors-search-icon">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="doctors-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="doctors-search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="doctors-status-wrapper">
            <span className="doctors-status-icon">
              <Filter size={14} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="doctors-status-select"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="doctors-status-arrow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        <button onClick={fetchData} className="doctors-refresh-btn">
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
        <div className="doctors-loading-container">
          <div className="doctors-loading-spinner"></div>
          <span className="doctors-loading-text">Loading doctors list...</span>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="doctors-empty-container">
          <div className="doctors-empty-icon-wrapper">
            <Stethoscope size={24} />
          </div>
          <h3 className="doctors-empty-title">No Doctors Found</h3>
          <p className="doctors-empty-subtitle">
            {searchTerm || statusFilter !== 'All'
              ? 'Try resetting the filters or modifying your search query.'
              : 'Add new clinical practitioner credentials to list them here.'}
          </p>
        </div>
      ) : (
        <div className="doctors-table-card">
          <div className="doctors-table-wrapper">
            <table className="doctors-table">
              <thead>
                <tr>
                  <th className="hospital-th col-info">FULL NAME</th>
                  <th className="hospital-th col-email">EMAIL ADDRESS</th>
                  <th className="hospital-th col-phone">PHONE NUMBER</th>
                  <th className="hospital-th col-hosp">ASSOCIATED HOSPITAL</th>
                  <th className="hospital-th col-status">STATUS</th>
                  <th className="hospital-th col-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="doctors-tbody">
                {paginatedDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td className="hospital-td col-info">
                      <div className="user-avatar-cell">
                        <div className="user-avatar-wrapper">
                          <User size={16} />
                        </div>
                        <span className="user-display-name">{doc.full_name}</span>
                      </div>
                    </td>
                    <td className="hospital-td col-email">
                      <span className="text-xs text-slate-600">{doc.email}</span>
                    </td>
                    <td className="hospital-td col-phone">
                      <span className="text-xs text-slate-600">{doc.phone || '-'}</span>
                    </td>
                    <td className="hospital-td col-hosp">
                      <span className="text-xs text-slate-600 font-medium">
                        {doc.hospital ? `${doc.hospital.hospital_name} (${doc.hospital.branch_name})` : 'Independent'}
                      </span>
                    </td>
                    <td className="hospital-td col-status">
                      <Badge variant={doc.is_active ? 'success' : 'warning'}>
                        {doc.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="hospital-td col-actions">
                      <div className="actions-wrapper">
                        {/* View Details Button */}
                        <button
                          onClick={() => openViewModal(doc)}
                          className="action-btn action-btn-view"
                          title="View Full Profile & Manage Fee"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(doc)}
                          className="action-btn action-btn-edit"
                          title="Edit Credentials"
                        >
                          <Edit size={13} />
                        </button>

                        {/* Activate/Deactivate Toggle Button */}
                        {doc.is_active ? (
                          <button
                            onClick={() => toggleActivation(doc)}
                            className="action-btn action-btn-deactivate"
                            title="Deactivate Account"
                          >
                            <Power size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleActivation(doc)}
                            className="action-btn action-btn-activate"
                            title="Activate Account"
                          >
                            <Power size={13} />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(doc)}
                          className="action-btn action-btn-delete"
                          title="Delete Account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredDoctors.length > 0 && (
            <div className="pagination-wrapper">
              <div className="flex items-center gap-4">
                <div className="pagination-info">
                  Showing <span className="pagination-info-highlight">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="pagination-info-highlight">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{' '}
                  of <span className="pagination-info-highlight">{totalItems}</span> practitioners
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
                    className="py-1 px-2 border border-slate-200 rounded text-xs bg-slate-50 text-slate-650 cursor-pointer focus:outline-none focus:border-medical-500"
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEditing ? 'Edit Doctor Account' : 'Add New Doctor Account'}
        icon={Stethoscope}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <Input
            label="Full Name"
            name="full_name"
            placeholder="e.g. Dr. Rajesh Sharma"
            value={formData.full_name}
            onChange={handleInputChange}
            error={formErrors.full_name}
            disabled={isSaving}
            required
          />

          <Input
            label="Email Address (Username)"
            name="email"
            type="email"
            placeholder="e.g. rajesh.sharma@homeopathy.com"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            disabled={isSaving}
            required
          />

          <FormGroup>
            <Input
              label="Contact Phone"
              name="phone"
              placeholder="e.g. +91 99887 76655"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isSaving}
            />
            <Input
              label={isEditing ? "Change Password (Optional)" : "Password"}
              name="password"
              type="password"
              placeholder={isEditing ? "Leave blank to keep same" : "Minimum 6 characters"}
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              disabled={isSaving}
              required={!isEditing}
            />
          </FormGroup>

          <FormGroup>
            <Select
              label="Associated Hospital Branch"
              name="hospital_id"
              value={formData.hospital_id}
              onChange={handleInputChange}
              options={hospitalOptions}
              disabled={isSaving}
            />
            <Select
              label="Account State"
              name="is_active"
              value={formData.is_active.toString()}
              onChange={handleInputChange}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
              ]}
              disabled={isSaving}
            />
          </FormGroup>

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Account'}
            </Button>
          </FormActions>
        </Form>
      </Modal>

      {/* ─── View Doctor Details Modal ─────────────────────────────── */}
      {viewOpen && viewDoc && (
        <div className="vdm-overlay">
          <div className="vdm-card">
            {/* Header */}
            <div className="vdm-header">
              <div className="vdm-header-left">
                <div className="vdm-icon-wrap">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h3 className="vdm-title">{viewDoc.full_name}</h3>
                  <p className="vdm-subtitle">Doctor Full Profile Details</p>
                </div>
              </div>
              <button onClick={() => setViewOpen(false)} className="vdm-close-btn" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <div className="vdm-body">
              {/* Account Details */}
              <div className="vdm-section">
                <p className="vdm-section-title">
                  <User size={14} /> Account Information
                </p>
                <div className="vdm-grid">
                  <div className="vdm-item">
                    <span className="vdm-label">Email Address</span>
                    <span className="vdm-value">{viewDoc.email}</span>
                  </div>
                  <div className="vdm-item">
                    <span className="vdm-label">Phone Number</span>
                    <span className="vdm-value">{viewDoc.phone || 'Not Provided'}</span>
                  </div>
                  <div className="vdm-item vdm-item-full">
                    <span className="vdm-label">Associated Hospital Branch</span>
                    <span className="vdm-value">
                      {viewDoc.hospital ? `${viewDoc.hospital.hospital_name} (${viewDoc.hospital.branch_name})` : 'Independent'}
                    </span>
                  </div>
                  <div className="vdm-item">
                    <span className="vdm-label">Account Status</span>
                    <span className="vdm-value">
                      <span className={viewDoc.is_active ? 'vdm-badge-completed' : 'vdm-badge-pending'}>
                        {viewDoc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </span>
                  </div>
                  <div className="vdm-item">
                    <span className="vdm-label">Profile Completion Status</span>
                    <span className="vdm-value">
                      <span className={viewDoc.is_profile_completed ? 'vdm-badge-completed' : 'vdm-badge-pending'}>
                        {viewDoc.is_profile_completed ? 'Completed' : 'Pending'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Profile */}
              <div className="vdm-section">
                <p className="vdm-section-title">
                  <Stethoscope size={14} /> Clinical Profile
                </p>
                {viewDoc.is_profile_completed && viewDoc.doctor_profile ? (
                  <div className="vdm-grid">
                    <div className="vdm-item">
                      <span className="vdm-label">Specialization</span>
                      <span className="vdm-value">{viewDoc.doctor_profile.specialization || 'N/A'}</span>
                    </div>
                    <div className="vdm-item">
                      <span className="vdm-label">Qualification</span>
                      <span className="vdm-value">{viewDoc.doctor_profile.qualification || 'N/A'}</span>
                    </div>
                    <div className="vdm-item">
                      <span className="vdm-label">Years of Experience</span>
                      <span className="vdm-value">
                        {viewDoc.doctor_profile.experience_years ? `${viewDoc.doctor_profile.experience_years} Years` : 'N/A'}
                      </span>
                    </div>
                    <div className="vdm-item">
                      <span className="vdm-label">Current Consultation Fee</span>
                      <span className="vdm-value" style={{ color: '#2e8b57' }}>
                        ₹{viewDoc.doctor_profile.consultation_fee ?? '0.00'}
                      </span>
                    </div>
                    <div className="vdm-item vdm-item-full">
                      <span className="vdm-label">Available Days</span>
                      <span className="vdm-value">{viewDoc.doctor_profile.available_days || 'N/A'}</span>
                    </div>
                    <div className="vdm-item vdm-item-full">
                      <span className="vdm-label">Consultation Timing Hours</span>
                      <span className="vdm-value">
                        {viewDoc.doctor_profile.available_time_start
                          ? `${viewDoc.doctor_profile.available_time_start} to ${viewDoc.doctor_profile.available_time_end}`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '13.5px', color: '#64748b', fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '10px 0' }}>
                    Practitioner has not completed their clinical profile details yet.
                  </p>
                )}
              </div>

              {/* Consultation Fee Management */}
              <div className="vdm-fee-section">
                <p className="vdm-fee-title">💰 Consultation Fee Management</p>
                <p className="vdm-fee-desc">
                  Set or adjust the practitioner consultation fee. Doctors cannot change this rate on their own.
                </p>
                <form onSubmit={handleUpdateFee} className="vdm-fee-form">
                  <div className="vdm-fee-input-wrap">
                    <span className="vdm-label" style={{ color: '#166534', fontWeight: 600 }}>Fee Amount (₹)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      disabled={updatingFee || !viewDoc.is_profile_completed}
                      className="vdm-fee-input"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingFee || !viewDoc.is_profile_completed}
                    className="vdm-fee-btn"
                  >
                    {updatingFee ? 'Saving...' : 'Update Fee'}
                  </button>
                </form>
                {!viewDoc.is_profile_completed && (
                  <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', margin: '8px 0 0 0' }}>
                    ⚠️ Set fee is disabled until the doctor completes their profile first.
                  </p>
                )}
              </div>
            </div>

            <div className="vdm-footer">
              <button type="button" className="vdm-close-action-btn" onClick={() => setViewOpen(false)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <div className="confirm-modal-header">
              <div className={`confirm-modal-icon-wrapper confirm-icon-${confirmModal.type}`}>
                {confirmModal.type === 'danger' ? (
                  <Trash2 size={20} />
                ) : confirmModal.type === 'warning' ? (
                  <AlertTriangle size={20} />
                ) : (
                  <HelpCircle size={20} />
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
