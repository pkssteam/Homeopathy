import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../services/api';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Check, 
  Stethoscope, Calendar, Clock, Heart, Clipboard, Activity,
  MapPin, AlertTriangle, ClipboardList
} from 'lucide-react';
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

  // Doctor profile fields
  const [specialization, setSpecialization] = useState(user?.doctor_profile?.specialization || '');
  const [qualification, setQualification] = useState(user?.doctor_profile?.qualification || '');
  const [experienceYears, setExperienceYears] = useState(user?.doctor_profile?.experience_years || '');
  const [timeSlots, setTimeSlots] = useState(() => {
    const timeVal = user?.doctor_profile?.available_time || '';
    if (timeVal.startsWith('[')) {
      try {
        return JSON.parse(timeVal);
      } catch (e) {
        // Fallback
      }
    }
    if (timeVal) {
      const parts = timeVal.split(' to ');
      if (parts.length === 2) {
        return [{ start: parts[0], end: parts[1] }];
      }
      return [{ start: timeVal, end: '' }];
    }
    return [{ start: '', end: '' }];
  });
  const [availableDays, setAvailableDays] = useState(() => {
    const days = user?.doctor_profile?.available_days || '';
    return days ? days.split(',').map(d => d.trim()) : [];
  });

  const handleAddSlot = () => {
    setTimeSlots([...timeSlots, { start: '', end: '' }]);
  };

  const handleRemoveSlot = (index) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, idx) => idx !== index));
    }
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setTimeSlots(newSlots);
  };

  // Patient profile fields
  const [gender, setGender] = useState(user?.patient_profile?.gender || 'Male');
  const [dateOfBirth, setDateOfBirth] = useState(user?.patient_profile?.date_of_birth || '');
  const [bloodGroup, setBloodGroup] = useState(user?.patient_profile?.blood_group || 'O+');
  const [emergencyContact, setEmergencyContact] = useState(user?.patient_profile?.emergency_contact || '');
  const [address, setAddress] = useState(user?.patient_profile?.address || '');
  const [allergies, setAllergies] = useState(user?.patient_profile?.allergies || '');
  const [medicalHistory, setMedicalHistory] = useState(user?.patient_profile?.medical_history || '');

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

  const handleSaveDoctorProfile = async (e) => {
    e.preventDefault();
    const hasEmptySlot = timeSlots.some(slot => !slot.start || !slot.end);
    if (!specialization || !qualification || !experienceYears || hasEmptySlot || availableDays.length === 0) {
      toast.error('Please fill in all required professional fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedProfile = await api.completeDoctorProfile({
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experience_years: parseInt(experienceYears, 10),
        available_time: JSON.stringify(timeSlots),
        available_days: availableDays.join(', '),
      });
      // Update our auth context
      const updatedUser = {
        ...user,
        doctor_profile: updatedProfile,
        is_profile_completed: true
      };
      updateUserData(updatedUser);
      toast.success('Clinical profile details saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save clinical profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePatientProfile = async (e) => {
    e.preventDefault();
    if (!dateOfBirth || !emergencyContact || !address) {
      toast.error('Please fill in all required health profile fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedProfile = await api.completePatientProfile({
        gender,
        date_of_birth: dateOfBirth,
        blood_group: bloodGroup,
        emergency_contact: emergencyContact.trim(),
        address: address.trim(),
        allergies: allergies.trim() || 'None',
        medical_history: medicalHistory.trim() || 'None',
      });
      // Update our auth context
      const updatedUser = {
        ...user,
        patient_profile: updatedProfile,
        is_profile_completed: true
      };
      updateUserData(updatedUser);
      toast.success('Health profile details saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save health profile.');
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

        {/* Doctor-Specific Professional Profile */}
        {user?.role === 'DOCTOR' && (
          <div className="profile-card profile-card-full">
            <h3 className="profile-card-title">Professional Clinical Details</h3>
            <p className="profile-card-desc">Configure your medical specialization, qualifications, and consultation times.</p>
            
            <form onSubmit={handleSaveDoctorProfile} className="profile-form">
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="profile-specialization">Specialization *</label>
                  <div className="profile-input-wrapper">
                    <Stethoscope className="profile-input-icon" size={16} />
                    <input
                      id="profile-specialization"
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Homeopathic Pediatrics"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-qualification">Qualification *</label>
                  <div className="profile-input-wrapper">
                    <Clipboard className="profile-input-icon" size={16} />
                    <input
                      id="profile-qualification"
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. BHMS, MD (Homeopathy)"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-experience">Years of Experience *</label>
                  <div className="profile-input-wrapper">
                    <Activity className="profile-input-icon" size={16} />
                    <input
                      id="profile-experience"
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 8"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ margin: 0 }}>Consultation Timing Hours *</label>
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="profile-add-slot-btn"
                      disabled={isSubmitting}
                    >
                      + Add Slot
                    </button>
                  </div>
                  <div className="profile-slots-list">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="profile-time-row" style={{ marginTop: '0.5rem' }}>
                        <div className="profile-input-wrapper" style={{ flex: 1 }}>
                          <Clock className="profile-input-icon" size={16} />
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleSlotChange(index, 'start', e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <span className="profile-time-sep">to</span>
                        <div className="profile-input-wrapper" style={{ flex: 1 }}>
                          <Clock className="profile-input-icon" size={16} />
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleSlotChange(index, 'end', e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        {timeSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(index)}
                            className="profile-remove-slot-btn"
                            disabled={isSubmitting}
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <label>Available Practice Days *</label>
                  <div className="profile-days-container">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="profile-day-checkbox-label">
                        <input
                          type="checkbox"
                          checked={availableDays.includes(day)}
                          disabled={isSubmitting}
                          onChange={() => {
                            if (availableDays.includes(day)) {
                              setAvailableDays(availableDays.filter(d => d !== day));
                            } else {
                              setAvailableDays([...availableDays, day]);
                            }
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-action-row">
                <button type="submit" className="profile-btn save-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="profile-spinner"></span>
                      <span>Saving Clinical Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Update Clinical Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Patient-Specific Medical Profile */}
        {user?.role === 'PATIENT' && (
          <div className="profile-card profile-card-full">
            <h3 className="profile-card-title">Personal Health Details</h3>
            <p className="profile-card-desc">Configure your personal physical attributes, emergency contacts, and clinical history.</p>
            
            <form onSubmit={handleSavePatientProfile} className="profile-form">
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="profile-gender">Gender *</label>
                  <div className="profile-input-wrapper">
                    <User className="profile-input-icon" size={16} />
                    <select
                      id="profile-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="profile-select-field"
                      disabled={isSubmitting}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-dob">Date of Birth *</label>
                  <div className="profile-input-wrapper">
                    <Calendar className="profile-input-icon" size={16} />
                    <input
                      id="profile-dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-blood">Blood Group *</label>
                  <div className="profile-input-wrapper">
                    <Heart className="profile-input-icon" size={16} />
                    <select
                      id="profile-blood"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="profile-select-field"
                      disabled={isSubmitting}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-emergency">Emergency Contact *</label>
                  <div className="profile-input-wrapper">
                    <Phone className="profile-input-icon" size={16} />
                    <input
                      id="profile-emergency"
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="profile-address">Residential Address *</label>
                  <div className="profile-input-wrapper">
                    <MapPin className="profile-input-icon textarea-icon" size={16} />
                    <textarea
                      id="profile-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter residential address"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="profile-allergies">Known Allergies</label>
                  <div className="profile-input-wrapper">
                    <AlertTriangle className="profile-input-icon textarea-icon" size={16} />
                    <textarea
                      id="profile-allergies"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, pollen (or write 'None')"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="profile-field profile-field-full">
                  <label htmlFor="profile-history">Chronic Medical History</label>
                  <div className="profile-input-wrapper">
                    <ClipboardList className="profile-input-icon textarea-icon" size={16} />
                    <textarea
                      id="profile-history"
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      placeholder="e.g. Asthma, diabetes (or write 'None')"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="profile-action-row">
                <button type="submit" className="profile-btn save-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="profile-spinner"></span>
                      <span>Saving Medical Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Update Medical Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
