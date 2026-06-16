import React from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { FileText, ArrowUpRight, Award, TrendingUp } from 'lucide-react';
import './ReportsList.css';

export const ReportsList = () => {
  const popularRemedies = [
    { rank: 1, name: 'Arnica Montana', dilutions: '200C, 30C', uses: 'Bruises, muscle soreness, joint swelling', prescribed: 45 },
    { rank: 2, name: 'Nux Vomica', dilutions: '30C, 200C', uses: 'Indigestion, stress, sleep issues', prescribed: 38 },
    { rank: 3, name: 'Belladonna', dilutions: '200C', uses: 'Sudden high fever, throbbing headaches', prescribed: 29 },
    { rank: 4, name: 'Thuja Occidentalis', dilutions: '1M, 200C', uses: 'Warts, skin tag growths, skin inflammation', prescribed: 22 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Hospital Intelligence & Reports</h2>
        <p className="text-xs text-slate-500">Analyze remedy dispensation metrics, physician workloads, and operational outputs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-450 uppercase block">Monthly Consultations</span>
            <span className="text-2xl font-bold text-slate-800">184 Cases</span>
            <span className="text-xs text-green-600 font-semibold block mt-1">↑ 12% vs last month</span>
          </div>
          <div className="w-10 h-10 rounded bg-sky-50 text-sky-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-450 uppercase block">Top Remedy Dilution</span>
            <span className="text-2xl font-bold text-slate-800">Arnica 200C</span>
            <span className="text-xs text-slate-500 block mt-1">Prescribed 45 times</span>
          </div>
          <div className="w-10 h-10 rounded bg-green-50 text-green-600 flex items-center justify-center">
            <Award size={20} />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-450 uppercase block">Patient Discharge Rate</span>
            <span className="text-2xl font-bold text-slate-800">94.8%</span>
            <span className="text-xs text-green-600 font-semibold block mt-1">Excellent recovery reviews</span>
          </div>
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight size={20} />
          </div>
        </Card>
      </div>

      <Card title="Top Prescribed Homeopathy Remedies (This Month)">
        <Table headers={['Rank', 'Remedy Name', 'Common Dilutions', 'Primary Treatment Scope', 'Prescribed Cases']}>
          {popularRemedies.map((rem) => (
            <tr key={rem.rank} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-bold text-slate-500">#{rem.rank}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <FileText size={14} className="text-slate-400" />
                  <span>{rem.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600 font-semibold">{rem.dilutions}</td>
              <td className="px-4 py-3 text-slate-600">{rem.uses}</td>
              <td className="px-4 py-3 text-center font-bold text-slate-800">{rem.prescribed} times</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};
