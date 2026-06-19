import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Select } from '../../../components/ui/Select/Select';
import { Input } from '../../../components/ui/Input/Input';
import {
  RefreshCw, Play, CheckCircle, PhoneCall, X, User, Filter, Calendar,
  Check, AlertCircle, Info, HelpCircle, Trash2, AlertTriangle, Edit
} from 'lucide-react';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import './QueueManagement.css';

export const QueueManagement = () => {
  const [queues, setQueues] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Queue Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQueueItem, setEditingQueueItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    queue_number: '',
    current_status: ''
  });

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

  // Toast Notification State
  const [toasts, setToasts] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { date: selectedDate };
      if (selectedDoctorId) params.doctor_id = selectedDoctorId;

      const [queueData, doctorsData] = await Promise.all([
        api.getQueue(params),
        api.getUsers('DOCTOR')
      ]);

      setQueues(queueData);
      setDoctors(doctorsData.filter(d => d.is_active));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load queue data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDoctorId, selectedDate]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDoctorId, selectedDate]);

  const handleCall = async (id) => {
    try {
      await api.callPatient(id);
      showToast('Patient has been called to the consultation booth.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to call patient.', 'error');
    }
  };

  const handleStartConsultation = async (id) => {
    try {
      await api.startConsultation(id);
      showToast('Consultation started successfully.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to start consultation.', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.completeQueue(id);
      showToast('Consultation completed successfully.', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to complete queue item.', 'error');
    }
  };

  const handleDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Queue Entry',
      message: `Are you sure you want to permanently delete the queue entry for patient "${item.appointment?.patient?.full_name}"? This action cannot be undone.`,
      confirmText: 'Delete Entry',
      cancelText: 'Keep Entry',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteQueue(item.id);
          showToast('Queue entry deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete queue entry.', 'error');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Queue Entries',
      message: 'Are you sure you want to permanently delete ALL active queue entries? This will clear the daily patient queue and cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAllQueue();
          showToast('All queue entries deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          console.error(err);
          showToast(err.message || 'Failed to delete all queue entries.', 'error');
        }
      }
    });
  };

  const handleEditClick = (item) => {
    setEditingQueueItem(item);
    setEditFormData({
      queue_number: item.queue_number,
      current_status: item.current_status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        queue_number: parseInt(editFormData.queue_number, 10),
        current_status: editFormData.current_status
      };
      await api.updateQueue(editingQueueItem.id, payload);
      showToast('Queue entry updated successfully.', 'success');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update queue entry.', 'error');
    }
  };

  // Pagination logic
  const totalItems = queues.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedQueues = queues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="queue-container">
      {/* Header section */}
      <div className="queue-header">
        <div className="queue-header-info">
          <div className="queue-header-icon">
            <PhoneCall size={20} />
          </div>
          <div>
            <h2 className="queue-header-title">Queue Management</h2>
            <p className="queue-header-subtitle">Monitor and regulate active waiting queues for clinic consultations.</p>
          </div>
        </div>
        {queues.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="queue-delete-all-btn"
          >
            <Trash2 size={16} />
            <span>Delete All</span>
          </button>
        )}
      </div>

      {/* Filter and Date selection bar */}
      <div className="queue-filters-container">
        <div className="queue-filters-left">
          <div className="queue-date-wrapper">
            <input
              type="date"
              name="selectedDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="queue-date-input"
            />
          </div>

          <div className="queue-doctor-wrapper">
            <span className="queue-doctor-icon">
              <Filter size={14} />
            </span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="queue-doctor-select"
            >
              <option value="">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
            <span className="queue-doctor-arrow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>

        <button onClick={fetchData} className="queue-refresh-btn">
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
        <div className="queue-loading-container">
          <div className="queue-loading-spinner"></div>
          <span className="queue-loading-text">Loading queue entries...</span>
        </div>
      ) : queues.length === 0 ? (
        <div className="queue-empty-container">
          <div className="queue-empty-icon-wrapper">
            <PhoneCall size={24} />
          </div>
          <h3 className="queue-empty-title">No Patients in Queue</h3>
          <p className="queue-empty-subtitle">
            Queue entries are created automatically when an appointment is approved.
          </p>
        </div>
      ) : (
        <div className="queue-table-card">
          <div className="queue-table-wrapper">
            <table className="queue-table">
              <thead>
                <tr>
                  <th className="hospital-th col-qno">QUEUE NO</th>
                  <th className="hospital-th col-token">TOKEN</th>
                  <th className="hospital-th col-patient">PATIENT NAME</th>
                  <th className="hospital-th col-doctor">ASSIGNED DOCTOR</th>
                  <th className="hospital-th col-status">STATUS</th>
                  <th className="hospital-th col-called">CALLED TIME</th>
                  <th className="hospital-th col-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="queue-tbody">
                {paginatedQueues.map((item) => {
                  let statusVariant = 'gray';
                  if (item.current_status === 'Waiting') statusVariant = 'warning';
                  else if (item.current_status === 'Called') statusVariant = 'info';
                  else if (item.current_status === 'In Progress') statusVariant = 'success';
                  else if (item.current_status === 'Completed') statusVariant = 'primary';

                  return (
                    <tr key={item.id}>
                      <td className="hospital-td col-qno">
                        <span className="qno-badge">
                          #{item.queue_number}
                        </span>
                      </td>
                      <td className="hospital-td col-token">
                        <span className="text-xs font-semibold text-slate-500">
                          {item.appointment?.token_number ? `Token ${item.appointment.token_number}` : 'N/A'}
                        </span>
                      </td>
                      <td className="hospital-td col-patient">
                        <div className="patient-cell">
                          <div className="patient-avatar">
                            {item.appointment?.patient?.full_name?.charAt(0) || 'P'}
                          </div>
                          <span className="patient-name">{item.appointment?.patient?.full_name}</span>
                        </div>
                      </td>
                      <td className="hospital-td col-doctor">
                        <span className="text-xs text-slate-700 font-medium">
                          {item.appointment?.doctor?.full_name}
                        </span>
                      </td>
                      <td className="hospital-td col-status">
                        <Badge variant={statusVariant}>
                          {item.current_status}
                        </Badge>
                      </td>
                      <td className="hospital-td col-called">
                        <span className="text-xs text-slate-500 font-semibold">
                          {item.called_time ? new Date(item.called_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>
                      <td className="hospital-td col-actions">
                        <div className="actions-wrapper">
                          {/* Call Button */}
                          {item.current_status === 'Waiting' && (
                            <button
                              onClick={() => handleCall(item.id)}
                              className="action-btn-styled action-call"
                              title="Call Patient"
                            >
                              <PhoneCall size={12} />
                              <span>Call</span>
                            </button>
                          )}

                          {/* Start Button */}
                          {item.current_status === 'Called' && (
                            <button
                              onClick={() => handleStartConsultation(item.id)}
                              className="action-btn-styled action-start"
                              title="Start Consultation"
                            >
                              <Play size={12} />
                              <span>Start</span>
                            </button>
                          )}

                          {/* Complete Button */}
                          {(item.current_status === 'Called' || item.current_status === 'In Progress') && (
                            <button
                              onClick={() => handleComplete(item.id)}
                              className="action-btn-styled action-complete"
                              title="Complete Consultation"
                            >
                              <CheckCircle size={12} />
                              <span>Complete</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(item)}
                            className="action-btn action-btn-edit"
                            title="Edit Queue Entry"
                          >
                            <Edit size={13} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(item)}
                            className="action-btn action-btn-delete"
                            title="Delete Queue Entry"
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
          {queues.length > 0 && (
            <div className="pagination-wrapper">
              <div className="flex items-center gap-4">
                <div className="pagination-info">
                  Showing <span className="pagination-info-highlight">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="pagination-info-highlight">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{' '}
                  of <span className="pagination-info-highlight">{totalItems}</span> queue entries
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

      {/* Edit Queue Entry Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Modify Queue Position & Status"
        >
          <Form onSubmit={handleEditSubmit}>
            <p className="text-xs text-slate-500 mb-4" style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: '1.4' }}>
              Adjust the patient's sequence in the daily consultation list or change their current live consultation status.
            </p>
            <FormGroup label="Patient">
              <Input
                type="text"
                value={editingQueueItem?.appointment?.patient?.full_name || ''}
                disabled
              />
            </FormGroup>

            <FormGroup label="Queue Position Number">
              <Input
                type="number"
                value={editFormData.queue_number}
                onChange={(e) => setEditFormData({ ...editFormData, queue_number: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup label="Queue Status">
              <Select
                value={editFormData.current_status}
                onChange={(e) => setEditFormData({ ...editFormData, current_status: e.target.value })}
                required
              >
                <option value="Waiting">Waiting</option>
                <option value="Called">Called</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Select>
            </FormGroup>

            <FormActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Queue
              </Button>
            </FormActions>
          </Form>
        </Modal>
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
