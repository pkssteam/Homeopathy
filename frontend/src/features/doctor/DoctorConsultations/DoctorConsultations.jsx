import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Stethoscope, Search } from 'lucide-react';
import './DoctorConsultations.css';

export const DoctorConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const data = await api.getConsultations();
        setConsultations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  const filtered = consultations.filter(c => 
    c.patient_detail?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.chief_complaint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-slate-500 text-sm">Loading consultations...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinical Consultations Logs</h2>
          <p className="text-xs text-slate-500">View historical records of patient visits, diagnoses, and symptomatology charts.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            placeholder="Search patient or complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          <Stethoscope className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="font-semibold text-slate-700">No consultations completed yet.</p>
          <p className="text-xs mt-1 text-slate-400">Complete visits in the waiting room queue to populate consultation logs.</p>
        </div>
      ) : (
        <Table headers={['Date', 'Patient Name', 'Chief Complaint', 'Diagnosis', 'Stage', 'Prescribed remedies']}>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-slate-500 text-xs font-semibold">
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-800 text-sm">
                {c.patient_detail?.full_name}
              </td>
              <td className="px-4 py-3 text-slate-655 text-xs truncate max-w-xs">{c.chief_complaint}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-semibold">{c.diagnosis_notes || 'General Consult'}</td>
              <td className="px-4 py-3">
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                  {c.disease_stage}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs font-semibold">
                {c.prescriptions && c.prescriptions.length > 0 
                  ? c.prescriptions.map(p => p.medicine_name).join(', ') 
                  : '-'}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};
