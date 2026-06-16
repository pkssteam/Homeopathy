import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { Plus, User, Search, RefreshCw } from 'lucide-react';
import './PatientsList.css';

export const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'PATIENT',
    hospital_id: '',
    is_active: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [patientsData, hospitalsData] = await Promise.all([
        api.getUsers('PATIENT'),
        api.getHospitals()
      ]);
      setPatients(patientsData);
      setHospitals(hospitalsData.filter(h => h.status === 'Active'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch patient accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role: 'PATIENT',
      hospital_id: hospitals[0]?.id || '',
      is_active: true
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (pat) => {
    setFormData({
      full_name: pat.full_name,
      email: pat.email,
      phone: pat.phone || '',
      password: '', // blank password means no change
      role: 'PATIENT',
      hospital_id: pat.hospital?.id || '',
      is_active: pat.is_active
    });
    setFormErrors({});
    setSelectedPatientId(pat.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'is_active' ? value === 'true' : value;
    setFormData({ ...formData, [name]: val });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!isEditing && !formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone || null,
      role: 'PATIENT',
      hospital_id: formData.hospital_id || null,
      is_active: formData.is_active
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (isEditing) {
        await api.updateUser(selectedPatientId, payload);
      } else {
        await api.createUser(payload);
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save patient details.' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivation = async (pat) => {
    try {
      if (pat.is_active) {
        await api.deactivateUser(pat.id);
      } else {
        await api.activateUser(pat.id);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update activation status.');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading patients list...</span>
      </div>
    );
  }

  const hospitalOptions = [
    { value: '', label: 'None (Independent)' },
    ...hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Registered Patients</h2>
          <p className="text-xs text-slate-500">Access patient profile credentials, clinical history references, and activation states.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 w-full text-sm border border-slate-250 rounded bg-white focus:outline-none focus:ring-1 focus:ring-medical-500"
            />
          </div>
          <Button size="md" variant="secondary" onClick={fetchData} className="flex items-center justify-center px-3">
            <RefreshCw size={14} />
          </Button>
          <Button size="md" variant="medical" onClick={openAddModal} className="flex items-center gap-1.5 shrink-0">
            <Plus size={16} />
            <span>Add Patient</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {filteredPatients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <User size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Patients Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {search ? 'Try checking spelling or resetting your search filter.' : 'Click "Add Patient" to create a new profile.'}
          </p>
        </div>
      ) : (
        <Table headers={['Patient Name', 'Email Address', 'Phone Number', 'Associated Hospital', 'Status', 'Actions']}>
          {filteredPatients.map((pat) => (
            <tr key={pat.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center border border-sky-100 flex-shrink-0">
                    <User size={16} />
                  </div>
                  <span className="font-semibold text-slate-800">{pat.full_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-650 text-xs">{pat.email}</td>
              <td className="px-4 py-3 text-slate-650 text-xs">{pat.phone || '-'}</td>
              <td className="px-4 py-3 text-slate-655 text-xs">
                {pat.hospital ? `${pat.hospital.hospital_name} (${pat.hospital.branch_name})` : 'Independent'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={pat.is_active ? 'success' : 'gray'}>
                  {pat.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(pat)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActivation(pat)}>
                    {pat.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Reusable Modal & Form */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={isEditing ? 'Edit Patient Account' : 'Add New Patient Account'} 
        icon={User}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <Input
            label="Full Name"
            name="full_name"
            placeholder="e.g. Suresh Kumar"
            value={formData.full_name}
            onChange={handleInputChange}
            error={formErrors.full_name}
            disabled={isSaving}
            required
          />

          <Input
            label="Email Address (Username)"
            name="email"
            type="email"
            placeholder="e.g. suresh.kumar@gmail.com"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            disabled={isSaving}
            required
          />

          <FormGroup>
            <Input
              label="Contact Phone"
              name="phone"
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isSaving}
            />
            <Input
              label={isEditing ? "Change Password (Optional)" : "Password"}
              name="password"
              type="password"
              placeholder={isEditing ? "Leave blank to keep same" : "Minimum 6 characters"}
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              disabled={isSaving}
              required={!isEditing}
            />
          </FormGroup>

          <FormGroup>
            <Select
              label="Associated Hospital Branch"
              name="hospital_id"
              value={formData.hospital_id}
              onChange={handleInputChange}
              options={hospitalOptions}
              disabled={isSaving}
            />
            <Select
              label="Account State"
              name="is_active"
              value={formData.is_active.toString()}
              onChange={handleInputChange}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
              ]}
              disabled={isSaving}
            />
          </FormGroup>

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Account'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  );
};
