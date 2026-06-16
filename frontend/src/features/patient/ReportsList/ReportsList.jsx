import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Card } from '../../../components/ui/Card/Card';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { FileText, Download } from 'lucide-react';
import './ReportsList.css';

export const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.getReports();
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading reports database...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Medical Lab & Case Reports</h2>
        <p className="text-xs text-slate-500">Download and review diagnosis reports, symptom reports, and test files.</p>
      </div>

      <Table headers={['Report ID', 'Report Title', 'Issued Date', 'Physician', 'Status', 'Actions']}>
        {reports.map((rep) => (
          <tr key={rep.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{rep.id}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{rep.title}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600">{rep.date}</td>
            <td className="px-4 py-3 text-slate-650">{rep.doctorName}</td>
            <td className="px-4 py-3">
              <Badge variant="success">
                {rep.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="secondary" className="flex items-center gap-1">
                <Download size={12} />
                <span>Download PDF</span>
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
