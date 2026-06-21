import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Stethoscope, Calendar, Eye, Heart, ShieldAlert, Clock } from 'lucide-react';
import { ReportViewer } from '../../../components/ui/ReportViewer';
import './MyVisits.css';

export const MyVisits = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const data = await api.getConsultations();
        setConsultations(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load visit history.');
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading visits...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Consultation Visit History</h2>
        <p className="text-xs text-slate-500">Access diagnosis summaries, prescription details, and follow-ups from your consultations.</p>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {consultations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          <Stethoscope className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="font-semibold text-slate-700">No consultation records yet.</p>
          <p className="text-xs mt-1 text-slate-400">Your clinical consult files will appear here once your doctor finishes your visit.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {consultations.map((consult) => (
            <div key={consult.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
              
              {/* Header section of each visit card */}
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Dr. {consult.doctor_detail?.full_name}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">{consult.doctor_detail?.hospital_name} - {consult.doctor_detail?.branch_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold">
                  <Badge variant="primary">{consult.disease_stage}</Badge>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{new Date(consult.created_at).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-5 space-y-5">
                
                {/* Clinical Notes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold">Chief Complaint</span>
                    <p className="text-slate-850 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 leading-relaxed font-semibold">
                      {consult.chief_complaint}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold">Totality of Symptoms</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 leading-relaxed">
                      {consult.symptoms || 'No custom modalities recorded.'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold">Clinical Diagnosis</span>
                    <p className="text-slate-850 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 font-bold flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-amber-500" />
                      <span>{consult.diagnosis_notes || 'General Assessment'}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold">General Instructions</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 leading-relaxed">
                      {consult.consultation_notes || 'Take medicines as directed.'}
                    </p>
                  </div>
                </div>

                {/* Prescriptions Section */}
                {consult.prescriptions && consult.prescriptions.length > 0 && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Heart size={14} className="text-rose-500" />
                      <span>Prescribed Remedies</span>
                    </h4>
                    
                    <div className="border border-slate-150 rounded-lg overflow-hidden">
                      <table className="w-full border-collapse text-xs text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 font-bold uppercase tracking-wider text-[10px]">
                            <th className="px-4 py-2">Remedy / Medicine</th>
                            <th className="px-4 py-2">Dosage</th>
                            <th className="px-4 py-2">Duration</th>
                            <th className="px-4 py-2">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {consult.prescriptions.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/30">
                              <td className="px-4 py-2.5 font-bold text-slate-800">{p.medicine_name}</td>
                              <td className="px-4 py-2.5 text-slate-650 font-semibold">{p.dosage}</td>
                              <td className="px-4 py-2.5 text-slate-600">{p.duration}</td>
                              <td className="px-4 py-2.5 text-slate-500 italic">{p.instructions || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Followup & Reports Footer row */}
                {(consult.follow_up || (consult.reports && consult.reports.length > 0)) && (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-slate-100 text-xs">
                    
                    {/* Followup */}
                    {consult.follow_up ? (
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-900 px-3 py-2 rounded-lg">
                        <Clock size={16} className="text-blue-500" />
                        <div>
                          <span className="font-bold">Next Follow-Up: </span>
                          <span>{new Date(consult.follow_up.next_visit_date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          {consult.follow_up.follow_up_notes && (
                            <span className="text-[11px] block text-blue-800">Note: {consult.follow_up.follow_up_notes}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div />
                    )}

                    {/* Reports Download */}
                    {consult.reports && consult.reports.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-slate-400 font-semibold">Reports:</span>
                        {consult.reports.map((report) => (
                          <button
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold hover:border-indigo-200 transition-colors"
                          >
                            <Eye size={12} />
                            <span>{report.report_name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      )}

      <ReportViewer 
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        reportUrl={selectedReport?.report_file}
        reportName={selectedReport?.report_name}
      />
    </div>
  );
};
