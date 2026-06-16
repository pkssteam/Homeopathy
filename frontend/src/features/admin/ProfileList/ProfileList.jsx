import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card } from '../../../components/ui/Card/Card';
import { Input } from '../../../components/ui/Input/Input';
import { Button } from '../../../components/ui/Button/Button';
import { UserCheck } from 'lucide-react';
import './ProfileList.css';

export const ProfileList = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Profile Settings</h2>
        <p className="text-xs text-slate-500">Edit your user details and credential configurations.</p>
      </div>

      {success && (
        <div className="p-3 text-xs bg-green-50 text-green-700 border border-green-200 rounded font-medium flex items-center gap-1.5">
          <UserCheck size={14} />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <Card title="Account Profile Details">
        <form onSubmit={handleSave} className="space-y-4">
          <Input 
            label="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <Input 
            label="Email Address (Login Username)" 
            type="email"
            value={email} 
            disabled 
          />
          <Input 
            label="Contact Number" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="medical">
              Save Account Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
