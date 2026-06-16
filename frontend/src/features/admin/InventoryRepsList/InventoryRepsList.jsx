import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { Plus, User, Package, RefreshCw } from 'lucide-react';
import './InventoryRepsList.css';

export const InventoryRepsList = () => {
  const [reps, setReps] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRepId, setSelectedRepId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'INVENTORY_REP',
    hospital_id: '',
    is_active: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [repsData, hospitalsData] = await Promise.all([
        api.getUsers('INVENTORY_REP'),
        api.getHospitals()
      ]);
      setReps(repsData);
      setHospitals(hospitalsData.filter(h => h.status === 'Active'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch inventory reps.');
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
      role: 'INVENTORY_REP',
      hospital_id: hospitals[0]?.id || '',
      is_active: true
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (rep) => {
    setFormData({
      full_name: rep.full_name,
      email: rep.email,
      phone: rep.phone || '',
      password: '', // blank password means no change
      role: 'INVENTORY_REP',
      hospital_id: rep.hospital?.id || '',
      is_active: rep.is_active
    });
    setFormErrors({});
    setSelectedRepId(rep.id);
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
      role: 'INVENTORY_REP',
      hospital_id: formData.hospital_id || null,
      is_active: formData.is_active
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (isEditing) {
        await api.updateUser(selectedRepId, payload);
      } else {
        await api.createUser(payload);
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save rep details.' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivation = async (rep) => {
    try {
      if (rep.is_active) {
        await api.deactivateUser(rep.id);
      } else {
        await api.activateUser(rep.id);
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
        <span className="ml-3 text-slate-500 text-sm">Loading inventory reps...</span>
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
          <h2 className="text-xl font-bold text-slate-900">Inventory Representatives</h2>
          <p className="text-xs text-slate-500">Manage representative access, store assignments, and active credential states.</p>
        </div>
        <div className="flex gap-2">
          <Button size="md" variant="secondary" onClick={fetchData} className="flex items-center justify-center px-3">
            <RefreshCw size={14} />
          </Button>
          <Button size="md" variant="medical" onClick={openAddModal} className="flex items-center gap-1.5">
            <Plus size={16} />
            <span>Add Rep</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {reps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Package size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Representatives Registered</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Click the "Add Rep" button above to add a new inventory representative account.
          </p>
        </div>
      ) : (
        <Table headers={['Representative Name', 'Email Address', 'Phone Number', 'Associated Hospital', 'Status', 'Actions']}>
          {reps.map((rep) => (
            <tr key={rep.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center border border-sky-100 flex-shrink-0">
                    <User size={16} />
                  </div>
                  <span className="font-semibold text-slate-800">{rep.full_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-650 text-xs">{rep.email}</td>
              <td className="px-4 py-3 text-slate-650 text-xs">{rep.phone || '-'}</td>
              <td className="px-4 py-3 text-slate-655 text-xs">
                {rep.hospital ? `${rep.hospital.hospital_name} (${rep.hospital.branch_name})` : 'Independent'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={rep.is_active ? 'success' : 'gray'}>
                  {rep.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(rep)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActivation(rep)}>
                    {rep.is_active ? 'Deactivate' : 'Activate'}
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
        title={isEditing ? 'Edit Representative Account' : 'Add New Representative Account'} 
        icon={Package}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <Input
            label="Full Name"
            name="full_name"
            placeholder="e.g. Amit Patel"
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
            placeholder="e.g. amit.patel@homeopathy.com"
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
              placeholder="e.g. +91 97766 55443"
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
