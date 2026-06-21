import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Button } from '../../../components/ui/Button/Button';
import { Badge } from '../../../components/ui/Badge/Badge';
import { 
  ArrowLeft, User, Calendar, Activity, FileText, Plus, Trash2, 
  Search, AlertTriangle, CheckCircle, Clock, Heart, Clipboard, Eye, ShieldAlert,
  ChevronDown, ChevronUp
} from 'lucide-react';
import './ConsultationWorkspace.css';
import { ReportViewer } from '../../../components/ui/ReportViewer';

export const ConsultationWorkspace = ({ queueEntry, onBack, onComplete }) => {
  const patient = queueEntry.appointment?.patient;
  const appointment = queueEntry.appointment;
  const patientProfile = patient?.patient_profile || {};
  const [selectedReport, setSelectedReport] = useState(null);

  // Form states
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [diseaseStage, setDiseaseStage] = useState('New Patient');
  const [currentStep, setCurrentStep] = useState(1);

  // Prescription states
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [dosage, setDosage] = useState('1-0-1');
  const [duration, setDuration] = useState('5 days');
  const [beforeMeal, setBeforeMeal] = useState(true);
  const [afterMeal, setAfterMeal] = useState(false);
  const [prescribedList, setPrescribedList] = useState([]);

  // Submission resilience states
  const [createdConsultationId, setCreatedConsultationId] = useState(null);
  const [uploadedReportIndices, setUploadedReportIndices] = useState([]);

  // Report states
  const [reports, setReports] = useState([]);
  const [reportName, setReportName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Future appointment states
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('10:00');
  const [nextReason, setNextReason] = useState('Follow-up consultation');

  // Medical history states
  const [pastConsultations, setPastConsultations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedConsultationId, setExpandedConsultationId] = useState(null);

  // Fetch inventory and past medical records on load
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const [invData, consultationsData] = await Promise.all([
          api.getInventory(),
          api.getConsultations({ patient_id: patient.id })
        ]);
        setInventory(invData);
        setPastConsultations(consultationsData);
        // Expand the most recent consultation by default if available
        if (consultationsData && consultationsData.length > 0) {
          setExpandedConsultationId(consultationsData[0].id);
        }
      } catch (err) {
        console.error('Error fetching workspace data:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    if (patient?.id) {
      fetchWorkspaceData();
    }
  }, [patient?.id]);

  // Calculate age helper
  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Medicine search filter
  const filteredMedicines = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMedicine = (med) => {
    setSelectedMedicine(med);
    setSearchQuery(med.name);
  };

  const handleAddPrescription = () => {
    if (!selectedMedicine && !searchQuery) return;
    
    const medName = selectedMedicine ? selectedMedicine.name : searchQuery;
    const medId = selectedMedicine ? selectedMedicine.id : null;

    // Check duplicate
    if (prescribedList.some(p => p.medicine_name.toLowerCase() === medName.toLowerCase())) {
      alert('This medicine is already added to the prescription list.');
      return;
    }

    const mealInstructions = [];
    if (beforeMeal) mealInstructions.push('Before Meal');
    if (afterMeal) mealInstructions.push('After Meal');
    const finalInstructions = mealInstructions.length === 2 ? 'Both (Before & After)' : 
                              mealInstructions.length === 1 ? mealInstructions[0] : 'Before Meal';

    setPrescribedList([...prescribedList, {
      medicine_name: medName,
      inventory_item: medId,
      dosage,
      duration,
      instructions: finalInstructions,
      stockStatus: selectedMedicine ? selectedMedicine.status : 'Unknown',
      stockQty: selectedMedicine ? selectedMedicine.stock : 0
    }]);

    // Reset inputs
    setSelectedMedicine(null);
    setSearchQuery('');
    setDosage('1-0-1');
    setDuration('5 days');
    setBeforeMeal(true);
    setAfterMeal(false);
  };

  const handleRemovePrescription = (index) => {
    setPrescribedList(prescribedList.filter((_, i) => i !== index));
  };

  // File upload state change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!reportName) {
        setReportName(e.target.files[0].name.split('.')[0]);
      }
    }
  };

  const handleAddReport = () => {
    if (!selectedFile) return;
    setReports([...reports, {
      name: reportName || selectedFile.name,
      file: selectedFile
    }]);
    setReportName('');
    setSelectedFile(null);
  };

  const handleRemoveReport = (index) => {
    setReports(reports.filter((_, i) => i !== index));
  };

  // Complete consultation submission handler
  const handleSubmitConsultation = async () => {
    if (!chiefComplaint) {
      setError('Chief Complaint is required to complete the consultation.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create next appointment first if scheduled to obtain its ID
      let futureAppointmentId = null;
      if (scheduleNext && nextDate) {
        const apptResult = await api.createAppointment({
          hospital_id: appointment.hospital.id,
          patient_id: patient.id,
          doctor_id: appointment.doctor.id,
          appointment_date: nextDate,
          appointment_time: nextTime.includes(':') && nextTime.split(':').length === 2 ? `${nextTime}:00` : nextTime,
          reason: nextReason,
          status: 'Approved' // Pre-approved by doctor
        });
        if (apptResult && apptResult.id) {
          futureAppointmentId = apptResult.id;
        }
      }

      // 2. Submit consultation details with follow_up info linked to the future appointment
      let consultationResult;
      if (createdConsultationId) {
        consultationResult = { id: createdConsultationId };
      } else {
        const consultationPayload = {
          appointment: appointment.id,
          chief_complaint: chiefComplaint,
          symptoms,
          diagnosis_notes: diagnosisNotes,
          consultation_notes: consultationNotes,
          disease_stage: diseaseStage,
          prescriptions: prescribedList.map(p => ({
            medicine_name: p.medicine_name,
            inventory_item: p.inventory_item,
            dosage: p.dosage,
            duration: p.duration,
            instructions: p.instructions
          }))
        };

        if (scheduleNext && nextDate) {
          consultationPayload.follow_up = {
            next_visit_date: nextDate,
            follow_up_notes: nextReason,
            future_appointment: futureAppointmentId
          };
        }

        consultationResult = await api.createConsultation(consultationPayload);
        setCreatedConsultationId(consultationResult.id);
      }

      // 3. Upload reports if any (with retry support)
      if (reports.length > 0) {
        for (let idx = 0; idx < reports.length; idx++) {
          if (uploadedReportIndices.includes(idx)) continue;
          
          const report = reports[idx];
          const reportFormData = new FormData();
          reportFormData.append('consultation', consultationResult.id);
          reportFormData.append('report_name', report.name);
          reportFormData.append('report_file', report.file);
          
          await api.uploadConsultationReport(consultationResult.id, reportFormData);
          setUploadedReportIndices(prev => [...prev, idx]);
        }
      }

      // 4. Mark active queue entry as completed
      await api.completeQueue(queueEntry.id);

      alert('Consultation completed and saved successfully.');
      onComplete();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit consultation workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const STAGES = [
    { id: 1, label: 'Patient Info', icon: User },
    { id: 2, label: 'Medical History', icon: Activity },
    { id: 3, label: 'Today\'s Summary', icon: Clipboard },
    { id: 4, label: 'Remedy Prescription', icon: Heart },
    { id: 5, label: 'Lab Reports', icon: FileText },
    { id: 6, label: 'Follow-Up Planner', icon: Clock }
  ];

  return (
    <div className="workspace-container animate-fade-in">
      {/* Header bar */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="secondary" onClick={onBack} className="p-2">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Clinical Consultation Workspace</h2>
            <p className="text-xs text-slate-500 font-medium">Record clinical findings, administer prescriptions, and schedule follow-ups.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning">{diseaseStage}</Badge>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Token #{appointment?.token_number}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Stepper Progress Timeline */}
      <div className="stepper-card">
        <div className="stepper-steps-wrapper">
          {/* Progress Bar Line */}
          <div className="stepper-line">
            <div 
              className="stepper-progress" 
              style={{ width: `${((currentStep - 1) / (STAGES.length - 1)) * 100}%` }}
            />
          </div>

          {/* Stepper Steps */}
          {STAGES.map((stage) => {
            const StepIcon = stage.icon;
            const isCompleted = stage.id < currentStep;
            const isActive = stage.id === currentStep;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  if (chiefComplaint.trim() || currentStep < 3 || stage.id <= currentStep) {
                    setError('');
                    setCurrentStep(stage.id);
                  } else {
                    setError('Chief Complaint is required before switching stages.');
                  }
                }}
                className={`step-button ${isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}`}
              >
                {/* Step Circle Icon Container */}
                <div className="step-icon-circle">
                  <StepIcon size={18} />
                </div>
                {/* Step Label */}
                <span className="step-label">
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main step container */}
      <div className="min-h-[380px]">
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Personal details card */}
            <div className="stage-card space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                  {patient?.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{patient?.full_name}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Patient ID: {patient?.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Age / Gender</span>
                  <span className="text-slate-800 font-bold mt-0.5 block">{calculateAge(patientProfile.date_of_birth)} Yrs / {patientProfile.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Blood Group</span>
                  <span className="text-red-650 font-extrabold mt-0.5 block">{patientProfile.blood_group || 'N/A'}</span>
                </div>
                <div className="col-span-2 border-t border-slate-50 pt-3">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Contact Number</span>
                  <span className="text-slate-800 font-bold mt-0.5 block">{patient?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Allergies & medical history card */}
            <div className="stage-card space-y-6">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldAlert size={18} className="text-slate-500" />
                <span>Allergies & Chronic History</span>
              </h4>

              <div className="space-y-4">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider mb-1">Known Allergies</span>
                  <span className={`inline-block font-bold text-xs px-3 py-1 rounded-full ${
                    patientProfile.allergies ? 'text-amber-700 bg-amber-50 border border-amber-100' : 'text-slate-500 bg-slate-50 border border-slate-100'
                  }`}>
                    {patientProfile.allergies || 'No known allergies'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider mb-1">Chronic History</span>
                  <p className="text-slate-705 text-xs leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg font-medium">
                    {patientProfile.medical_history || 'No active chronic history logs in the system.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Visit context card */}
            <div className="stage-card md:col-span-2 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar size={18} className="text-slate-500" />
                <span>Current Visit Context</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Appointment Date</span>
                  <span className="font-bold text-slate-800">{appointment?.appointment_date}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Token Number</span>
                  <span className="font-extrabold text-slate-850">#{appointment?.token_number}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Reason for Visit</span>
                  <span className="font-bold text-slate-850 block truncate">{appointment?.reason || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            {loadingHistory ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading visit history...</div>
            ) : pastConsultations.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <User size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-850">New Patient First-Time Visit</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Welcome! This is a new patient visiting for the first time. No previous consultation records are available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="history-timeline">
                <div className="history-timeline-line"></div>
                {pastConsultations.map((consult) => {
                  const isExpanded = expandedConsultationId === consult.id;
                  const appt = consult.appointment_detail || {};
                  const start_time = consult.created_at ? new Date(consult.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                  const end_time = consult.updated_at ? new Date(consult.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                  const date_label = consult.created_at ? new Date(consult.created_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
                  const booked_by = appt.booked_by_name ? `${appt.booked_by_name} (${appt.booked_by_role === 'ADMIN' ? 'Admin' : appt.booked_by_role === 'DOCTOR' ? 'Doctor' : 'Patient'})` : 'System';

                  return (
                    <div key={consult.id} className={`history-timeline-node ${isExpanded ? 'expanded' : ''}`}>
                      <div className="history-node-bullet"></div>
                      <div className={`history-node-card ${isExpanded ? 'expanded' : ''}`}>
                        <div 
                          className="history-node-header"
                          onClick={() => setExpandedConsultationId(isExpanded ? null : consult.id)}
                        >
                          <div className="history-node-title">
                            <span className="history-node-date">{date_label}</span>
                            <span className="history-node-complaint">| Complaint: {consult.chief_complaint}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Dr. {consult.doctor_detail?.full_name}</Badge>
                            {isExpanded ? <ChevronUp size={16} className="history-node-chevron" /> : <ChevronDown size={16} className="history-node-chevron" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="history-node-body animate-fade-in">
                            {/* Time & Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div>
                                <span className="text-slate-400 block font-semibold">Consultation Duration</span>
                                <span className="text-slate-700 font-bold">{start_time} - {end_time}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold">Disease Stage</span>
                                <span className="text-slate-700 font-bold">{consult.disease_stage || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold">Appointment Booked By</span>
                                <span className="text-slate-700 font-bold">{booked_by}</span>
                              </div>
                            </div>

                            {/* Diagnosis & Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                <span className="text-slate-500 block font-semibold uppercase tracking-wider text-[10px] mb-1">Symptomatology</span>
                                <p className="text-slate-755 leading-relaxed font-semibold">{consult.symptoms || 'None recorded'}</p>
                              </div>
                              <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                <span className="text-slate-500 block font-semibold uppercase tracking-wider text-[10px] mb-1">Diagnosis Notes & General Instructions</span>
                                <p className="text-slate-755 leading-relaxed font-medium"><strong className="text-slate-805 font-bold">Diagnosis:</strong> {consult.diagnosis_notes || 'N/A'}</p>
                                <p className="text-slate-755 leading-relaxed mt-1 font-medium"><strong className="text-slate-805 font-bold">Dietary/General:</strong> {consult.consultation_notes || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Remedy Prescriptions */}
                            {consult.prescriptions && consult.prescriptions.length > 0 && (
                              <div className="border-t border-slate-100 pt-3 text-xs">
                                <span className="text-emerald-700 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Prescribed Remedies</span>
                                <div className="remedy-grid">
                                  {consult.prescriptions.map(p => (
                                    <div key={p.id} className="remedy-card">
                                      <div>
                                        <strong className="text-emerald-800 font-bold">{p.medicine_name}</strong>
                                        <span className="text-slate-500 block text-[10px] mt-0.5 font-medium">Dosage: {p.dosage} | Duration: {p.duration}</span>
                                      </div>
                                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/50 px-2 py-0.5 rounded-full">
                                        {p.instructions || 'Before Meal'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Follow-up Details */}
                            {consult.follow_up && (
                              <div className="bg-blue-50/50 border border-blue-100/85 p-3 rounded-lg text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                  <strong className="text-blue-805 font-bold block mb-0.5">Scheduled Follow-up Appointment</strong>
                                  <span className="text-slate-655 font-medium">{consult.follow_up.follow_up_notes || 'Routine follow-up'}</span>
                                </div>
                                <div className="text-blue-900 font-bold bg-blue-100/50 px-3 py-1 rounded-full text-[11px] self-start sm:self-center">
                                  Date: {consult.follow_up.next_visit_date}
                                </div>
                              </div>
                            )}

                            {/* Uploaded Reports */}
                            {consult.reports && consult.reports.length > 0 && (
                              <div className="border-t border-slate-100 pt-3 text-xs">
                                <span className="text-indigo-700 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Consultation Reports</span>
                                <div className="flex flex-wrap gap-2">
                                  {consult.reports.map(r => (
                                    <button 
                                      key={r.id}
                                      onClick={() => setSelectedReport(r)}
                                      className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1.5"
                                    >
                                      <Eye size={12} />
                                      <span>{r.report_name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="stage-card space-y-6 animate-fade-in">
            <h4 className="stage-card-title-bar font-bold text-slate-800 text-sm">
              <Clipboard size={18} className="text-slate-500" />
              <span>Today's Consultation Summary</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 modern-input-group">
                <label className="modern-label">Chief Complaint <span className="text-red-500">*</span></label>
                <textarea
                  className="modern-input modern-textarea font-medium"
                  placeholder="Primary reason patient is seeking treatment..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-2 modern-input-group">
                <label className="modern-label">Symptomatology (Homeopathic Totality of Symptoms)</label>
                <textarea
                  className="modern-input modern-textarea font-medium"
                  placeholder="Record modalities, side preferences, thirst levels, thermal properties..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div className="modern-input-group">
                <label className="modern-label">Diagnosis Notes</label>
                <input
                  type="text"
                  className="modern-input font-medium"
                  placeholder="e.g. Acute tonsillitis, Rheumatoid arthritis"
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                />
              </div>

              <div className="modern-input-group">
                <label className="modern-label">Current Disease Stage</label>
                <select
                  className="modern-input font-medium cursor-pointer"
                  value={diseaseStage}
                  onChange={(e) => setDiseaseStage(e.target.value)}
                >
                  <option value="New Patient">New Patient</option>
                  <option value="Initial Stage">Initial Stage</option>
                  <option value="Improving">Improving</option>
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                  <option value="Recovered">Recovered</option>
                </select>
              </div>

              <div className="sm:col-span-2 modern-input-group">
                <label className="modern-label">General/Dietary Instructions & Notes</label>
                <textarea
                  className="modern-input modern-textarea font-medium"
                  placeholder="e.g. Avoid strong food odors, take 10 minutes before meals..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="stage-card space-y-6 animate-fade-in">
            <h4 className="stage-card-title-bar font-bold text-slate-800 text-sm">
              <Heart size={18} className="text-rose-500 animate-pulse" />
              <span>Remedy Prescription Section</span>
            </h4>

            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Remedy</span>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4 relative modern-input-group">
                  <label className="modern-label">Remedy Name / Dilution</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                      type="text"
                      className="modern-input modern-input-with-icon font-medium"
                      placeholder="Search remedies..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedMedicine(null);
                      }}
                    />
                  </div>

                  {searchQuery && !selectedMedicine && filteredMedicines.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-[180px] overflow-y-auto z-30 text-xs">
                      {filteredMedicines.map(med => {
                        const isLow = med.status === 'Low Stock';
                        const isOut = med.status === 'Out of Stock';
                        return (
                          <button
                            key={med.id}
                            type="button"
                            className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 flex justify-between items-center"
                            onClick={() => handleSelectMedicine(med)}
                          >
                            <span className="font-semibold text-slate-850">{med.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isOut ? 'bg-red-50 text-red-600' :
                              isLow ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {med.stock} {med.unit}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 modern-input-group">
                  <label className="modern-label">Dosage</label>
                  <input
                    type="text"
                    className="modern-input font-medium"
                    placeholder="e.g. 1-0-1"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 modern-input-group">
                  <label className="modern-label">Duration</label>
                  <input
                    type="text"
                    className="modern-input font-medium"
                    placeholder="e.g. 5 days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 modern-input-group">
                  <label className="modern-label">Meal Timing</label>
                  <div className="flex gap-2 mt-1">
                    <label className="flex-1 flex items-center justify-center gap-1 bg-white border border-slate-200 rounded-lg p-2 cursor-pointer select-none hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={beforeMeal}
                        onChange={(e) => setBeforeMeal(e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-slate-705">Before</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-1 bg-white border border-slate-200 rounded-lg p-2 cursor-pointer select-none hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={afterMeal}
                        onChange={(e) => setAfterMeal(e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-slate-750">After</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="medical"
                    onClick={handleAddPrescription}
                    className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <Plus size={16} />
                    <span>Add to list</span>
                  </Button>
                </div>
              </div>

              {selectedMedicine && (
                <div className="mt-2 text-xs flex items-center gap-2 bg-white px-3 py-2 border border-slate-100 rounded-lg">
                  <span className="text-slate-500">Availability:</span>
                  <span className="font-semibold text-slate-800">{selectedMedicine.stock} {selectedMedicine.unit}</span>
                  <Badge variant={
                    selectedMedicine.status === 'In Stock' ? 'success' :
                    selectedMedicine.status === 'Low Stock' ? 'warning' : 'danger'
                  }>
                    {selectedMedicine.status}
                  </Badge>
                </div>
              )}
            </div>

            {prescribedList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No remedies added to prescription list yet. Use the fields above to add items.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-4 py-3">Remedy Name</th>
                      <th className="px-4 py-3">Dosage</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Meal Timing</th>
                      <th className="px-4 py-3">Stock Level</th>
                      <th className="px-3 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescribedList.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-bold text-slate-850">{item.medicine_name}</td>
                        <td className="px-4 py-3 text-slate-650 font-bold">{item.dosage}</td>
                        <td className="px-4 py-3 text-slate-655 font-bold">{item.duration}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                            {item.instructions}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${
                            item.stockStatus === 'Out of Stock' ? 'text-red-650' :
                            item.stockStatus === 'Low Stock' ? 'text-amber-650' : 'text-emerald-650'
                          }`}>
                            {item.stockStatus} ({item.stockQty})
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePrescription(index)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="stage-card space-y-6 animate-fade-in">
            <h4 className="stage-card-title-bar font-bold text-slate-800 text-sm">
              <FileText size={18} className="text-slate-500" />
              <span>Attach Consultation Lab Reports</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="sm:col-span-5 modern-input-group">
                <label className="modern-label">Report Title</label>
                <input
                  type="text"
                  className="modern-input font-medium"
                  placeholder="e.g. Thyroid Test, Chest X-Ray"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              <div className="sm:col-span-5 modern-input-group">
                <label className="modern-label">Select File (PDF, Image)</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-555 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddReport}
                  disabled={!selectedFile}
                  className="w-full py-2 flex items-center justify-center gap-1 text-xs font-bold"
                >
                  <Plus size={15} />
                  <span>Attach</span>
                </Button>
              </div>
            </div>

            {reports.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attached Reports List</span>
                {reports.map((report, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-900 animate-fade-in">
                    <span className="font-bold">{report.name} <span className="text-slate-400 font-normal">({report.file.name})</span></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReport(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 6 && (
          <div className="stage-card space-y-6 animate-fade-in">
            <h4 className="stage-card-title-bar font-bold text-slate-800 text-sm">
              <Clock size={18} className="text-slate-500" />
              <span>Follow-Up & Schedule Next Visit</span>
            </h4>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <input
                id="schedule-next-appt"
                type="checkbox"
                checked={scheduleNext}
                onChange={(e) => setScheduleNext(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="schedule-next-appt" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Book follow-up appointment directly in the system for this patient
              </label>
            </div>

            {scheduleNext && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100 animate-fade-in text-xs">
                <div className="modern-input-group">
                  <label className="modern-label">Preferred Follow-up Date *</label>
                  <input
                    type="date"
                    className="modern-input font-bold"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    required
                  />
                </div>
                <div className="modern-input-group">
                  <label className="modern-label">Preferred Follow-up Time *</label>
                  <input
                    type="time"
                    className="modern-input font-bold"
                    value={nextTime}
                    onChange={(e) => setNextTime(e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2 modern-input-group">
                  <label className="modern-label">Follow-up Clinical Notes / Instructions</label>
                  <input
                    type="text"
                    className="modern-input font-medium"
                    placeholder="e.g. Constitutional checkup, monitoring skin flare-up..."
                    value={nextReason}
                    onChange={(e) => setNextReason(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons Panel */}
      <div className="nav-buttons-panel">
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            Previous Stage
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-xs font-bold"
          >
            Cancel Workspace
          </Button>

          {currentStep < 6 ? (
            <Button
              type="button"
              variant="medical"
              onClick={() => {
                if (currentStep === 3 && !chiefComplaint.trim()) {
                  setError('Chief Complaint is required before proceeding.');
                  return;
                }
                setError('');
                setCurrentStep(prev => Math.min(prev + 1, 6));
              }}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              Next Stage
            </Button>
          ) : (
            <Button
              type="button"
              variant="medical"
              onClick={handleSubmitConsultation}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  <span>Saving Consultation...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Complete Consultation</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      <ReportViewer 
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        reportUrl={selectedReport?.report_file}
        reportName={selectedReport?.report_name}
      />
    </div>
  );
};
