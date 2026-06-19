import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import {
  Plus, User, RefreshCw, Search, Filter, X,
  Trash2, Power, Edit, AlertTriangle, AlertCircle, Info, CheckCircle, HelpCircle, Eye
} from 'lucide-react';
import './PatientsList.css';

export const PatientsList = () => {
  const [patients, setPatients] = useState([]);
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
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'PATIENT',
    hospital_id: '',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // View Patient Details
  const [viewOpen, setViewOpen] = useState(false);
  const [viewPat, setViewPat] = useState(null);

  const openViewModal = (pat) => {
    setViewPat(pat);
    setViewOpen(true);
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
      const [patientsData, hospitalsData] = await Promise.all([
        api.getUsers('PATIENT'),
        api.getHospitals()
      ]);
      setPatients(patientsData);
      setHospitals(hospitalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch patient accounts.');
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
      role: 'PATIENT',
      hospital_id: hospitals[0]?.id || '',
      is_active: true
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (pat) => {
    setFormData({
      full_name: pat.full_name,
      email: pat.email,
      phone: pat.phone || '',
      password: '', // blank password means no change
      role: 'PATIENT',
      hospital_id: pat.hospital?.id || '',
      is_active: pat.is_active
    });
    setFormErrors({});
    setSelectedPatientId(pat.id);
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
      role: 'PATIENT',
      hospital_id: formData.hospital_id || null,
      is_active: formData.is_active
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (isEditing) {
        await api.updateUser(selectedPatientId, payload);
        showToast('Patient information updated successfully.', 'success');
      } else {
        await api.createUser(payload);
        showToast('New patient account registered successfully.', 'success');
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save patient details.' });
      showToast(err.message || 'Failed to save patient details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivation = (pat) => {
    const isActivating = !pat.is_active;
    const actionWord = isActivating ? 'activate' : 'deactivate';
    setConfirmModal({
      isOpen: true,
      title: `${isActivating ? 'Activate' : 'Deactivate'} Patient Account`,
      message: `Are you sure you want to ${actionWord} the account of "${pat.full_name}"?`,
      confirmText: isActivating ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      type: isActivating ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          if (pat.is_active) {
            await api.deactivateUser(pat.id);
          } else {
            await api.activateUser(pat.id);
          }
          showToast(`Patient account ${isActivating ? 'activated' : 'deactivated'} successfully.`, 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to update activation status.', 'error');
        }
      }
    });
  };

  const handleDelete = (pat) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Patient Account',
      message: `Are you sure you want to permanently delete the patient account for "${pat.full_name}"? This action cannot be undone.`,
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteUser(pat.id);
          showToast('Patient account deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete patient account.', 'error');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Patient Accounts',
      message: 'Are you sure you want to permanently delete ALL patient accounts? This will remove all patient records and cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAllUsers('PATIENT');
          showToast('All patient accounts deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete all patient accounts.', 'error');
        }
      }
    });
  };

  // Local filtering logic
  const filteredPatients = patients.filter((pat) => {
    const matchesSearch =
      pat.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pat.phone && pat.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pat.hospital && `${pat.hospital.hospital_name} ${pat.hospital.branch_name}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && pat.is_active) ||
      (statusFilter === 'Inactive' && !pat.is_active);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredPatients.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const hospitalOptions = [
    { value: '', label: 'None (Independent)' },
    ...hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))
  ];

  return (
    <div className="patients-container">
      {/* Header card */}
      <div className="patients-header">
        <div className="patients-header-info">
          <div className="patients-header-icon">
            <User size={20} />
          </div>
          <div>
            <h2 className="patients-header-title">Registered Patients</h2>
            <p className="patients-header-subtitle">Access patient profile details, phone numbers, and status settings.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {patients.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="patients-delete-all-btn"
            >
              <Trash2 size={16} />
              <span>Delete All</span>
            </button>
          )}
          <button onClick={openAddModal} className="patients-register-btn">
            <Plus size={16} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar container */}
      <div className="patients-filters-container">
        <div className="patients-filters-left">
          <div className="patients-search-wrapper">
            <span className="patients-search-icon">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="patients-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="patients-search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="patients-status-wrapper">
            <span className="patients-status-icon">
              <Filter size={14} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="patients-status-select"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="patients-status-arrow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        <button onClick={fetchData} className="patients-refresh-btn">
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
        <div className="patients-loading-container">
          <div className="patients-loading-spinner"></div>
          <span className="patients-loading-text">Loading patients list...</span>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="patients-empty-container">
          <div className="patients-empty-icon-wrapper">
            <User size={24} />
          </div>
          <h3 className="patients-empty-title">No Patients Found</h3>
          <p className="patients-empty-subtitle">
            {searchTerm || statusFilter !== 'All'
              ? 'Try resetting the filters or modifying your search query.'
              : 'Add new patients to list them here.'}
          </p>
        </div>
      ) : (
        <div className="patients-table-card">
          <div className="patients-table-wrapper">
            <table className="patients-table">
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
              <tbody className="patients-tbody">
                {paginatedPatients.map((pat) => (
                  <tr key={pat.id}>
                    <td className="hospital-td col-info">
                      <div className="user-avatar-cell">
                        <div className="user-avatar-wrapper">
                          <User size={16} />
                        </div>
                        <span className="user-display-name">{pat.full_name}</span>
                      </div>
                    </td>
                    <td className="hospital-td col-email">
                      <span className="text-xs text-slate-600">{pat.email}</span>
                    </td>
                    <td className="hospital-td col-phone">
                      <span className="text-xs text-slate-600">{pat.phone || '-'}</span>
                    </td>
                    <td className="hospital-td col-hosp">
                      <span className="text-xs text-slate-600 font-medium">
                        {pat.hospital ? `${pat.hospital.hospital_name} (${pat.hospital.branch_name})` : 'Independent'}
                      </span>
                    </td>
                    <td className="hospital-td col-status">
                      <Badge variant={pat.is_active ? 'success' : 'warning'}>
                        {pat.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="hospital-td col-actions">
                      <div className="actions-wrapper">
                        {/* View Details Button */}
                        <button
                          onClick={() => openViewModal(pat)}
                          className="action-btn action-btn-view"
                          title="View Full Patient Profile"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(pat)}
                          className="action-btn action-btn-edit"
                          title="Edit Info"
                        >
                          <Edit size={13} />
                        </button>

                        {/* Activate/Deactivate Toggle Button */}
                        {pat.is_active ? (
                          <button
                            onClick={() => toggleActivation(pat)}
                            className="action-btn action-btn-deactivate"
                            title="Deactivate Account"
                          >
                            <Power size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleActivation(pat)}
                            className="action-btn action-btn-activate"
                            title="Activate Account"
                          >
                            <Power size={13} />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(pat)}
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
          {filteredPatients.length > 0 && (
            <div className="pagination-wrapper">
              <div className="flex items-center gap-4">
                <div className="pagination-info">
                  Showing <span className="pagination-info-highlight">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="pagination-info-highlight">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{' '}
                  of <span className="pagination-info-highlight">{totalItems}</span> patients
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
        title={isEditing ? 'Edit Patient Information' : 'Add New Patient'}
        icon={User}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <Input
            label="Full Name"
            name="full_name"
            placeholder="e.g. Ramesh Kumar"
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
            placeholder="e.g. ramesh.kumar@gmail.com"
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
              {isSaving ? 'Saving...' : 'Save Patient'}
            </Button>
          </FormActions>
        </Form>
      </Modal>

      {/* ─── View Patient Details Modal ───────────────────────── */}
      {viewOpen && viewPat && (
        <div className="vdm-overlay">
          <div className="vdm-card">
            {/* Header */}
            <div className="vdm-header">
              <div className="vdm-header-left">
                <div className="vdm-icon-wrap">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="vdm-title">{viewPat.full_name}</h3>
                  <p className="vdm-subtitle">Patient Full Profile Details</p>
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
                  {viewPat.patient_profile?.patient_code && (
                    <div className="vdm-item vdm-item-full">
                      <span className="vdm-label">Patient Registration Code</span>
                      <span className="vdm-value" style={{ fontFamily: 'monospace', letterSpacing: '0.05em', color: '#2e8b57', fontSize: '15px' }}>
                        {viewPat.patient_profile.patient_code}
                      </span>
                    </div>
                  )}
                  <div className="vdm-item">
                    <span className="vdm-label">Email Address</span>
                    <span className="vdm-value">{viewPat.email}</span>
                  </div>
                  <div className="vdm-item">
                    <span className="vdm-label">Phone Number</span>
                    <span className="vdm-value">{viewPat.phone || 'Not Provided'}</span>
                  </div>
                  <div className="vdm-item vdm-item-full">
                    <span className="vdm-label">Associated Hospital Branch</span>
                    <span className="vdm-value">
                      {viewPat.hospital ? `${viewPat.hospital.hospital_name} (${viewPat.hospital.branch_name})` : 'Independent'}
                    </span>
                  </div>
                  <div className="vdm-item">
                    <span className="vdm-label">Account Status</span>
                    <span className="vdm-value">
                      <span className={viewPat.is_active ? 'vdm-badge-completed' : 'vdm-badge-pending'}>
                        {viewPat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </span>
                  </div>
                  <div className="vdm-item">
                    <span className="vdm-label">Profile Status</span>
                    <span className="vdm-value">
                      <span className={viewPat.is_profile_completed ? 'vdm-badge-completed' : 'vdm-badge-pending'}>
                        {viewPat.is_profile_completed ? 'Completed' : 'Pending'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div className="vdm-section">
                <p className="vdm-section-title">
                  <Info size={14} /> Personal & Health Profile
                </p>
                {viewPat.is_profile_completed && viewPat.patient_profile ? (
                  <div className="vdm-grid">
                    <div className="vdm-item">
                      <span className="vdm-label">Gender</span>
                      <span className="vdm-value">{viewPat.patient_profile.gender || 'N/A'}</span>
                    </div>
                    <div className="vdm-item">
                      <span className="vdm-label">Date of Birth</span>
                      <span className="vdm-value">{viewPat.patient_profile.date_of_birth || 'N/A'}</span>
                    </div>
                    <div className="vdm-item">
                      <span className="vdm-label">Blood Group</span>
                      <span className="vdm-value">{viewPat.patient_profile.blood_group || 'N/A'}</span>
                    </div>
                    <div className="vdm-item">
                      <span className="vdm-label">Emergency Contact</span>
                      <span className="vdm-value">{viewPat.patient_profile.emergency_contact || 'N/A'}</span>
                    </div>
                    <div className="vdm-item vdm-item-full">
                      <span className="vdm-label">Residential Address</span>
                      <span className="vdm-value" style={{ fontWeight: 500, lineHeight: 1.4 }}>
                        {viewPat.patient_profile.address || 'N/A'}
                      </span>
                    </div>
                    <div className="vdm-item vdm-item-full">
                      <span className="vdm-label">Known Allergies</span>
                      <span className="vdm-value" style={{ color: viewPat.patient_profile.allergies?.toLowerCase() !== 'none' ? '#b91c1c' : '#0f172a' }}>
                        {viewPat.patient_profile.allergies || 'None'}
                      </span>
                    </div>
                    <div className="vdm-item vdm-item-full">
                      <span className="vdm-label">Chronic Medical History</span>
                      <span className="vdm-value">
                        {viewPat.patient_profile.medical_history || 'None'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '13.5px', color: '#64748b', fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '10px 0' }}>
                    Patient has not completed their health profile details yet.
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
