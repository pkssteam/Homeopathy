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
  Trash2, Power, Edit, AlertTriangle, AlertCircle, Info, CheckCircle, HelpCircle, Package
} from 'lucide-react';
import './InventoryRepsList.css';

export const InventoryRepsList = () => {
  const [reps, setReps] = useState([]);
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
  const [selectedRepId, setSelectedRepId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'INVENTORY_REP',
    hospital_id: '',
    is_active: true
  });
  
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
      const [repsData, hospitalsData] = await Promise.all([
        api.getUsers('INVENTORY_REP'),
        api.getHospitals()
      ]);
      setReps(repsData);
      setHospitals(hospitalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch inventory representatives.');
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
      role: 'INVENTORY_REP',
      hospital_id: hospitals[0]?.id || '',
      is_active: true
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (rep) => {
    setFormData({
      full_name: rep.full_name,
      email: rep.email,
      phone: rep.phone || '',
      password: '', // blank password means no change
      role: 'INVENTORY_REP',
      hospital_id: rep.hospital?.id || '',
      is_active: rep.is_active
    });
    setFormErrors({});
    setSelectedRepId(rep.id);
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
      role: 'INVENTORY_REP',
      hospital_id: formData.hospital_id || null,
      is_active: formData.is_active
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (isEditing) {
        await api.updateUser(selectedRepId, payload);
        showToast('Representative information updated successfully.', 'success');
      } else {
        await api.createUser(payload);
        showToast('New representative account registered successfully.', 'success');
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save representative details.' });
      showToast(err.message || 'Failed to save representative details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivation = (rep) => {
    const isActivating = !rep.is_active;
    const actionWord = isActivating ? 'activate' : 'deactivate';
    setConfirmModal({
      isOpen: true,
      title: `${isActivating ? 'Activate' : 'Deactivate'} Representative Account`,
      message: `Are you sure you want to ${actionWord} the account of "${rep.full_name}"?`,
      confirmText: isActivating ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      type: isActivating ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          if (rep.is_active) {
            await api.deactivateUser(rep.id);
          } else {
            await api.activateUser(rep.id);
          }
          showToast(`Representative account ${isActivating ? 'activated' : 'deactivated'} successfully.`, 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to update activation status.', 'error');
        }
      }
    });
  };

  const handleDelete = (rep) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Representative Account',
      message: `Are you sure you want to permanently delete the representative account for "${rep.full_name}"? This action cannot be undone.`,
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteUser(rep.id);
          showToast('Representative account deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete representative account.', 'error');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Representative Accounts',
      message: 'Are you sure you want to permanently delete ALL representative accounts? This will remove all representative records and cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAllUsers('INVENTORY_REP');
          showToast('All representative accounts deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete all representative accounts.', 'error');
        }
      }
    });
  };

  // Local filtering logic
  const filteredReps = reps.filter((rep) => {
    const matchesSearch = 
      rep.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.phone && rep.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rep.hospital && `${rep.hospital.hospital_name} ${rep.hospital.branch_name}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && rep.is_active) ||
      (statusFilter === 'Inactive' && !rep.is_active);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredReps.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedReps = filteredReps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const hospitalOptions = [
    { value: '', label: 'None (Independent)' },
    ...hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))
  ];

  return (
    <div className="reps-container">
      {/* Header card */}
      <div className="reps-header">
        <div className="reps-header-info">
          <div className="reps-header-icon">
            <Package size={20} />
          </div>
          <div>
            <h2 className="reps-header-title">Inventory Representatives</h2>
            <p className="reps-header-subtitle">Manage inventory reps, remedy supply roles, and clinical locations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {reps.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="reps-delete-all-btn"
            >
              <Trash2 size={16} />
              <span>Delete All</span>
            </button>
          )}
          <button onClick={openAddModal} className="reps-register-btn">
            <Plus size={16} />
            <span>Add Representative</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar container */}
      <div className="reps-filters-container">
        <div className="reps-filters-left">
          <div className="reps-search-wrapper">
            <span className="reps-search-icon">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, phone or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="reps-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="reps-search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="reps-status-wrapper">
            <span className="reps-status-icon">
              <Filter size={14} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="reps-status-select"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="reps-status-arrow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        <button onClick={fetchData} className="reps-refresh-btn">
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
        <div className="reps-loading-container">
          <div className="reps-loading-spinner"></div>
          <span className="reps-loading-text">Loading representatives list...</span>
        </div>
      ) : filteredReps.length === 0 ? (
        <div className="reps-empty-container">
          <div className="reps-empty-icon-wrapper">
            <Package size={24} />
          </div>
          <h3 className="reps-empty-title">No Representatives Found</h3>
          <p className="reps-empty-subtitle">
            {searchTerm || statusFilter !== 'All' 
              ? 'Try resetting the filters or modifying your search query.' 
              : 'Add new inventory representative credentials to list them here.'}
          </p>
        </div>
      ) : (
        <div className="reps-table-card">
          <div className="reps-table-wrapper">
            <table className="reps-table">
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
              <tbody className="reps-tbody">
                {paginatedReps.map((rep) => (
                  <tr key={rep.id}>
                    <td className="hospital-td col-info">
                      <div className="user-avatar-cell">
                        <div className="user-avatar-wrapper">
                          <User size={16} />
                        </div>
                        <span className="user-display-name">{rep.full_name}</span>
                      </div>
                    </td>
                    <td className="hospital-td col-email">
                      <span className="text-xs text-slate-600">{rep.email}</span>
                    </td>
                    <td className="hospital-td col-phone">
                      <span className="text-xs text-slate-600">{rep.phone || '-'}</span>
                    </td>
                    <td className="hospital-td col-hosp">
                      <span className="text-xs text-slate-600 font-medium">
                        {rep.hospital ? `${rep.hospital.hospital_name} (${rep.hospital.branch_name})` : 'Independent'}
                      </span>
                    </td>
                    <td className="hospital-td col-status">
                      <Badge variant={rep.is_active ? 'success' : 'warning'}>
                        {rep.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="hospital-td col-actions">
                      <div className="actions-wrapper">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(rep)}
                          className="action-btn action-btn-edit"
                          title="Edit Info"
                        >
                          <Edit size={13} />
                        </button>

                        {/* Activate/Deactivate Toggle Button */}
                        {rep.is_active ? (
                          <button
                            onClick={() => toggleActivation(rep)}
                            className="action-btn action-btn-deactivate"
                            title="Deactivate Account"
                          >
                            <Power size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleActivation(rep)}
                            className="action-btn action-btn-activate"
                            title="Activate Account"
                          >
                            <Power size={13} />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(rep)}
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
          {filteredReps.length > 0 && (
            <div className="pagination-wrapper">
              <div className="flex items-center gap-4">
                <div className="pagination-info">
                  Showing <span className="pagination-info-highlight">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="pagination-info-highlight">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{' '}
                  of <span className="pagination-info-highlight">{totalItems}</span> representatives
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
        title={isEditing ? 'Edit Representative Information' : 'Add New Representative'} 
        icon={Package}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <Input
            label="Full Name"
            name="full_name"
            placeholder="e.g. Anil Kapoor"
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
            placeholder="e.g. anil.kapoor@homeopathy.com"
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
              {isSaving ? 'Saving...' : 'Save Representative'}
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
