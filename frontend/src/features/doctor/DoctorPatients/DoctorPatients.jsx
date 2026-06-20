import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { 
  RefreshCw, Users, Search, ArrowLeft, Calendar, ShieldAlert, 
  Activity, Clipboard, Heart, FileText, Clock, Download, ChevronUp, ChevronDown 
} from 'lucide-react';
import './DoctorPatients.css';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pastConsultations, setPastConsultations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedConsultationId, setExpandedConsultationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers('PATIENT');
      setPatients(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load patient directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    setPastConsultations([]);
    setExpandedConsultationId(null);
    try {
      const historyData = await api.getConsultations({ patient_id: patient.id });
      setPastConsultations(historyData);
      if (historyData && historyData.length > 0) {
        setExpandedConsultationId(historyData[0].id);
      }
    } catch (err) {
      console.error('Error loading patient history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  if (selectedPatient) {
    const profile = selectedPatient.patient_profile || {};
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Detail view header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => setSelectedPatient(null)} className="p-2">
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Medical File: {selectedPatient.full_name}</h2>
              <p className="text-xs text-slate-500 font-medium">Review patient health registry, chronic illnesses, and timeline records.</p>
            </div>
          </div>
          <Badge variant={selectedPatient.is_active ? 'success' : 'gray'}>
            {selectedPatient.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Details and History Grid */}
        <div className="patient-detail-container">
          
          {/* Left Panel: Personal Info & Chronic History */}
          <div className="space-y-6">
            <div className="patient-info-sidebar space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                  {selectedPatient.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedPatient.full_name}</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">ID: {selectedPatient.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Age / Gender</span>
                  <span className="text-slate-800 font-bold mt-0.5 block">{calculateAge(profile.date_of_birth)} Yrs / {profile.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Blood Group</span>
                  <span className="text-red-650 font-extrabold mt-0.5 block">{profile.blood_group || 'N/A'}</span>
                </div>
                <div className="col-span-2 border-t border-slate-50 pt-3">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Email Address</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block truncate">{selectedPatient.email}</span>
                </div>
                <div className="col-span-2 border-t border-slate-50 pt-3">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">Contact Number</span>
                  <span className="text-slate-800 font-bold mt-0.5 block">{selectedPatient.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="patient-info-sidebar space-y-4">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldAlert size={16} className="text-slate-500" />
                <span>Allergies & Medical History</span>
              </h4>

              <div className="space-y-3.5">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider mb-1">Known Allergies</span>
                  <span className={`inline-block font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                    profile.allergies ? 'text-amber-750 bg-amber-50 border border-amber-100' : 'text-slate-500 bg-slate-50 border border-slate-100'
                  }`}>
                    {profile.allergies || 'No known allergies'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider mb-1">Chronic History</span>
                  <p className="text-slate-705 text-xs leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg font-medium">
                    {profile.medical_history || 'No active chronic history logs in the system.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Medical Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Activity size={18} className="text-emerald-600" />
              <span>Consultation History & Timeline ({pastConsultations.length})</span>
            </h3>

            {loadingHistory ? (
              <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500 font-medium">
                Loading visit timeline records...
              </div>
            ) : pastConsultations.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Clipboard size={20} />
                </div>
                <h4 className="font-semibold text-slate-700 text-sm">No Previous Visits</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  This patient does not have any recorded consultations or clinical visits in the system yet.
                </p>
              </div>
            ) : (
              <div className="history-timeline">
                {pastConsultations.map((consult) => {
                  const isExpanded = expandedConsultationId === consult.id;
                  const appt = consult.appointment_detail || {};
                  const start_time = consult.created_at ? new Date(consult.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                  const end_time = consult.updated_at ? new Date(consult.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                  const date_label = consult.created_at ? new Date(consult.created_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
                  const booked_by = appt.booked_by_name ? `${appt.booked_by_name} (${appt.booked_by_role === 'ADMIN' ? 'Admin' : appt.booked_by_role === 'DOCTOR' ? 'Doctor' : 'Patient'})` : 'System';

                  return (
                    <div key={consult.id} className={`history-timeline-node ${isExpanded ? 'expanded' : ''}`}>
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
                                    <a 
                                      key={r.id}
                                      href={`http://localhost:8000${r.report_file}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1.5"
                                    >
                                      <Download size={12} />
                                      <span>{r.report_name}</span>
                                    </a>
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

        </div>
      </div>
    );
  }

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading patient records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Directory</h2>
          <p className="text-xs text-slate-500">Search and view active medical files registered under the clinic branches.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 py-1.5 w-full text-xs rounded border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
          <Button size="md" variant="secondary" onClick={fetchData}>
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {filteredPatients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Users size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Patients Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search queries or contact the admin panel to register new patients.
          </p>
        </div>
      ) : (
        <Table headers={['Full Name', 'Email Address', 'Phone Number', 'Status', 'Date Registered', 'Action']}>
          {filteredPatients.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-805 text-sm">{p.full_name}</td>
              <td className="px-4 py-3 text-slate-655 text-xs">{p.email}</td>
              <td className="px-4 py-3 text-slate-600 text-xs">{p.phone || '-'}</td>
              <td className="px-4 py-3">
                <Badge variant={p.is_active ? 'success' : 'gray'}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <Button size="sm" variant="outline" onClick={() => handleSelectPatient(p)}>
                  View File
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};
