import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { 
  Calendar, Search, ArrowLeft, Phone, Mail, FileText, Heart, Clipboard, Clock, User 
} from 'lucide-react';
import './DoctorFollowUps.css';

export const DoctorFollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const data = await api.getConsultations();
      const list = [];
      data.forEach(consult => {
        if (consult.follow_up) {
          list.push({
            ...consult.follow_up,
            patientName: consult.patient_detail?.full_name,
            patientPhone: consult.patient_detail?.phone,
            patientEmail: consult.patient_detail?.email,
            consultationDate: new Date(consult.created_at).toLocaleDateString(),
            consultationTime: new Date(consult.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            chiefComplaint: consult.chief_complaint,
            symptoms: consult.symptoms,
            diagnosisNotes: consult.diagnosis_notes,
            consultationNotes: consult.consultation_notes,
            diseaseStage: consult.disease_stage,
            prescriptions: consult.prescriptions || []
          });
        }
      });
      // Sort closest future date first
      list.sort((a, b) => new Date(a.next_visit_date) - new Date(b.next_visit_date));
      setFollowups(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const filtered = followups.filter(f => 
    f.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.follow_up_notes && f.follow_up_notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (selectedFollowup) {
    const isFuture = selectedFollowup.next_visit_date >= new Date().toISOString().split('T')[0];
    return (
      <div className="space-y-6 animate-fade-in text-xs">
        {/* Detail view header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => setSelectedFollowup(null)} className="p-2">
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-display">Follow-Up Review: {selectedFollowup.patientName}</h2>
              <p className="text-xs text-slate-500 font-medium">Verify upcoming clinical milestones and patient review notes.</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${
            isFuture ? 'followup-badge-upcoming' : 'followup-badge-past'
          }`}>
            {isFuture ? 'Upcoming Review' : 'Past Review / Completed'}
          </span>
        </div>

        {/* Details Layout Grid */}
        <div className="followups-detail-container">
          
          {/* Left Column: Patient Details & Initial Consultation Summary */}
          <div className="followup-detail-card space-y-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clipboard size={18} className="text-slate-500" />
              <span>Initial Consultation Summary</span>
            </h3>

            <div className="space-y-4">
              {/* Patient Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Patient Name</span>
                    <span className="text-slate-800 font-bold text-xs">{selectedFollowup.patientName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Phone Number</span>
                    <span className="text-slate-800 font-bold text-xs">{selectedFollowup.patientPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Context */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Visit Date / Time</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{selectedFollowup.consultationDate} at {selectedFollowup.consultationTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Recorded Disease Stage</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{selectedFollowup.diseaseStage || 'N/A'}</span>
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Chief Complaint</span>
                <p className="text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-lg font-medium leading-relaxed">
                  {selectedFollowup.chiefComplaint}
                </p>
              </div>

              {/* Symptoms */}
              {selectedFollowup.symptoms && (
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Symptomatology Details</span>
                  <p className="text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-lg font-medium leading-relaxed">
                    {selectedFollowup.symptoms}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Follow-up Milestone & Prescribed Remedy */}
          <div className="followup-detail-card space-y-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock size={18} className="text-emerald-600" />
              <span>Follow-Up Planner & Remedy</span>
            </h3>

            <div className="space-y-4">
              {/* Scheduled Date Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="text-emerald-700 block font-bold text-[10px] uppercase">Next Scheduled Date</span>
                  <span className="text-emerald-950 font-extrabold text-sm block mt-0.5">
                    {new Date(selectedFollowup.next_visit_date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <Calendar className="text-emerald-600" size={24} />
              </div>

              {/* Follow-up Notes */}
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Instructions / Notes</span>
                <p className="text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-lg font-semibold leading-relaxed">
                  {selectedFollowup.follow_up_notes || 'Routine follow-up consultation review.'}
                </p>
              </div>

              {/* Diagnosis notes */}
              {selectedFollowup.diagnosisNotes && (
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-0.5">Clinical Diagnosis</span>
                  <span className="text-slate-800 font-bold block">{selectedFollowup.diagnosisNotes}</span>
                </div>
              )}

              {/* Prescribed Remedies during that visit */}
              {selectedFollowup.prescriptions && selectedFollowup.prescriptions.length > 0 && (
                <div className="remedy-list-container space-y-2">
                  <span className="text-emerald-700 font-bold block uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Heart size={12} className="text-emerald-600" />
                    <span>Prescribed Remedy Program</span>
                  </span>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {selectedFollowup.prescriptions.map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                        <div>
                          <strong className="text-slate-800 block text-xs">{p.medicine_name}</strong>
                          <span className="text-slate-500 block text-[10px] mt-0.5">Dosage: {p.dosage} | Duration: {p.duration}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/50 px-2 py-0.5 rounded-full">
                          {p.instructions || 'Before Meal'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading scheduled reviews...</span>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Follow-Up Consultations Planner</h2>
          <p className="text-xs text-slate-500">View upcoming reviews and monitor recovery progressions scheduled for your patient roster.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            placeholder="Search by patient or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          <Calendar className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="font-semibold text-slate-700">No follow-ups scheduled.</p>
          <p className="text-xs mt-1 text-slate-400">Configure target follow-up dates when completing consultations.</p>
        </div>
      ) : (
        <Table headers={['Follow-Up Date', 'Patient Name', 'Created During Visit', 'Instructions / Notes', 'Timeline status', 'Action']}>
          {filtered.map((f) => {
            const isFuture = f.next_visit_date >= todayStr;
            return (
              <tr key={f.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-bold text-slate-800 text-sm">
                  {new Date(f.next_visit_date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-850 text-sm">{f.patientName}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{f.consultationDate}</td>
                <td className="px-4 py-3 text-slate-650 text-xs truncate max-w-sm">{f.follow_up_notes || '-'}</td>
                <td className="px-4 py-3">
                  <Badge variant={isFuture ? 'primary' : 'secondary'}>
                    {isFuture ? 'Upcoming' : 'Past Due / Met'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => setSelectedFollowup(f)}>
                    View Details
                  </Button>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
};
