import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Folder, Search } from 'lucide-react';
import './DoctorPrescriptions.css';

export const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await api.getConsultations();
        const list = [];
        data.forEach(consult => {
          if (consult.prescriptions) {
            consult.prescriptions.forEach(p => {
              list.push({
                ...p,
                patientName: consult.patient_detail?.full_name,
                date: new Date(consult.created_at).toLocaleDateString()
              });
            });
          }
        });
        setPrescriptions(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter(p => 
    p.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-slate-500 text-sm">Loading prescriptions...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Prescriptions & Remedies</h2>
          <p className="text-xs text-slate-500">Track and manage homeopathic dilutions and remedies authorized for your patients.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            placeholder="Search patient or remedy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          <Folder className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="font-semibold text-slate-700">No prescriptions found.</p>
          <p className="text-xs mt-1 text-slate-400">Remedy logs will appear once added in consultation workspace sessions.</p>
        </div>
      ) : (
        <Table headers={['Date', 'Patient Name', 'Remedy / Dilution', 'Dosage', 'Duration', 'Instructions', 'Dispensary Status']}>
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-slate-500 text-xs font-semibold">{p.date}</td>
              <td className="px-4 py-3 font-semibold text-slate-850 text-sm">{p.patientName}</td>
              <td className="px-4 py-3 font-bold text-slate-800 text-sm">{p.medicine_name}</td>
              <td className="px-4 py-3 text-slate-650 font-semibold">{p.dosage}</td>
              <td className="px-4 py-3 text-slate-600">{p.duration}</td>
              <td className="px-4 py-3 text-slate-500 italic truncate max-w-xs">{p.instructions || '-'}</td>
              <td className="px-4 py-3">
                <Badge variant={p.status === 'Dispensed' ? 'success' : 'warning'}>
                  {p.status}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};
