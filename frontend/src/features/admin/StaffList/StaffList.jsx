import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { Plus, User, UserCheck, RefreshCw } from 'lucide-react';

export const StaffList = () => {
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'DOCTOR',
    hospital_id: ''
  });
  
  const [formErrors, setFormErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, hospitalsData] = await Promise.all([
        api.getUsers(),
        api.getHospitals()
      ]);
      setUsers(usersData);
      setHospitals(hospitalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch data.');
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
      hospital_id: hospitals[0]?.id || ''
    });
    setFormErrors({});
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
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    // Prepare data payload (empty hospital_id should be sent as null/empty)
    const payload = {
      ...formData,
      hospital_id: formData.hospital_id || null
    };

    try {
      await api.createUser(payload);
      setIsOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormErrors({ api: err.message || 'Failed to register account.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading staff list...</span>
      </div>
    );
  }

  const roleOptions = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'PATIENT', label: 'Patient' },
    { value: 'INVENTORY_REP', label: 'Inventory Representative' }
  ];

  const hospitalOptions = [
    { value: '', label: 'None (Independent)' },
    ...hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User & Staff Accounts</h2>
          <p className="text-xs text-slate-500">View registered portal users, doctor profiles, and support team credentials.</p>
        </div>
        <div className="flex gap-2">
          <Button size="md" variant="secondary" onClick={fetchData} className="flex items-center justify-center px-3">
            <RefreshCw size={14} />
          </Button>
          <Button size="md" variant="medical" onClick={openAddModal} className="flex items-center gap-1.5">
            <Plus size={16} />
            <span>Register Account</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <Table headers={['Full Name', 'Email Address', 'Phone Number', 'Associated Hospital', 'Role', 'Status']}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center border border-sky-100 flex-shrink-0">
                  <User size={16} />
                </div>
                <span className="font-semibold text-slate-800">{u.full_name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600 text-xs">{u.email}</td>
            <td className="px-4 py-3 text-slate-600 text-xs">{u.phone || '-'}</td>
            <td className="px-4 py-3 text-slate-600 text-xs">
              {u.hospital ? `${u.hospital.hospital_name} (${u.hospital.branch_name})` : 'None'}
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wider ${
                u.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                u.role === 'DOCTOR' ? 'bg-medical-50 text-medical-700 border-medical-250' :
                u.role === 'INVENTORY_REP' ? 'bg-amber-50 text-amber-700 border-amber-250' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {u.role.replace('_', ' ')}
              </span>
            </td>
            <td className="px-4 py-3">
              <Badge variant={u.is_active ? 'success' : 'gray'}>
                {u.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>

      {/* Register User Reusable Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Register Staff Account" 
        icon={UserCheck}
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
            placeholder="e.g. rajesh@homeopathy.com"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            disabled={isSaving}
            required
          />

          <Input
            label="Contact Phone"
            name="phone"
            placeholder="e.g. +91 99887 76655"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={isSaving}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleInputChange}
            error={formErrors.password}
            disabled={isSaving}
            required
          />

          <FormGroup>
            <Select
              label="Role Access"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              options={roleOptions}
              disabled={isSaving}
            />
            <Select
              label="Associated Hospital Branch"
              name="hospital_id"
              value={formData.hospital_id}
              onChange={handleInputChange}
              options={hospitalOptions}
              disabled={isSaving}
            />
          </FormGroup>

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="medical" disabled={isSaving}>
              {isSaving ? 'Registering...' : 'Register User'}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </div>
  );
};
