import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import { api } from '../../../services/api';
import { Package, AlertTriangle, FileCheck, ArrowLeftRight } from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    pendingRequests: 0,
    transactions: 8
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const inv = await api.getInventory();
        const prs = await api.getPrescriptions();
        
        const low = inv.filter(i => i.stock < 25);
        const pending = prs.filter(p => p.status === 'Pending').length;

        setStats({
          totalItems: inv.length,
          lowStock: low.length,
          pendingRequests: pending,
          transactions: 12
        });
        setLowStockItems(low);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryData();
  }, []);

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading inventory dashboard overview...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-900">Inventory Management Portal</h2>
        <p className="text-xs text-slate-500">Welcome, Inventory Rep. Track dilution stocks, process prescription order requests, and monitor logs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-sky-650" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">{stats.totalItems}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-650" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">{stats.lowStock}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <FileCheck size={20} className="text-amber-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Orders</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">{stats.pendingRequests}</span>
        </Card>
        <Card className="p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={20} className="text-green-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-semibold">Transactions Logged</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">{stats.transactions}</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card title="Low Stock Dilutions Alert">
            <div className="space-y-3">
              {lowStockItems.length > 0 ? lowStockItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border border-red-100 rounded bg-red-50/30">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.category} • Current Stock: {item.stock} {item.unit}</p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full border border-red-200 bg-red-100/50 text-red-700">
                    {item.status}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-green-700 font-semibold py-2">✓ All dilution and remedy stocks are above warning levels.</p>
              )}
            </div>
          </Card>
        </div>
        <div>
          <Card title="System Actions">
            <ul className="space-y-2.5 text-xs text-slate-655 pl-4 list-disc">
              <li>Inspect incoming prescription requests in the orders tab.</li>
              <li>Perform weekly audit check on Mother Tincture vials.</li>
              <li>Verify assigned doctors catalog.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
