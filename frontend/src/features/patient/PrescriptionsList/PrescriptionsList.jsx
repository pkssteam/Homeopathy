import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { FileHeart } from 'lucide-react';
import './PrescriptionsList.css';

export const PrescriptionsList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await api.getPrescriptions();
        const myPr = data.filter(p => p.patientName.includes('Suresh Kumar'));
        setPrescriptions(myPr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading prescriptions...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Your Remedy Prescriptions</h2>
        <p className="text-xs text-slate-500">View prescription details, dosage directions, and pharmacy status.</p>
      </div>

      <Table headers={['PR ID', 'Prescribing Doctor', 'Prescription Date', 'Homeopathy Remedy', 'Dosage Guideline', 'Course Duration', 'Pharmacy Status']}>
        {prescriptions.map((pr) => (
          <tr key={pr.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{pr.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-800">{pr.doctorName}</td>
            <td className="px-4 py-3 text-slate-600">{pr.date}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <FileHeart size={14} className="text-slate-400" />
                <span>{pr.medicine}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-650">{pr.dosage}</td>
            <td className="px-4 py-3 text-slate-600">{pr.duration}</td>
            <td className="px-4 py-3">
              <Badge variant={pr.status === 'Dispensed' ? 'success' : 'warning'}>
                {pr.status}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
