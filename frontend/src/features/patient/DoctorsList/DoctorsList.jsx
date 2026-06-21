import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { RefreshCw, Stethoscope, Search } from 'lucide-react';
import './DoctorsList.css';

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers('DOCTOR');
      setDoctors(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDoctors = doctors.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.full_name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.hospital?.hospital_name?.toLowerCase().includes(q) ||
      d.hospital?.branch_name?.toLowerCase().includes(q)
    );
  });

  if (loading && doctors.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading doctors list...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Homeopathic Practitioners</h2>
          <p className="text-xs text-slate-500">View contact details and clinic branch locations for our consulting doctors.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 py-1.5 w-full text-sm rounded border border-slate-200"
            />
          </div>
          <Button size="md" variant="secondary" onClick={fetchData}>
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {filteredDoctors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Stethoscope size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Doctors Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            We currently do not have any registered practitioners matching your filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-lg p-5 flex items-start gap-4">
              <div className="w-12 h-12 bg-medical-50 text-medical-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Stethoscope size={24} />
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{doc.full_name}</h4>
                  <p className="text-xs text-slate-500">Consultant Homeopathic Practitioner</p>
                </div>
                <div className="text-xs text-slate-650 space-y-1">
                  <p><strong>Email:</strong> {doc.email}</p>
                  <p><strong>Phone:</strong> {doc.phone || '-'}</p>
                  <p><strong>Branch:</strong> {doc.hospital ? `${doc.hospital.hospital_name} (${doc.hospital.branch_name})` : 'All Branches'}</p>
                </div>
                <Badge variant={doc.is_active ? 'success' : 'gray'}>
                  {doc.is_active ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
