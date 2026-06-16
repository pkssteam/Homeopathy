import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Stethoscope } from 'lucide-react';
import './DoctorsList.css';

export const DoctorsList = ({ onBook }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await api.getDoctors();
        setDoctors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading doctors roster...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Hospital Physicians</h2>
        <p className="text-xs text-slate-500">Find qualified homeopathic practitioners and consult for chronic/acute disorders.</p>
      </div>

      <Table headers={['Doctor Name', 'Treatment Specialty Area', 'Status', 'Actions']}>
        {doctors.map((doc) => (
          <tr key={doc.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className="text-slate-400" />
                <span>{doc.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-650">{doc.specialty}</td>
            <td className="px-4 py-3">
              <Badge variant="success">
                {doc.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="medical" onClick={onBook}>
                Book Consultation
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
