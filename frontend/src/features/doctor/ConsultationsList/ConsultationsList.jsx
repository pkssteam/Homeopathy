import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Card } from '../../../components/ui/Card/Card';
import { ClipboardCheck, Stethoscope } from 'lucide-react';
import './ConsultationsList.css';

export const ConsultationsList = () => {
  const [consultingPatients, setConsultingPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsult, setActiveConsult] = useState(null);

  // Form states
  const [diagnosis, setDiagnosis] = useState('');
  const [medicine, setMedicine] = useState('Arnica Montana 200C');
  const [dosage, setDosage] = useState('4 pills, 3 times a day');
  const [duration, setDuration] = useState('7 Days');

  useEffect(() => {
    const fetchActiveConsultations = async () => {
      try {
        const apts = await api.getAppointments();
        const active = apts.filter(a => a.doctorName.includes('Amit Patel') && a.status === 'Consulting');
        setConsultingPatients(active);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveConsultations();
  }, []);

  const handleStartForm = (apt) => {
    setActiveConsult(apt);
    setDiagnosis('');
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    if (!activeConsult || !diagnosis) return;

    try {
      // Create Prescription record
      await api.createPrescription({
        patientName: activeConsult.patientName,
        doctorName: activeConsult.doctorName,
        medicine,
        dosage,
        duration,
      });

      // Complete appointment
      await api.updateAppointmentStatus(activeConsult.id, 'Completed');
      
      setConsultingPatients(consultingPatients.filter(c => c.id !== activeConsult.id));
      setActiveConsult(null);
      setDiagnosis('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading active consults...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Active Consultations</h2>
        <p className="text-xs text-slate-500">Record clinical diagnosis summaries and write homeopathy medicine prescriptions.</p>
      </div>

      {activeConsult && (
        <Card title={`Diagnosis & Prescription: ${activeConsult.patientName}`}>
          <form onSubmit={handleSubmitConsultation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Clinical Diagnosis / Findings" 
                placeholder="e.g. Acute allergic rhinitis triggered by pollen" 
                value={diagnosis} 
                onChange={(e) => setDiagnosis(e.target.value)} 
                required 
              />
              <Select
                label="Prescribe Remedy"
                options={[
                  { value: 'Arnica Montana 200C', label: 'Arnica Montana 200C (Dilution)' },
                  { value: 'Nux Vomica 30C', label: 'Nux Vomica 30C (Dilution)' },
                  { value: 'Belladonna 200C', label: 'Belladonna 200C (Dilution)' },
                  { value: 'Thuja Occidentalis 1M', label: 'Thuja Occidentalis 1M (Dilution)' },
                  { value: 'Calendula Officinalis Ointment', label: 'Calendula Ointment' }
                ]}
                value={medicine}
                onChange={(e) => setMedicine(e.target.value)}
              />
              <Input 
                label="Dosage Guidelines" 
                placeholder="e.g. 4 globules dry on tongue" 
                value={dosage} 
                onChange={(e) => setDosage(e.target.value)} 
                required 
              />
              <Input 
                label="Duration of Course" 
                placeholder="e.g. 7 Days" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                required 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setActiveConsult(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Case Record</Button>
            </div>
          </form>
        </Card>
      )}

      <Table headers={['Apt ID', 'Patient Name', 'Visit Type', 'Queue Status', 'Actions']}>
        {consultingPatients.length > 0 ? consultingPatients.map((apt) => (
          <tr key={apt.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{apt.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-800">{apt.patientName}</td>
            <td className="px-4 py-3 text-slate-650">{apt.type}</td>
            <td className="px-4 py-3">
              <Badge variant="info">
                {apt.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="medical" onClick={() => handleStartForm(apt)} className="flex items-center gap-1">
                <Stethoscope size={12} />
                <span>Begin Examination</span>
              </Button>
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-xs font-semibold">
              <div className="flex flex-col items-center gap-2">
                <ClipboardCheck size={24} className="text-slate-355" />
                <span>No active consultations. Call a patient from the queue tab.</span>
              </div>
            </td>
          </tr>
        )}
      </Table>
    </div>
  );
};
