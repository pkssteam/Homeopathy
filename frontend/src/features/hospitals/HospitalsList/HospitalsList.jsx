import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { Plus, Building, Edit, RefreshCw } from 'lucide-react';
import './HospitalsList.css';

export const HospitalsList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    hospital_code: '',
    hospital_name: '',
    branch_name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    contact_number: '',
    email: '',
    status: 'Active'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getHospitals();
      setHospitals(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch hospitals list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const openAddModal = () => {
    setFormData({
      hospital_code: '',
      hospital_name: '',
      branch_name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      contact_number: '',
      email: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsEditing(false);
    setIsOpen(true);
  };

  const openEditModal = (hosp) => {
    setFormData({
      hospital_code: hosp.hospital_code,
      hospital_name: hosp.hospital_name,
      branch_name: hosp.branch_name,
      address: hosp.address,
      city: hosp.city,
      state: hosp.state,
      country: hosp.country,
      postal_code: hosp.postal_code,
      contact_number: hosp.contact_number,
      email: hosp.email,
      status: hosp.status
    });
    setFormErrors({});
    setSelectedHospitalId(hosp.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.hospital_code.trim()) errors.hospital_code = 'Hospital code is required';
    if (!formData.hospital_name.trim()) errors.hospital_name = 'Hospital name is required';
    if (!formData.branch_name.trim()) errors.branch_name = 'Branch name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.contact_number.trim()) errors.contact_number = 'Contact number is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      if (isEditing) {
        await api.updateHospital(selectedHospitalId, formData);
      } else {
        await api.createHospital(formData);
      }
      setIsOpen(false);
      fetchHospitals();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to save hospital details.' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (hosp) => {
    const newStatus = hosp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patchHospital(hosp.id, { status: newStatus });
      fetchHospitals();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading hospitals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hospital Locations</h2>
          <p className="text-xs text-slate-500">Manage homeopathy branches, registered locations, and contact details.</p>
        </div>
        <div className="flex gap-2">
          <Button size="md" variant="secondary" onClick={fetchHospitals} className="flex items-center justify-center px-3">
            <RefreshCw size={14} />
          </Button>
          <Button size="md" variant="medical" onClick={openAddModal} className="flex items-center gap-1.5">
            <Plus size={16} />
            <span>Register Branch</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {hospitals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Building size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Hospitals Registered</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Click the "Register Branch" button above to add your first clinic or hospital location.
          </p>
        </div>
      ) : (
        <Table headers={['Code', 'Hospital & Branch', 'Location', 'Contact', 'Status', 'Actions']}>
          {hospitals.map((hosp) => (
            <tr key={hosp.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-500 text-xs">{hosp.hospital_code}</td>
              <td className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 w-6 h-6 bg-green-50 text-green-600 rounded flex items-center justify-center border border-green-100 flex-shrink-0">
                    <Building size={14} />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block leading-tight">{hosp.hospital_name}</span>
                    <span className="text-xs text-slate-500">{hosp.branch_name}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-slate-700 text-xs block font-medium">{hosp.city}, {hosp.state}</span>
                <span className="text-[10px] text-slate-400 block leading-none">{hosp.address}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-slate-700 text-xs block">{hosp.contact_number}</span>
                <span className="text-[10px] text-slate-400 block leading-none">{hosp.email}</span>
              </td>
              <td className="px-4 py-3">
                <Badge variant={hosp.status === 'Active' ? 'success' : 'gray'}>
                  {hosp.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEditModal(hosp)} className="flex items-center gap-1">
                    <Edit size={12} />
                    <span>Edit</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(hosp)} className="text-xs">
                    {hosp.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Reusable Modal Component */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={isEditing ? 'Edit Hospital Location' : 'Register New Hospital Branch'} 
        icon={Building}
      >
        <Form onSubmit={handleSave} error={formErrors.api}>
          <FormGroup>
            <Input
              label="Hospital Code"
              name="hospital_code"
              placeholder="e.g. HMC-01"
              value={formData.hospital_code}
              onChange={handleInputChange}
              error={formErrors.hospital_code}
              disabled={isSaving}
              required
            />
            <Input
              label="Hospital Name"
              name="hospital_name"
              placeholder="e.g. Homeopathy Medical Center"
              value={formData.hospital_name}
              onChange={handleInputChange}
              error={formErrors.hospital_name}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Branch Name"
              name="branch_name"
              placeholder="e.g. Central Clinic / South Wing"
              value={formData.branch_name}
              onChange={handleInputChange}
              error={formErrors.branch_name}
              disabled={isSaving}
              required
            />
            <Input
              label="Contact Phone"
              name="contact_number"
              placeholder="e.g. +91 98765 43210"
              value={formData.contact_number}
              onChange={handleInputChange}
              error={formErrors.contact_number}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. contact@branch.com"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              disabled={isSaving}
              required
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
              disabled={isSaving}
            />
          </FormGroup>

          <Input
            label="Full Street Address"
            name="address"
            placeholder="e.g. 123 Health Ave, Suite 400"
            value={formData.address}
            onChange={handleInputChange}
            error={formErrors.address}
            disabled={isSaving}
            required
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="City"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleInputChange}
              error={formErrors.city}
              disabled={isSaving}
              required
            />
            <Input
              label="State"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleInputChange}
              error={formErrors.state}
              disabled={isSaving}
              required
            />
            <Input
              label="Country"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleInputChange}
              disabled={isSaving}
              required
            />
            <Input
              label="Postal Code"
              name="postal_code"
              placeholder="PIN/Zip"
              value={formData.postal_code}
              onChange={handleInputChange}
              disabled={isSaving}
            />
          </div>

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Location'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  );
};
