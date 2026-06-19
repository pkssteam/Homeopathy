import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { Plus, Building, Edit, RefreshCw, Search, Filter, X, MapPin, Phone, Mail, CheckCircle, XCircle, Trash2, Power, AlertTriangle, HelpCircle, AlertCircle, Info } from 'lucide-react';
import './HospitalsList.css';

export const HospitalsList = () => {
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
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    hospital_code: '',
    hospital_name: '',
    branch_name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    contact_number: '',
    email: '',
    status: 'Active'
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

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getHospitals();
      setHospitals(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch hospitals list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Reset page to 1 when search or status filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const openAddModal = () => {
    setFormData({
      hospital_code: '',
      hospital_name: '',
      branch_name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      contact_number: '',
      email: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (hosp) => {
    setFormData({
      hospital_code: hosp.hospital_code,
      hospital_name: hosp.hospital_name,
      branch_name: hosp.branch_name,
      address: hosp.address,
      city: hosp.city,
      state: hosp.state,
      country: hosp.country,
      postal_code: hosp.postal_code,
      contact_number: hosp.contact_number,
      email: hosp.email,
      status: hosp.status
    });
    setFormErrors({});
    setSelectedHospitalId(hosp.id);
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
    if (!formData.hospital_code.trim()) errors.hospital_code = 'Hospital code is required';
    if (!formData.hospital_name.trim()) errors.hospital_name = 'Hospital name is required';
    if (!formData.branch_name.trim()) errors.branch_name = 'Branch name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.contact_number.trim()) errors.contact_number = 'Contact number is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (isEditing) {
        await api.updateHospital(selectedHospitalId, formData);
        showToast('Hospital location updated successfully.', 'success');
      } else {
        await api.createHospital(formData);
        showToast('New hospital branch registered successfully.', 'success');
      }
      setIsOpen(false);
      fetchHospitals();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save hospital details.' });
      showToast(err.message || 'Failed to save hospital details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = (hosp) => {
    const isActivating = hosp.status !== 'Active';
    const actionWord = isActivating ? 'activate' : 'deactivate';
    setConfirmModal({
      isOpen: true,
      title: `${isActivating ? 'Activate' : 'Deactivate'} Hospital Location`,
      message: `Are you sure you want to ${actionWord} the "${hosp.hospital_name} (${hosp.branch_name})" location?`,
      confirmText: isActivating ? 'Activate' : 'Deactivate',
      cancelText: 'Cancel',
      type: isActivating ? 'success' : 'warning',
      onConfirm: async () => {
        const newStatus = isActivating ? 'Active' : 'Inactive';
        try {
          await api.patchHospital(hosp.id, { status: newStatus });
          showToast(`Hospital location ${isActivating ? 'activated' : 'deactivated'} successfully.`, 'success');
          fetchHospitals();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to update status.', 'error');
        }
      }
    });
  };

  const handleDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Hospital Location',
      message: `Are you sure you want to permanently delete the "${name}" hospital location? This action cannot be undone.`,
      confirmText: 'Delete Location',
      cancelText: 'Keep Location',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteHospital(id);
          showToast('Hospital location deleted successfully.', 'success');
          fetchHospitals();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete hospital.', 'error');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Hospital Locations',
      message: 'Are you sure you want to permanently delete ALL hospital locations? This will remove all branch data and cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAllHospitals();
          showToast('All hospital locations deleted successfully.', 'success');
          fetchHospitals();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete all hospitals.', 'error');
        }
      }
    });
  };

  // Local filtering logic
  const filteredHospitals = hospitals.filter((hosp) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesStatus = statusFilter === 'All' || hosp.status === statusFilter;

    if (!term) return matchesStatus;

    const matchesSearch =
      (hosp.hospital_code || '').toLowerCase().includes(term) ||
      (hosp.hospital_name || '').toLowerCase().includes(term) ||
      (hosp.branch_name || '').toLowerCase().includes(term) ||
      (hosp.address || '').toLowerCase().includes(term) ||
      (hosp.city || '').toLowerCase().includes(term) ||
      (hosp.state || '').toLowerCase().includes(term) ||
      (hosp.contact_number || '').toLowerCase().includes(term) ||
      (hosp.email || '').toLowerCase().includes(term);

    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
  };

  // Pagination calculations
  const totalItems = filteredHospitals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHospitals.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="hospitals-container">
      {/* Header section with page title & register button */}
      <div className="hospitals-header">
        <div className="hospitals-header-info">
          <div className="hospitals-header-icon">
            <Building size={20} />
          </div>
          <div>
            <h2 className="hospitals-header-title">Hospital Locations</h2>
            <p className="hospitals-header-subtitle">Manage homeopathy branches, registered locations, and contact details.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hospitals.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="hospitals-delete-all-btn"
            >
              <Trash2 size={16} />
              <span>Delete All</span>
            </button>
          )}
          <button
            onClick={openAddModal}
            className="hospitals-register-btn"
          >
            <Plus size={16} />
            <span>Register Branch</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="hospitals-error-banner">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {/* Modernized Search & Filters Bar */}
      <div className="hospitals-filters-container">
        <div className="hospitals-filters-left">
          {/* Search bar input container */}
          <div className="hospitals-search-wrapper">
            <span className="hospitals-search-icon">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name, branch, code or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hospitals-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="hospitals-search-clear"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status select dropdown */}
          <div className="hospitals-status-wrapper">
            <span className="hospitals-status-icon">
              <Filter size={14} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hospitals-status-select"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="hospitals-status-arrow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Action Button: Refresh */}
        <div className="hospitals-refresh-wrapper">
          <button
            onClick={fetchHospitals}
            disabled={loading}
            className="hospitals-refresh-btn"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Section or Empty States */}
      {loading && hospitals.length === 0 ? (
        <div className="hospitals-loading-container">
          <div className="hospitals-spinner"></div>
          <span className="hospitals-loading-text">Loading hospital records...</span>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="hospitals-empty-container">
          <div className="hospitals-empty-icon-wrapper">
            <Building size={26} />
          </div>
          <div>
            <h3 className="hospitals-empty-title">No Hospitals Registered</h3>
            <p className="hospitals-empty-subtitle">
              Click the "Register Branch" button above to add your first clinic or hospital location to the system.
            </p>
          </div>
          <button onClick={openAddModal} className="hospitals-register-btn">
            <Plus size={16} />
            <span>Register Branch</span>
          </button>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="hospitals-empty-container">
          <div className="hospitals-empty-icon-wrapper">
            <Search size={24} />
          </div>
          <div>
            <h3 className="hospitals-empty-title">No Search Results</h3>
            <p className="hospitals-empty-subtitle">
              We couldn't find any locations matching your search query. Try typing something else or clear filters.
            </p>
          </div>
          <button onClick={clearFilters} className="hospitals-refresh-btn">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="hospital-table-wrapper">
          <div className="w-full overflow-x-auto">
            <table className="hospital-table">
              <thead>
                <tr>
                  <th className="hospital-th col-code">Code</th>
                  <th className="hospital-th col-info">Hospital & Branch</th>
                  <th className="hospital-th col-loc">Location</th>
                  <th className="hospital-th col-contact">Contact</th>
                  <th className="hospital-th col-status">Status</th>
                  <th className="hospital-th col-actions">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {currentItems.map((hosp) => (
                  <tr key={hosp.id} className="hospital-tr">
                    <td className="hospital-td col-code">
                      <span className="code-badge">
                        {hosp.hospital_code}
                      </span>
                    </td>
                    <td className="hospital-td col-info">
                      <div>
                        <span
                          className="hospital-text-title"
                          onClick={() => openEditModal(hosp)}
                        >
                          {hosp.hospital_name}
                        </span>
                        <span className="hospital-text-branch">
                          {hosp.branch_name}
                        </span>
                      </div>
                    </td>
                    <td className="hospital-td col-loc">
                      <div className="location-cell">

                        <div>
                          <span className="location-city">{hosp.city}, {hosp.state}</span>
                          <span className="location-address" title={hosp.address}>
                            {hosp.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="hospital-td col-contact">
                      <div className="contact-cell">
                        <div className="contact-item">
                          <Phone size={12} className="contact-icon" />
                          <span>{hosp.contact_number}</span>
                        </div>
                        <div className="contact-item">
                          <Mail size={12} className="contact-icon" />
                          <span className="contact-subtext" title={hosp.email}>{hosp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hospital-td col-status">
                      <Badge variant={hosp.status === 'Active' ? 'success' : 'warning'}>
                        {hosp.status}
                      </Badge>
                    </td>
                    <td className="hospital-td col-actions">
                      <div className="actions-wrapper">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(hosp)}
                          className="action-btn action-btn-edit"
                          title="Edit Details"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Activate/Deactivate Button */}
                        {hosp.status === 'Active' ? (
                          <button
                            onClick={() => toggleStatus(hosp)}
                            className="action-btn action-btn-deactivate"
                            title="Deactivate Location"
                          >
                            <Power size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatus(hosp)}
                            className="action-btn action-btn-activate"
                            title="Activate Location"
                          >
                            <Power size={14} />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(hosp.id, hosp.hospital_name)}
                          className="action-btn action-btn-delete"
                          title="Delete Location"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredHospitals.length > 0 && (
            <div className="pagination-wrapper">
              {/* Items Per Page Select */}
              <div className="flex items-center gap-4">
                <div className="pagination-info">
                  Showing <span className="pagination-info-highlight">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="pagination-info-highlight">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{' '}
                  of <span className="pagination-info-highlight">{totalItems}</span> locations
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-xs text-slate-300">|</span>
                  <span className="pagination-info">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="pagination-select"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="pagination-info">rows</span>
                </div>
              </div>

              <div className="pagination-nav">
                {/* Previous Page Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-nav-btn"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-page-btn ${currentPage === page
                      ? 'pagination-page-btn-active'
                      : 'pagination-page-btn-inactive'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Page Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-nav-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reusable Modal Component */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEditing ? 'Edit Hospital Location' : 'Register New Hospital Branch'}
        icon={Building}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <FormGroup>
            <Input
              label="Hospital Code"
              name="hospital_code"
              placeholder="e.g. HMC-01"
              value={formData.hospital_code}
              onChange={handleInputChange}
              error={formErrors.hospital_code}
              disabled={isSaving}
              required
            />
            <Input
              label="Hospital Name"
              name="hospital_name"
              placeholder="e.g. Homeopathy Medical Center"
              value={formData.hospital_name}
              onChange={handleInputChange}
              error={formErrors.hospital_name}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Branch Name"
              name="branch_name"
              placeholder="e.g. Central Clinic / South Wing"
              value={formData.branch_name}
              onChange={handleInputChange}
              error={formErrors.branch_name}
              disabled={isSaving}
              required
            />
            <Input
              label="Contact Phone"
              name="contact_number"
              placeholder="e.g. +91 98765 43210"
              value={formData.contact_number}
              onChange={handleInputChange}
              error={formErrors.contact_number}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. contact@branch.com"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              disabled={isSaving}
              required
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
              disabled={isSaving}
            />
          </FormGroup>

          <Input
            label="Full Street Address"
            name="address"
            placeholder="e.g. 123 Health Ave, Suite 400"
            value={formData.address}
            onChange={handleInputChange}
            error={formErrors.address}
            disabled={isSaving}
            required
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="City"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleInputChange}
              error={formErrors.city}
              disabled={isSaving}
              required
            />
            <Input
              label="State"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleInputChange}
              error={formErrors.state}
              disabled={isSaving}
              required
            />
            <Input
              label="Country"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleInputChange}
              disabled={isSaving}
              required
            />
            <Input
              label="Postal Code"
              name="postal_code"
              placeholder="PIN/Zip"
              value={formData.postal_code}
              onChange={handleInputChange}
              disabled={isSaving}
            />
          </div>

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Location'}
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
