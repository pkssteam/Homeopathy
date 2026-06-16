import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Plus, Building } from 'lucide-react';
import './HospitalsList.css';

export const HospitalsList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await api.getHospitals();
        setHospitals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const handleAddHospital = () => {
    const newHosp = {
      id: hospitals.length + 1,
      name: `Homepathy Branch #${hospitals.length + 1}`,
      location: 'Suburbs',
      status: 'Active',
      rooms: 6,
      phone: '+1 555-0800'
    };
    setHospitals([...hospitals, newHosp]);
  };

  const toggleStatus = (id) => {
    setHospitals(hospitals.map(h => {
      if (h.id === id) {
        return { ...h, status: h.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return h;
    }));
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading hospitals list...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hospital Locations</h2>
          <p className="text-xs text-slate-500">Manage hospital branches, clinic listings, and active status.</p>
        </div>
        <Button size="md" variant="medical" onClick={handleAddHospital} className="flex items-center gap-1.5">
          <Plus size={16} />
          <span>Register Branch</span>
        </Button>
      </div>

      <Table headers={['ID', 'Branch Name', 'Location', 'Total Rooms', 'Phone', 'Status', 'Actions']}>
        {hospitals.map((hosp) => (
          <tr key={hosp.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">#{hosp.id}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{hosp.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600">{hosp.location}</td>
            <td className="px-4 py-3 text-slate-600">{hosp.rooms} Units</td>
            <td className="px-4 py-3 text-slate-600">{hosp.phone}</td>
            <td className="px-4 py-3">
              <Badge variant={hosp.status === 'Active' ? 'success' : 'gray'}>
                {hosp.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => toggleStatus(hosp.id)}>
                Toggle Status
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
