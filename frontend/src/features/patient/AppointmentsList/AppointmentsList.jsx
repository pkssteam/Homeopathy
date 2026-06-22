import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Calendar as CalendarIcon, Plus, RefreshCw, X, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import './AppointmentsList.css';

// Helper to format Date objects as YYYY-MM-DD
const formatDateStr = (date) => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to get local weekday name
const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Helper to generate 30-minute slots dynamically
const generateSlots = (availableTimeStr) => {
  if (!availableTimeStr) return [];
  try {
    let slotsConfig = [];
    if (availableTimeStr.startsWith('[')) {
      slotsConfig = JSON.parse(availableTimeStr);
    } else {
      const parts = availableTimeStr.split(' to ');
      if (parts.length === 2) {
        slotsConfig = [{ start: parts[0], end: parts[1] }];
      } else {
        return [];
      }
    }

    const allSlots = [];
    slotsConfig.forEach(shift => {
      if (!shift.start || !shift.end) return;
      const [startH, startM] = shift.start.split(':').map(Number);
      const [endH, endM] = shift.end.split(':').map(Number);

      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (currentMinutes + 30 <= endMinutes) {
        const hh = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
        const mm = String(currentMinutes % 60).padStart(2, '0');
        allSlots.push(`${hh}:${mm}`);
        currentMinutes += 30;
      }
    });
    return allSlots;
  } catch (e) {
    console.error('Error generating slots:', e);
    return [];
  }
};

