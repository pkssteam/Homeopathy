import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { Plus, User, Stethoscope, RefreshCw } from 'lucide-react';
import './DoctorsList.css';

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'DOCTOR',
    hospital_id: '',
    is_active: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [doctorsData, hospitalsData] = await Promise.all([
        api.getUsers('DOCTOR'),
        api.getHospitals()
      ]);
      setDoctors(doctorsData);
      setHospitals(hospitalsData.filter(h => h.status === 'Active'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch doctor accounts.');
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
      role: 'DOCTOR',
      hospital_id: hospitals[0]?.id || '',
      is_active: true
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (doc) => {
    setFormData({
      full_name: doc.full_name,
      email: doc.email,
      phone: doc.phone || '',
      password: '', // blank password means no change
      role: 'DOCTOR',
      hospital_id: doc.hospital?.id || '',
      is_active: doc.is_active
    });
    setFormErrors({});
    setSelectedDoctorId(doc.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Support boolean status conversions if status or is_active fields are used
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
      role: 'DOCTOR',
      hospital_id: formData.hospital_id || null,
      is_active: formData.is_active
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (isEditing) {
        await api.updateUser(selectedDoctorId, payload);
      } else {
        await api.createUser(payload);
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save doctor details.' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivation = async (doc) => {
    try {
      if (doc.is_active) {
        await api.deactivateUser(doc.id);
      } else {
        await api.activateUser(doc.id);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update activation status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading doctors list...</span>
      </div>
    );
  }

  const hospitalOptions = [
    { value: '', label: 'None (Independent)' },
    ...hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Medical Practitioners</h2>
          <p className="text-xs text-slate-500">Manage doctor credentials, clinical assignments, and active states.</p>
        </div>
        <div className="flex gap-2">
          <Button size="md" variant="secondary" onClick={fetchData} className="flex items-center justify-center px-3">
            <RefreshCw size={14} />
          </Button>
          <Button size="md" variant="medical" onClick={openAddModal} className="flex items-center gap-1.5">
            <Plus size={16} />
            <span>Add Doctor</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {doctors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Stethoscope size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Doctors Registered</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Click the "Add Doctor" button above to add a new clinical practitioner account.
          </p>
        </div>
      ) : (
        <Table headers={['Full Name', 'Email Address', 'Phone Number', 'Associated Hospital', 'Status', 'Actions']}>
          {doctors.map((doc) => (
            <tr key={doc.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center border border-sky-100 flex-shrink-0">
                    <User size={16} />
                  </div>
                  <span className="font-semibold text-slate-800">{doc.full_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-650 text-xs">{doc.email}</td>
              <td className="px-4 py-3 text-slate-650 text-xs">{doc.phone || '-'}</td>
              <td className="px-4 py-3 text-slate-655 text-xs">
                {doc.hospital ? `${doc.hospital.hospital_name} (${doc.hospital.branch_name})` : 'Independent'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={doc.is_active ? 'success' : 'gray'}>
                  {doc.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(doc)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActivation(doc)}>
                    {doc.is_active ? 'Deactivate' : 'Activate'}
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
        title={isEditing ? 'Edit Doctor Account' : 'Add New Doctor Account'} 
        icon={Stethoscope}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <Input
            label="Full Name"
            name="full_name"
            placeholder="e.g. Dr. Rajesh Sharma"
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
            placeholder="e.g. rajesh.sharma@homeopathy.com"
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
              placeholder="e.g. +91 99887 76655"
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
