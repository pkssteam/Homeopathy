import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../services/api';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import './ProfileList.css';

export const ProfileList = () => {
  const { user, updateUserData } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await api.updateCurrentUser({ full_name: name, phone: phone });
      updateUserData(updatedUser);
      toast.success('Account profile details updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile details.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      toast.success('Your password has been successfully updated in real-time.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = getInitials(user?.full_name || user?.email);

  return (
    <div className="profile-page-wrapper animate-fade-in">
      
      {/* Profile Modern Hero Banner */}
      <div className="profile-hero-banner">
        <div className="profile-hero-content">
          <div className="profile-hero-avatar-wrapper">
            <div className="profile-hero-avatar">{initials}</div>
            <span className="profile-hero-status-dot"></span>
          </div>
          <div className="profile-hero-info">
            <div className="profile-hero-role-badge">
              <ShieldCheck size={12} />
              <span>{user?.role === 'INVENTORY_REP' ? 'Inventory Representative' : user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase()}</span>
            </div>
            <h2 className="profile-hero-name">{user?.full_name || 'Hospital Practitioner'}</h2>
            <p className="profile-hero-email">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Profile details form */}
        <div className="profile-card">
          <h3 className="profile-card-title">Personal Account Details</h3>
          <p className="profile-card-desc">Update your contact profile parameters registered within the hospital system.</p>
          
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="profile-field">
              <label htmlFor="profile-fullname">Full Name</label>
              <div className="profile-input-wrapper">
                <User className="profile-input-icon" size={16} />
                <input
                  id="profile-fullname"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Email Address</label>
              <div className="profile-input-wrapper disabled">
                <Mail className="profile-input-icon" size={16} />
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  disabled
                  title="Your registered email address cannot be changed."
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-phone">Contact Number</label>
              <div className="profile-input-wrapper">
                <Phone className="profile-input-icon" size={16} />
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter contact number"
                />
              </div>
            </div>

            <div className="profile-action-row">
              <button type="submit" className="profile-btn save-btn">
                <Check size={16} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change password card */}
        <div className="profile-card">
          <h3 className="profile-card-title">Security & Password Reset</h3>
          <p className="profile-card-desc">Update your credential signature for portal authentication in real-time.</p>
          
          <form onSubmit={handlePasswordChange} className="profile-form">
            <div className="profile-field">
              <label htmlFor="current-pass">Current Password</label>
              <div className="profile-input-wrapper">
                <Lock className="profile-input-icon" size={16} />
                <input
                  id="current-pass"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="profile-eye-toggle"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="new-pass">New Password</label>
              <div className="profile-input-wrapper">
                <Lock className="profile-input-icon" size={16} />
                <input
                  id="new-pass"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="profile-eye-toggle"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="confirm-pass">Confirm New Password</label>
              <div className="profile-input-wrapper">
                <Lock className="profile-input-icon" size={16} />
                <input
                  id="confirm-pass"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="profile-eye-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="profile-action-row">
              <button type="submit" className="profile-btn update-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="profile-spinner"></span>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Security Password</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
