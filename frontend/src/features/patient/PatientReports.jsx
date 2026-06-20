import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Table } from '../../components/ui/Table/Table';
import { FileText, Download, Search } from 'lucide-react';

export const PatientReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.getConsultations();
        const list = [];
        data.forEach(consult => {
          if (consult.reports) {
            consult.reports.forEach(r => {
              list.push({
                ...r,
                doctorName: consult.doctor_detail?.full_name,
                date: new Date(consult.created_at).toLocaleDateString()
              });
            });
          }
        });
        setReports(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filtered = reports.filter(r => 
    r.report_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-slate-500 text-sm">Loading reports...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lab & Treatment Reports</h2>
          <p className="text-xs text-slate-500">View and download diagnostic tests and digital assessment folders uploaded by your consulting doctor.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          <FileText className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="font-semibold text-slate-700">No medical reports found.</p>
          <p className="text-xs mt-1 text-slate-400">All medical files and lab tests will be stored and listed here.</p>
        </div>
      ) : (
        <Table headers={['Date Uploaded', 'Report Name', 'Uploaded By', 'Download / Preview']}>
          {filtered.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 text-slate-500 text-xs font-semibold">{r.date}</td>
              <td className="px-4 py-3 font-semibold text-slate-800 text-sm flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <span>{r.report_name}</span>
              </td>
              <td className="px-4 py-3 text-slate-650 text-xs">Dr. {r.doctorName}</td>
              <td className="px-4 py-3">
                <a
                  href={`http://localhost:8000${r.report_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 font-semibold text-xs hover:border-indigo-200 transition-colors"
                >
                  <Download size={12} />
                  <span>Download Report</span>
                </a>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};