// ─── 1. DoctorCard Component ───────────────────────────────────────────────
export const DoctorCard = ({ doctor, isSelected, onSelect }) => {
  const profile = doctor.doctor_profile || {};
  const activeDays = profile.available_days ? profile.available_days.split(',').map(d => d.trim()) : [];

  const formattedTime = (() => {
    const timeVal = profile.available_time;
    if (!timeVal) return 'N/A';
    if (timeVal.startsWith('[')) {
      try {
        const slots = JSON.parse(timeVal);
        if (Array.isArray(slots)) {
          return slots.map(s => `${s.start} - ${s.end}`).join(', ');
        }
      } catch (e) {}
    }
    return timeVal;
  })();

  return (
    <div 
      className={`booking-doctor-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="doctor-card-header-row">
        <div className="doctor-card-avatar">
          {doctor.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'DR'}
        </div>
        <div className="doctor-card-basic-info">
          <h4 className="doctor-card-name">{doctor.full_name}</h4>
          <p className="doctor-card-specialty">{profile.specialization || 'Homeopathy Consultant'}</p>
          <div className="doctor-card-badges">
            <span className="doc-badge">🎓 {profile.qualification || 'BHMS'}</span>
            <span className="doc-badge">💼 {profile.experience_years || '0'}+ Yrs Exp</span>
          </div>
        </div>
      </div>
      
      <div className="doctor-card-body">
        <div className="schedule-info">
          <span className="schedule-label font-semibold">Weekly Days:</span>
          <div className="schedule-days-list">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => {
              const isOnDuty = activeDays.some(ad => ad.toLowerCase().startsWith(d.toLowerCase()));
              return (
                <span key={d} className={`day-pill ${isOnDuty ? 'active' : 'inactive'}`}>
                  {d}
                </span>
              );
            })}
          </div>
        </div>
        <div className="time-info">
          <span className="schedule-label font-semibold">Duty Hours:</span>
          <span className="time-range-text">{formattedTime}</span>
        </div>
      </div>

      <div className="doctor-card-footer">
        <div className="fee-section">
          <span className="fee-label">Consultation Fee</span>
          <span className="fee-val">₹{profile.consultation_fee ?? '0.00'}</span>
        </div>
        <div className={`choose-indicator ${isSelected ? 'selected' : ''}`}>
          {isSelected ? <Check size={14} /> : 'Select'}
        </div>
      </div>
    </div>
  );
};

// ─── 2. AppointmentCalendar Component ──────────────────────────────────────
export const AppointmentCalendar = ({ selectedDate, onChange, availableDaysStr }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const activeDays = availableDaysStr ? availableDaysStr.split(',').map(d => d.trim()) : [];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="appt-calendar">
      <div className="appt-calendar-header">
        <button type="button" onClick={handlePrevMonth} className="calendar-nav-btn">
          <ChevronLeft size={16} />
        </button>
        <span className="calendar-month-title">{monthNames[month]} {year}</span>
        <button type="button" onClick={handleNextMonth} className="calendar-nav-btn">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="appt-calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
          <div key={w} className="weekday-label">{w}</div>
        ))}
      </div>
      <div className="appt-calendar-days">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="calendar-day empty"></div>;
          }

          const isPast = date < today;
          const dayName = getDayName(date);
          const isAvailableDay = activeDays.length === 0 || activeDays.some(ad => ad.toLowerCase() === dayName.toLowerCase());
          const isDisabled = isPast || !isAvailableDay;

          const isSelected = selectedDate && 
            selectedDate.getDate() === date.getDate() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getFullYear() === date.getFullYear();

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(date)}
              className={`calendar-day-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : 'available'}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── 3. TimeSlotGrid Component ─────────────────────────────────────────────
export const TimeSlotGrid = ({ slots, bookedSlots, selectedSlot, onSelectSlot }) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="no-slots-alert">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
        <span className="text-slate-600 text-xs">
          No slots generated. Verify doctor has completed duty hours.
        </span>
      </div>
    );
  }

  return (
    <div className="time-slots-wrapper">
      <h4 className="slots-title">Available Shifts & Slots</h4>
      <div className="time-slots-grid">
        {slots.map(slotTime => {
          const isBooked = bookedSlots.includes(slotTime);
          const isSelected = selectedSlot === slotTime;

          let btnClass = 'slot-btn';
          if (isBooked) btnClass += ' booked';
          else if (isSelected) btnClass += ' selected';
          else btnClass += ' available';

          return (
            <button
              key={slotTime}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectSlot(slotTime)}
              className={btnClass}
            >
              <span className="slot-time-text">{slotTime}</span>
              {isBooked ? (
                <span className="slot-status-badge">Booked</span>
              ) : (
                <span className="slot-status-badge available-badge">Available</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── 4. AppointmentSummary Component ───────────────────────────────────────
export const AppointmentSummary = ({ hospital, doctor, date, time, fee, reason, onReasonChange }) => {
  const formattedDate = date ? date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const profile = doctor?.doctor_profile || {};

  return (
    <div className="appointment-summary-card">
      <h3 className="summary-title">Verify Consultation Booking Summary</h3>
      <div className="summary-details">
        <div className="summary-row">
          <span className="summary-label">Clinic Branch</span>
          <span className="summary-value">{hospital?.hospital_name} ({hospital?.branch_name})</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Practitioner</span>
          <span className="summary-value">{doctor?.full_name} ({profile.specialization || 'General Consulting'})</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Appointment Date</span>
          <span className="summary-value">{formattedDate}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Selected Shift Time</span>
          <span className="summary-value text-medical-600 font-bold bg-medical-50 px-2 py-0.5 rounded border border-medical-250">
            {time}
          </span>
        </div>
        <div className="summary-row total-fee-row">
          <span className="summary-label font-bold text-slate-800">Consultation Fee</span>
          <span className="summary-value text-lg font-bold text-emerald-600">₹{fee ?? '0.00'}</span>
        </div>
      </div>

      <div className="summary-reason-field">
        <label className="reason-label font-semibold text-slate-700">Reason for Visit / Symptoms</label>
        <textarea
          className="reason-textarea"
          placeholder="State your main symptoms (e.g., chronic sinus, digestives, migraine, allergy...)"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

// ─── Main AppointmentsList Component ───────────────────────────────────────
export const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Wizard Modal States
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Steps: 1 (Doctor select), 2 (Date & Time), 3 (Confirm)

  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [apptsData, hospData, doctorsData] = await Promise.all([
        api.getAppointments(),
        api.getHospitals(),
        api.getUsers('DOCTOR')
      ]);

      setAppointments(apptsData);
      setHospitals(hospData);
      setDoctors(doctorsData.filter(d => d.is_active));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load scheduling data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openBookModal = () => {
    const defaultHospitalId = hospitals[0]?.id || '';
    setSelectedHospitalId(defaultHospitalId);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot('');
    setBookingReason('');
    setBookedSlots([]);
    setFormErrors({});
    setCurrentStep(1);
    setIsOpen(true);
  };

  // Fetch booked slots whenever doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const dateStr = formatDateStr(selectedDate);
      api.getBookedSlots(selectedDoctor.id, dateStr)
        .then(res => {
          setBookedSlots(res.booked_slots || []);
        })
        .catch(err => {
          console.error('Failed to get booked slots:', err);
          setBookedSlots([]);
        });
    }
  }, [selectedDoctor, selectedDate]);

  const handleHospitalChange = (e) => {
    setSelectedHospitalId(e.target.value);
    setSelectedDoctor(null);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(''); // Reset slot choice when date changes
  };

  const handleSave = async () => {
    if (!selectedHospitalId || !selectedDoctor || !selectedDate || !selectedSlot) {
      setFormErrors({ api: 'Incomplete booking details. Please go back and verify choices.' });
      return;
    }

    setIsSaving(true);
    setFormErrors({});
    try {
      const me = await api.getCurrentUser();
      const payload = {
        hospital_id: selectedHospitalId,
        doctor_id: selectedDoctor.id,
        patient_id: me.id,
        appointment_date: formatDateStr(selectedDate),
        appointment_time: selectedSlot,
        reason: bookingReason,
        status: 'Pending'
      };

      await api.createAppointment(payload);
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to submit booking request.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment request?')) return;
    try {
      await api.cancelAppointment(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to cancel appointment.');
    }
  };

  const upcomingAppts = appointments.filter(appt => appt.status === 'Pending' || appt.status === 'Approved');
  const historyAppts = appointments.filter(appt => appt.status === 'Completed' || appt.status === 'Cancelled');

  // Filter doctors list based on branch selected
  const filteredDoctors = doctors.filter(d => d.hospital?.id === selectedHospitalId);

  // Time slot generator
  const generatedSlots = selectedDoctor ? generateSlots(selectedDoctor.doctor_profile?.available_time) : [];

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading appointment panel...</span>
      </div>
    );
  }

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Consultation Bookings</h2>
          <p className="text-xs text-slate-500">Request consultation sessions, monitor queue tokens, and view treatment logs.</p>
        </div>
        <div className="flex gap-2">
          <Button size="md" variant="secondary" onClick={fetchData}>
            <RefreshCw size={14} />
          </Button>
          <Button size="md" variant="medical" onClick={openBookModal} className="flex items-center gap-1.5 shadow-sm">
            <Plus size={16} />
            <span>Book Appointment</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Confirmed / Upcoming Queue Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Active / Upcoming Appointments</h3>
        
        {upcomingAppts.length === 0 ? (
          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
            No upcoming appointments scheduled. Click "Book Appointment" to schedule one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppts.map((appt) => {
              const isApproved = appt.status === 'Approved';
              return (
                <div key={appt.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-start gap-4 shadow-sm hover:border-slate-300 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={isApproved ? 'success' : 'warning'}>
                        {appt.status}
                      </Badge>
                      {isApproved && appt.token_number && (
                        <span className="text-xs font-bold text-medical-600 bg-medical-50 px-2 py-0.5 border border-medical-250 rounded">
                          Token #{appt.token_number}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-850 text-sm">{appt.doctor?.full_name}</h4>
                      <p className="text-xs text-slate-500">{appt.hospital?.hospital_name} - {appt.hospital?.branch_name}</p>
                    </div>
                    <div className="text-xs text-slate-650">
                      <strong>Scheduled:</strong> {appt.appointment_date} @ {appt.appointment_time?.substring(0, 5) || appt.appointment_time}
                    </div>
                    {appt.reason && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                        "{appt.reason}"
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleCancel(appt.id)} className="text-red-650 border-red-200 hover:bg-red-50 flex items-center gap-1 transition-all">
                    <X size={12} />
                    <span>Cancel</span>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment History List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Consultation History</h3>
        
        {historyAppts.length === 0 ? (
          <p className="text-xs text-slate-500 bg-white border border-slate-200 p-4 rounded text-center">
            No past appointment history.
          </p>
        ) : (
          <Table headers={['Token', 'Doctor', 'Branch', 'Date', 'Reason', 'Status']}>
            {historyAppts.map((appt) => (
              <tr key={appt.id} className="hover:bg-slate-50/50 bg-slate-50/10">
                <td className="px-4 py-3 font-semibold text-slate-500 text-xs">
                  {appt.token_number ? `#${appt.token_number}` : '-'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700 text-sm">
                  {appt.doctor?.full_name}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {appt.hospital?.branch_name}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {appt.appointment_date}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-xs">
                  {appt.reason || '-'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={appt.status === 'Completed' ? 'primary' : 'danger'}>
                    {appt.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Interactive Slot Booking Wizard Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Book Doctor Appointment"
        icon={CalendarIcon}
        className="booking-wizard-modal"
      >
        <div className="booking-wizard-container">
          {/* Steps Indicator Header */}
          <div className="wizard-steps-header">
            <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-number">{currentStep > 1 ? <Check size={12} /> : '1'}</div>
              <span className="step-label">Select Practitioner</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">{currentStep > 2 ? <Check size={12} /> : '2'}</div>
              <span className="step-label">Date & Time</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span className="step-label">Confirm</span>
            </div>
          </div>

          <div className="wizard-step-content mt-6">
            {/* STEP 1: Select Clinic Branch & Doctor */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="hospital-select-section">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Clinic Branch</label>
                  <select
                    className="w-full p-2.5 text-sm rounded border border-slate-200 focus:outline-none focus:border-medical-500"
                    value={selectedHospitalId}
                    onChange={handleHospitalChange}
                  >
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.hospital_name} ({h.branch_name})</option>
                    ))}
                  </select>
                </div>

                <div className="doctors-grid-section">
                  <h4 className="text-xs font-semibold text-slate-700 mb-3">Available Homeopathy Practitioners</h4>
                  {filteredDoctors.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed rounded-lg p-6 text-center text-xs text-slate-500">
                      No active homeopathic practitioners found in this branch.
                    </div>
                  ) : (
                    <div className="doctors-cards-grid">
                      {filteredDoctors.map(doc => (
                        <DoctorCard
                          key={doc.id}
                          doctor={doc}
                          isSelected={selectedDoctor?.id === doc.id}
                          onSelect={() => {
                            if (selectedDoctor?.id === doc.id) {
                              setSelectedDoctor(null);
                            } else {
                              setSelectedDoctor(doc);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Choose Date & Time Slot */}
            {currentStep === 2 && selectedDoctor && (
              <div className="calendar-slots-columns">
                <div className="calendar-col">
                  <h4 className="col-title">Select Visit Date</h4>
                  <p className="col-subtitle">Highlighted days are active hours of {selectedDoctor.full_name}</p>
                  <AppointmentCalendar
                    selectedDate={selectedDate}
                    onChange={handleDateChange}
                    availableDaysStr={selectedDoctor.doctor_profile?.available_days}
                  />
                </div>

                <div className="slots-col">
                  {selectedDate ? (
                    <TimeSlotGrid
                      slots={generatedSlots}
                      bookedSlots={bookedSlots}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                    />
                  ) : (
                    <div className="choose-date-prompt">
                      <CalendarIcon size={32} className="text-slate-300 mb-2" />
                      <p className="text-xs text-slate-500">Please choose an available date on the calendar to view timing shifts.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Booking Confirmation Summary */}
            {currentStep === 3 && selectedDoctor && selectedDate && selectedSlot && (
              <AppointmentSummary
                hospital={selectedHospital}
                doctor={selectedDoctor}
                date={selectedDate}
                time={selectedSlot}
                fee={selectedDoctor.doctor_profile?.consultation_fee}
                reason={bookingReason}
                onReasonChange={setBookingReason}
              />
            )}
          </div>

          {formErrors.api && (
            <div className="p-3 mt-4 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{formErrors.api}</span>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="wizard-actions-footer mt-6 pt-4 border-t border-slate-100 flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isSaving}
                  className="flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="medical"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !selectedDoctor) ||
                    (currentStep === 2 && (!selectedDate || !selectedSlot))
                  }
                  className="flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="medical"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 shadow-sm"
                >
                  {isSaving ? 'Booking...' : 'Confirm Book Appointment'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
