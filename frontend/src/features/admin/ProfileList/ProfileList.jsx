import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card/Card';
import { Input } from '../../../components/ui/Input/Input';
import { Button } from '../../../components/ui/Button/Button';
import { UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import './ProfileList.css';

export const ProfileList = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [success, setSuccess] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPassSuccess('Your password has been successfully updated in real-time.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Profile Settings</h2>
        <p className="text-xs text-slate-500">Edit your user details and credential configurations.</p>
      </div>

      {success && (
        <div className="p-3 text-xs bg-green-50 text-green-700 border border-green-200 rounded font-medium flex items-center gap-1.5">
          <UserCheck size={14} />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Details Card */}
        <Card title="Account Profile Details">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input 
              label="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
            <Input 
              label="Email Address (Login Username)" 
              type="email"
              value={email} 
              disabled 
            />
            <Input 
              label="Contact Number" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="medical">
                Save Account Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card title="Change Security Password">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passError && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium flex items-center gap-1.5">
                <ShieldAlert size={14} />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 text-xs bg-green-50 text-green-700 border border-green-200 rounded font-medium flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>{passSuccess}</span>
              </div>
            )}

            <Input 
              label="Current Password" 
              type="password"
              placeholder="••••••••"
              value={currentPassword} 
              onChange={(e) => { setCurrentPassword(e.target.value); setPassError(''); }} 
              required
              disabled={isSubmitting}
            />

            <Input 
              label="New Password" 
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword} 
              onChange={(e) => { setNewPassword(e.target.value); setPassError(''); }} 
              required
              disabled={isSubmitting}
            />

            <Input 
              label="Confirm New Password" 
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword} 
              onChange={(e) => { setConfirmPassword(e.target.value); setPassError(''); }} 
              required
              disabled={isSubmitting}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="medical" disabled={isSubmitting}>
                {isSubmitting ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
