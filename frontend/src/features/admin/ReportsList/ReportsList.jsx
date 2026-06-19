import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Badge } from '../../../components/ui/Badge/Badge';
import { 
  FileText, ArrowUpRight, Award, TrendingUp, Trash2, X, CheckCircle, 
  AlertCircle, Info, AlertTriangle 
} from 'lucide-react';
import './ReportsList.css';

export const ReportsList = () => {
  const initialRemedies = [
    { rank: 1, name: 'Arnica Montana', dilutions: '200C, 30C', uses: 'Bruises, muscle soreness, joint swelling', prescribed: 45 },
    { rank: 2, name: 'Nux Vomica', dilutions: '30C, 200C', uses: 'Indigestion, stress, sleep issues', prescribed: 38 },
    { rank: 3, name: 'Belladonna', dilutions: '200C', uses: 'Sudden high fever, throbbing headaches', prescribed: 29 },
    { rank: 4, name: 'Thuja Occidentalis', dilutions: '1M, 200C', uses: 'Warts, skin tag growths, skin inflammation', prescribed: 22 }
  ];

  const [remedies, setRemedies] = useState(initialRemedies);
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Intelligence Reports',
      message: 'Are you sure you want to permanently clear all intelligence report data? This action cannot be undone.',
      confirmText: 'Clear Reports',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        setRemedies([]);
        showToast('All intelligence report data cleared successfully.', 'success');
      }
    });
  };

  return (
    <div className="reports-container">
      {/* Header section */}
      <div className="reports-header">
        <div>
          <h2 className="reports-header-title">Hospital Intelligence & Reports</h2>
          <p className="reports-header-subtitle">Analyze remedy dispensation metrics, physician workloads, and operational outputs.</p>
        </div>
        {remedies.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="reports-delete-all-btn"
          >
            <Trash2 size={16} />
            <span>Delete All</span>
          </button>
        )}
      </div>

      {/* Modernized Stats Cards Grid */}
      <div className="reports-stats-grid">
        <div className="reports-stat-card">
          <div>
            <span className="reports-stat-label">Monthly Consultations</span>
            <span className="reports-stat-value">{remedies.length > 0 ? '184 Cases' : '0 Cases'}</span>
            <span className="reports-stat-change change-up">↑ 12% vs last month</span>
          </div>
          <div className="reports-stat-icon-wrapper icon-blue">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="reports-stat-card">
          <div>
            <span className="reports-stat-label">Top Remedy Dilution</span>
            <span className="reports-stat-value">{remedies.length > 0 ? 'Arnica 200C' : 'N/A'}</span>
            <span className="reports-stat-change change-neutral">{remedies.length > 0 ? 'Prescribed 45 times' : 'No data'}</span>
          </div>
          <div className="reports-stat-icon-wrapper icon-orange">
            <Award size={20} />
          </div>
        </div>

        <div className="reports-stat-card">
          <div>
            <span className="reports-stat-label">Patient Discharge Rate</span>
            <span className="reports-stat-value">{remedies.length > 0 ? '94.8%' : '0%'}</span>
            <span className="reports-stat-change change-up">Excellent recovery reviews</span>
          </div>
          <div className="reports-stat-icon-wrapper icon-green">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>

      {/* Remedy Ranking Table Card */}
      <div className="reports-section-card">
        <h3 className="reports-section-title">Top Prescribed Homeopathy Remedies (This Month)</h3>
        
        <div className="reports-table-wrapper">
          {remedies.length > 0 ? (
            <table className="reports-table">
              <thead>
                <tr>
                  <th className="hospital-th col-rank">RANK</th>
                  <th className="hospital-th col-remedy">REMEDY NAME</th>
                  <th className="hospital-th col-dilution">COMMON DILUTIONS</th>
                  <th className="hospital-th col-uses">PRIMARY TREATMENT SCOPE</th>
                  <th className="hospital-th col-prescribed">PRESCRIBED CASES</th>
                </tr>
              </thead>
              <tbody className="reports-tbody">
                {remedies.map((rem) => {
                  let rankClass = 'rank-other';
                  if (rem.rank === 1) rankClass = 'rank-1';
                  else if (rem.rank === 2) rankClass = 'rank-2';

                  return (
                    <tr key={rem.rank}>
                      <td className="hospital-td col-rank">
                        <span className={`rank-badge ${rankClass}`}>
                          #{rem.rank}
                        </span>
                      </td>
                      <td className="hospital-td col-remedy">
                        <div className="remedy-cell">
                          <FileText size={14} className="text-slate-400" />
                          <span className="remedy-name">{rem.name}</span>
                        </div>
                      </td>
                      <td className="hospital-td col-dilution">
                        <span className="remedy-dilution-badge">{rem.dilutions}</span>
                      </td>
                      <td className="hospital-td col-uses">
                        <span className="remedy-uses-text">{rem.uses}</span>
                      </td>
                      <td className="hospital-td col-prescribed">
                        <span className="prescribed-count-badge">{rem.prescribed} times</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="reports-empty-state">
              <AlertTriangle size={32} className="text-slate-400 mb-2" />
              <p className="text-slate-500 font-semibold">No report data available.</p>
              <p className="text-xs text-slate-400 mt-1">Please prescribe remedies or wait for data updates.</p>
            </div>
          )}
        </div>
      </div>

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
