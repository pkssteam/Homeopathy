import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Card } from '../../../components/ui/Card/Card';
import { Select } from '../../../components/ui/Select/Select';
import { Plus, Search, User } from 'lucide-react';
import './PatientsList.css';

export const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [condition, setCondition] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.getPatients();
        setPatients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !age || !phone) return;

    const newPatient = {
      id: patients.length + 1,
      name,
      age: parseInt(age),
      gender,
      phone,
      lastVisit: new Date().toISOString().split('T')[0],
      condition: condition || 'General Consultation'
    };

    setPatients([...patients, newPatient]);
    setName('');
    setAge('');
    setGender('Male');
    setPhone('');
    setCondition('');
    setShowAddForm(false);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.condition.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading patients list...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Registered Patients</h2>
          <p className="text-xs text-slate-500">Access patient profiles, diagnostic histories, and contact info.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search by name or condition..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 w-full text-sm border border-slate-300 rounded bg-white"
            />
          </div>
          <Button size="md" variant="medical" onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5 shrink-0">
            <Plus size={16} />
            <span>Add Patient</span>
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card title="Add New Patient Profile">
          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input 
              label="Full Name" 
              placeholder="e.g. Suresh Kumar" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
            <Input 
              label="Age" 
              type="number"
              placeholder="e.g. 34" 
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              required 
            />
            <Select 
              label="Gender" 
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
              value={gender} 
              onChange={(e) => setGender(e.target.value)} 
            />
            <Input 
              label="Contact Phone" 
              placeholder="e.g. +91 98765 43210" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
            />
            <Input 
              label="Initial Diagnosis / Reason" 
              placeholder="e.g. Chronic Sinusitis" 
              value={condition} 
              onChange={(e) => setCondition(e.target.value)} 
            />
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Profile</Button>
            </div>
          </form>
        </Card>
      )}

      <Table headers={['ID', 'Patient Name', 'Age / Gender', 'Contact Phone', 'Last Visit Date', 'Known Condition']}>
        {filteredPatients.map((pat) => (
          <tr key={pat.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">#{pat.id}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{pat.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-700">{pat.age} yrs / {pat.gender}</td>
            <td className="px-4 py-3 text-slate-600">{pat.phone}</td>
            <td className="px-4 py-3 text-slate-600">{pat.lastVisit}</td>
            <td className="px-4 py-3 text-slate-800 font-medium">{pat.condition}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
