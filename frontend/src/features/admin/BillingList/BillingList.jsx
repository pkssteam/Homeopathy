import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Card } from '../../../components/ui/Card/Card';
import { Plus, Receipt } from 'lucide-react';
import './BillingList.css';

export const BillingList = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [patientName, setPatientName] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Unpaid');

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await api.getBills();
        setBills(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!patientName || !amount) return;

    const newBill = {
      patientName,
      total: parseFloat(amount),
      status,
      method: status === 'Paid' ? 'Cash' : '-'
    };

    try {
      const saved = await api.createBill(newBill);
      setBills([...bills, saved]);
      setPatientName('');
      setAmount('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = (billNo) => {
    setBills(bills.map(b => {
      if (b.billNo === billNo) {
        return { ...b, status: 'Paid', method: 'Card' };
      }
      return b;
    }));
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading billing invoices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing & Invoices</h2>
          <p className="text-xs text-slate-500">Collect consultation fees, issue prescriptions invoices, and track cashflow payments.</p>
        </div>
        <Button size="md" variant="medical" onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1.5">
          <Plus size={16} />
          <span>New Invoice</span>
        </Button>
      </div>

      {showAddForm && (
        <Card title="Issue New Invoice">
          <form onSubmit={handleCreateBill} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input 
              label="Patient Name" 
              placeholder="e.g. Rohan Verma" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)} 
              required 
            />
            <Input 
              label="Total Fee ($)" 
              type="number"
              step="0.01"
              placeholder="e.g. 50.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
            />
            <Select 
              label="Payment Status" 
              options={[
                { value: 'Unpaid', label: 'Unpaid (Collect Later)' },
                { value: 'Paid', label: 'Paid Immediately' }
              ]}
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
            />
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Issue Invoice</Button>
            </div>
          </form>
        </Card>
      )}

      <Table headers={['Invoice No', 'Patient Name', 'Bill Date', 'Method', 'Total Amount', 'Status', 'Actions']}>
        {bills.map((bill) => (
          <tr key={bill.billNo} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{bill.billNo}</td>
            <td className="px-4 py-3 font-semibold text-slate-800">{bill.patientName}</td>
            <td className="px-4 py-3 text-slate-600">{bill.date}</td>
            <td className="px-4 py-3 text-slate-600 font-semibold">{bill.method}</td>
            <td className="px-4 py-3 font-semibold text-slate-900">${bill.total.toFixed(2)}</td>
            <td className="px-4 py-3">
              <Badge variant={bill.status === 'Paid' ? 'success' : 'danger'}>
                {bill.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              {bill.status === 'Unpaid' ? (
                <Button size="sm" variant="secondary" onClick={() => handleCheckout(bill.billNo)}>
                  Collect Payment
                </Button>
              ) : (
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <Receipt size={12} />
                  Receipt Issued
                </span>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
