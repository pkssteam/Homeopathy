import React, { useState } from 'react';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card/Card';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import './SettingsPanel.css';

export const SettingsPanel = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccessMsg('Your password has been successfully updated in real-time.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <h2 className="settings-title">Hospital Portal Configuration</h2>
        <p className="settings-subtitle">Manage your account authentication preferences and system limits.</p>
      </div>

      <div className="settings-grid">
        {/* Reset Password Form Section */}
        <div className="settings-card-wrapper">
          <Card title="Change Security Password">
            <form onSubmit={handlePasswordChange} className="settings-form">
              <p className="settings-form-info">
                Enter your current security password to authenticate and update to a new one.
              </p>

              {errorMsg && (
                <div className="settings-alert error" role="alert">
                  <ShieldAlert size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="settings-alert success" role="alert">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="settings-field">
                <label htmlFor="current-pass">Current Password</label>
                <div className="settings-input-wrapper">
                  <KeyRound className="settings-input-icon" size={16} />
                  <input
                    id="current-pass"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setErrorMsg(''); }}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="new-pass">New Password</label>
                <div className="settings-input-wrapper">
                  <KeyRound className="settings-input-icon" size={16} />
                  <input
                    id="new-pass"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="confirm-pass">Confirm New Password</label>
                <div className="settings-input-wrapper">
                  <KeyRound className="settings-input-icon" size={16} />
                  <input
                    id="confirm-pass"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="settings-action-row">
                <button
                  type="submit"
                  className="settings-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="settings-spinner"></span>
                      Updating Credentials...
                    </>
                  ) : (
                    'Update Security Password'
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Informational Guidelines Card */}
        <div className="settings-info-panel">
          <Card title="Security Compliance Guidelines">
            <div className="settings-info-content">
              <div className="settings-info-item">
                <span className="bullet"></span>
                <div>
                  <h4>Real-Time Sync</h4>
                  <p>Password changes are processed and encrypted instantly on the MySQL server.</p>
                </div>
              </div>
              
              <div className="settings-info-item">
                <span className="bullet"></span>
                <div>
                  <h4>Session State</h4>
                  <p>Updating your password does not invalidate your active JWT session token immediately.</p>
                </div>
              </div>
              
              <div className="settings-info-item">
                <span className="bullet"></span>
                <div>
                  <h4>Department Restrictions</h4>
                  <p>Ensure you keep your departmental access coordinates confidential to maintain hospital security compliance.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
