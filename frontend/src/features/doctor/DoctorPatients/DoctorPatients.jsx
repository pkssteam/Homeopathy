import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { RefreshCw, Users, Search } from 'lucide-react';
import './DoctorPatients.css';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers('PATIENT');
      setPatients(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load patient directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-medical-600"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading patient records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Directory</h2>
          <p className="text-xs text-slate-500">Search and view active medical files registered under the clinic branches.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 py-1.5 w-full text-xs rounded border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
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

      {filteredPatients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Users size={24} />
          </div>
          <h3 className="font-semibold text-slate-700">No Patients Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search queries or contact the admin panel to register new patients.
          </p>
        </div>
      ) : (
        <Table headers={['Full Name', 'Email Address', 'Phone Number', 'Status', 'Date Registered']}>
          {filteredPatients.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-805 text-sm">{p.full_name}</td>
              <td className="px-4 py-3 text-slate-655 text-xs">{p.email}</td>
              <td className="px-4 py-3 text-slate-600 text-xs">{p.phone || '-'}</td>
              <td className="px-4 py-3">
                <Badge variant={p.is_active ? 'success' : 'gray'}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};
