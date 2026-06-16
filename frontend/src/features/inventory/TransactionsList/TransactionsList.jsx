import React from 'react';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import './TransactionsList.css';

export const TransactionsList = () => {
  const transactions = [
    { id: 'TX-901', item: 'Arnica Montana 200C', type: 'Dispensed', qty: '-1 vial', date: '2026-06-16', rep: 'Rep Jane Doe' },
    { id: 'TX-902', item: 'Nux Vomica 30C', type: 'Refill', qty: '+50 vials', date: '2026-06-15', rep: 'Rep Jane Doe' },
    { id: 'TX-903', item: 'Belladonna 200C', type: 'Dispensed', qty: '-1 vial', date: '2026-06-14', rep: 'System Auto' },
    { id: 'TX-904', item: 'Thuja Occidentalis 1M', type: 'Audit Correction', qty: '+2 vials', date: '2026-06-10', rep: 'Rep Jane Doe' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inventory Transactions Log</h2>
        <p className="text-xs text-slate-500">Audit trail of dilution dispensations, warehouse restocks, and balance adjustments.</p>
      </div>

      <Table headers={['Transaction ID', 'Remedy Item', 'Activity Type', 'Quantity Delta', 'Date Logged', 'Processor']}>
        {transactions.map((tx) => (
          <tr key={tx.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{tx.id}</td>
            <td className="px-4 py-3 font-semibold text-slate-800">{tx.item}</td>
            <td className="px-4 py-3">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                tx.type === 'Refill' ? 'text-green-700' : 
                tx.type === 'Dispensed' ? 'text-red-700' : 'text-slate-650'
              }`}>
                {tx.type === 'Refill' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                {tx.type}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-800 font-bold">{tx.qty}</td>
            <td className="px-4 py-3 text-slate-600">{tx.date}</td>
            <td className="px-4 py-3 text-slate-650 font-medium">{tx.rep}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
