import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Card } from '../../../components/ui/Card/Card';
import { Plus, UserPlus, Stethoscope } from 'lucide-react';
import './DoctorsList.css';

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !specialty || !email) return;

    const newDoc = {
      id: doctors.length + 1,
      name: `Dr. ${name}`,
      specialty,
      email,
      phone: phone || '+1 555-0000',
      appointmentsToday: 0,
      status: 'Active'
    };

    setDoctors([...doctors, newDoc]);
    setName('');
    setSpecialty('');
    setEmail('');
    setPhone('');
    setShowAddForm(false);
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading doctors list...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Medical Practitioners</h2>
          <p className="text-xs text-slate-500">Add, view, and coordinate active medical practitioners and schedules.</p>
        </div>
        <Button size="md" variant="medical" onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5">
          <Plus size={16} />
          <span>Register Doctor</span>
        </Button>
      </div>

      {showAddForm && (
        <Card title="Register New Doctor">
          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Doctor Name (Without 'Dr.')" 
              placeholder="e.g. Amit Patel" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
            <Input 
              label="Specialty Area" 
              placeholder="e.g. Constitutional Care" 
              value={specialty} 
              onChange={(e) => setSpecialty(e.target.value)} 
              required 
            />
            <Input 
              label="Email Address" 
              type="email"
              placeholder="e.g. doctor@homepathy.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <Input 
              label="Contact Phone" 
              placeholder="e.g. +1 555-0101" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Registry</Button>
            </div>
          </form>
        </Card>
      )}

      <Table headers={['ID', 'Doctor Name', 'Specialty Area', 'Contact Phone', 'Email', 'Active Appointments Today', 'Status']}>
        {doctors.map((doc) => (
          <tr key={doc.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">#{doc.id}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-850">{doc.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-700">{doc.specialty}</td>
            <td className="px-4 py-3 text-slate-600">{doc.phone}</td>
            <td className="px-4 py-3 text-slate-600">{doc.email}</td>
            <td className="px-4 py-3 text-center text-slate-850 font-bold">{doc.appointmentsToday} Cases</td>
            <td className="px-4 py-3">
              <Badge variant="success">
                {doc.status}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
