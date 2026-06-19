import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';
import { UserCheck, Loader, Stethoscope, User } from 'lucide-react';
import './ProfileCompleteModal.css';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ─── Doctor Profile Form ──────────────────────────────────────────────────────
const DoctorForm = ({ onSuccess, onSkip }) => {
  const [form, setForm] = useState({
    specialization: '',
    qualification: '',
    experience_years: '',
    available_days: [],
    available_time_start: '',
    available_time_end: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleDayToggle = (day) => {
    setForm((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.specialization.trim()) e.specialization = 'Required';
    if (!form.qualification.trim()) e.qualification = 'Required';
    if (!form.experience_years || isNaN(form.experience_years)) e.experience_years = 'Enter a valid number';
    if (form.available_days.length === 0) e.available_days = 'Select at least one day';
    if (!form.available_time_start) e.available_time_start = 'Required';
    if (!form.available_time_end) e.available_time_end = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        experience_years: parseInt(form.experience_years, 10),
        available_days: form.available_days.join(','),
        available_time_start: form.available_time_start,
        available_time_end: form.available_time_end,
      };
      const result = await api.completeDoctorProfile(payload);
      toast.success('Profile completed successfully!');
      onSuccess(result);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="pcm-section-label">Professional Information</p>

      <div className="pcm-grid">
        {/* Specialization */}
        <div className="pcm-field">
          <label className="pcm-label">Specialization *</label>
          <input
            type="text"
            className={`pcm-input${errors.specialization ? ' error' : ''}`}
            placeholder="e.g. Homeopathic Pediatrics"
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          />
          {errors.specialization && <span className="pcm-error-text">{errors.specialization}</span>}
        </div>

        {/* Qualification */}
        <div className="pcm-field">
          <label className="pcm-label">Qualification *</label>
          <input
            type="text"
            className={`pcm-input${errors.qualification ? ' error' : ''}`}
            placeholder="e.g. BHMS, MD (Homeopathy)"
            value={form.qualification}
            onChange={(e) => setForm({ ...form, qualification: e.target.value })}
          />
          {errors.qualification && <span className="pcm-error-text">{errors.qualification}</span>}
        </div>

        {/* Experience */}
        <div className="pcm-field">
          <label className="pcm-label">Years of Experience *</label>
          <input
            type="number"
            min="0"
            className={`pcm-input${errors.experience_years ? ' error' : ''}`}
            placeholder="e.g. 5"
            value={form.experience_years}
            onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
          />
          {errors.experience_years && <span className="pcm-error-text">{errors.experience_years}</span>}
        </div>

        {/* Consultation Hours */}
        <div className="pcm-field">
          <label className="pcm-label">Consultation Hours *</label>
          <div className="pcm-time-row">
            <input
              type="time"
              className={`pcm-input${errors.available_time_start ? ' error' : ''}`}
              value={form.available_time_start}
              onChange={(e) => setForm({ ...form, available_time_start: e.target.value })}
            />
            <span className="pcm-time-sep">to</span>
            <input
              type="time"
              className={`pcm-input${errors.available_time_end ? ' error' : ''}`}
              value={form.available_time_end}
              onChange={(e) => setForm({ ...form, available_time_end: e.target.value })}
            />
          </div>
          {(errors.available_time_start || errors.available_time_end) && (
            <span className="pcm-error-text">Both start and end times are required</span>
          )}
        </div>

        {/* Available Days */}
        <div className="pcm-field pcm-grid-full">
          <label className="pcm-label">Available Days *</label>
          <div className="pcm-days-grid">
            {WEEK_DAYS.map((day) => (
              <label key={day} className="pcm-day-label">
                <input
                  type="checkbox"
                  className="pcm-day-check"
                  checked={form.available_days.includes(day)}
                  onChange={() => handleDayToggle(day)}
                />
                <span>{day.slice(0, 3)}</span>
              </label>
            ))}
          </div>
          {errors.available_days && <span className="pcm-error-text">{errors.available_days}</span>}
        </div>
      </div>

      <div className="pcm-footer">
        <button type="submit" className="pcm-submit-btn" disabled={saving}>
          {saving ? <Loader size={16} className="pcm-spinner" /> : <UserCheck size={16} />}
          <span>{saving ? 'Saving Profile...' : 'Complete My Profile'}</span>
        </button>
        <button type="button" className="pcm-skip-btn" onClick={onSkip} disabled={saving}>
          Skip for now — I'll complete it later
        </button>
      </div>
    </form>
  );
};

// ─── Patient Profile Form ─────────────────────────────────────────────────────
const PatientForm = ({ onSuccess, onSkip }) => {
  const [form, setForm] = useState({
    gender: 'Male',
    date_of_birth: '',
    blood_group: 'A+',
    address: '',
    emergency_contact: '',
    allergies: '',
    medical_history: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.date_of_birth) e.date_of_birth = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.emergency_contact.trim()) e.emergency_contact = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const result = await api.completePatientProfile({
        gender: form.gender,
        date_of_birth: form.date_of_birth,
        blood_group: form.blood_group,
        address: form.address.trim(),
        emergency_contact: form.emergency_contact.trim(),
        allergies: form.allergies.trim() || 'None',
        medical_history: form.medical_history.trim() || 'None',
      });
      toast.success('Profile completed successfully!');
      onSuccess(result);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="pcm-section-label">Personal & Medical Information</p>

      <div className="pcm-grid">
        {/* Gender */}
        <div className="pcm-field">
          <label className="pcm-label">Gender *</label>
          <select
            className="pcm-select"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div className="pcm-field">
          <label className="pcm-label">Date of Birth *</label>
          <input
            type="date"
            className={`pcm-input${errors.date_of_birth ? ' error' : ''}`}
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          />
          {errors.date_of_birth && <span className="pcm-error-text">{errors.date_of_birth}</span>}
        </div>

        {/* Blood Group */}
        <div className="pcm-field">
          <label className="pcm-label">Blood Group *</label>
          <select
            className="pcm-select"
            value={form.blood_group}
            onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        {/* Emergency Contact */}
        <div className="pcm-field">
          <label className="pcm-label">Emergency Contact *</label>
          <input
            type="text"
            className={`pcm-input${errors.emergency_contact ? ' error' : ''}`}
            placeholder="+91 98765 43210"
            value={form.emergency_contact}
            onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
          />
          {errors.emergency_contact && <span className="pcm-error-text">{errors.emergency_contact}</span>}
        </div>

        {/* Address */}
        <div className="pcm-field pcm-grid-full">
          <label className="pcm-label">Residential Address *</label>
          <textarea
            className={`pcm-textarea${errors.address ? ' error' : ''}`}
            placeholder="Enter your full home address..."
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          {errors.address && <span className="pcm-error-text">{errors.address}</span>}
        </div>

        {/* Allergies */}
        <div className="pcm-field pcm-grid-full">
          <label className="pcm-label">Known Allergies</label>
          <textarea
            className="pcm-textarea"
            placeholder="e.g. Dust, Penicillin — or write 'None'"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          />
        </div>

        {/* Medical History */}
        <div className="pcm-field pcm-grid-full">
          <label className="pcm-label">Chronic Medical History</label>
          <textarea
            className="pcm-textarea"
            placeholder="e.g. Asthma, Diabetes — or write 'None'"
            value={form.medical_history}
            onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
          />
        </div>
      </div>

      <div className="pcm-footer">
        <button type="submit" className="pcm-submit-btn" disabled={saving}>
          {saving ? <Loader size={16} className="pcm-spinner" /> : <UserCheck size={16} />}
          <span>{saving ? 'Saving Profile...' : 'Complete My Profile'}</span>
        </button>
        <button type="button" className="pcm-skip-btn" onClick={onSkip} disabled={saving}>
          Skip for now — I'll complete it later
        </button>
      </div>
    </form>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
export const ProfileCompleteModal = () => {
  const { user, updateUserData } = useAuth();

  // Session-only skip — dismissed until next login (is_profile_completed stays false in DB)
  // Saved in sessionStorage so page refreshes do not prompt it again.
  const [skipped, setSkipped] = useState(() => {
    if (!user) return false;
    return sessionStorage.getItem(`profile_skipped_${user.id}`) === 'true';
  });

  // Only show if user is logged in AND profile is NOT completed AND role is DOCTOR or PATIENT
  if (!user || user.is_profile_completed || !['DOCTOR', 'PATIENT'].includes(user.role)) {
    return null;
  }

  // User clicked "Skip for now" — hide for this session only
  if (skipped) return null;

  const isDoctor = user.role === 'DOCTOR';

  const handleSuccess = (profileData) => {
    // Update auth context to mark profile as completed — hides this modal permanently
    const updatedUser = {
      ...user,
      is_profile_completed: true,
      ...(isDoctor ? { doctor_profile: profileData } : { patient_profile: profileData }),
    };
    updateUserData(updatedUser);
  };

  const handleSkip = () => {
    // Dismiss only for this session — next login will show the modal again
    if (user) {
      sessionStorage.setItem(`profile_skipped_${user.id}`, 'true');
    }
    setSkipped(true);
  };

  return (
    <div className="pcm-overlay">
      <div className="pcm-card">
        {/* Header */}
        <div className="pcm-header">
          <div className="pcm-icon-wrap">
            {isDoctor ? <Stethoscope size={28} /> : <User size={28} />}
          </div>
          <h2 className="pcm-title">Complete Your Profile</h2>
          <p className="pcm-subtitle">
            {isDoctor
              ? 'Please fill in your professional details before accessing the Doctor Portal.'
              : 'Please fill in your health details before accessing the Patient Portal.'}
          </p>
        </div>

        {/* Scrollable form body */}
        <div className="pcm-body">
          {isDoctor
            ? <DoctorForm onSuccess={handleSuccess} onSkip={handleSkip} />
            : <PatientForm onSuccess={handleSuccess} onSkip={handleSkip} />
          }
        </div>
      </div>
    </div>
  );
};
