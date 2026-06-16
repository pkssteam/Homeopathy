import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Check } from 'lucide-react';
import './PrescriptionRequestsList.css';

export const PrescriptionRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await api.getPrescriptions();
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const handleDispense = async (id, medicineName) => {
    try {
      // Find inventory match to deduct stock
      const inventory = await api.getInventory();
      const matchedItem = inventory.find(i => medicineName.toLowerCase().includes(i.name.toLowerCase()));
      
      if (matchedItem) {
        // Deduct 1 unit from stock
        await api.updateStock(matchedItem.id, Math.max(0, matchedItem.stock - 1));
      }

      // Update prescription state to Dispensed
      await api.updatePrescriptionStatus(id, 'Dispensed');
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'Dispensed' } : r));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading order requests...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Remedy Dispensation Requests</h2>
        <p className="text-xs text-slate-500">Track prescriptions made by doctor consultations, dispense dilutions, and deduct pharmacy stocks.</p>
      </div>

      <Table headers={['PR ID', 'Patient Name', 'Prescribing Doctor', 'Prescribed Remedy', 'Course Duration', 'Request Status', 'Actions']}>
        {requests.map((req) => (
          <tr key={req.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{req.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-805">{req.patientName}</td>
            <td className="px-4 py-3 text-slate-650">{req.doctorName}</td>
            <td className="px-4 py-3 text-slate-800 font-semibold">{req.medicine}</td>
            <td className="px-4 py-3 text-slate-600">{req.duration}</td>
            <td className="px-4 py-3">
              <Badge variant={req.status === 'Dispensed' ? 'success' : 'warning'}>
                {req.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              {req.status === 'Pending' ? (
                <Button size="sm" variant="medical" onClick={() => handleDispense(req.id, req.medicine)} className="flex items-center gap-1">
                  <Check size={12} />
                  <span>Dispense Remedy</span>
                </Button>
              ) : (
                <span className="text-xs text-green-650 font-bold flex items-center gap-1">
                  ✓ Dispensed
                </span>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
