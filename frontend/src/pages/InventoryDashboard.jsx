import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { ProfileList } from '../features/admin/ProfileList/ProfileList';
import { Card } from '../components/ui/Card/Card';
import { Table } from '../components/ui/Table/Table';
import { Badge } from '../components/ui/Badge/Badge';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { ShieldCheck, Package, Users, FileText, ArrowLeftRight, Bell, AlertTriangle } from 'lucide-react';
import { InventoryList } from '../features/inventory/InventoryList/InventoryList';

export const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('active_tab_inventory') || 'dashboard';
  });
  const { user } = useAuth();
  
  const [items, setItems] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory();
      setItems(data);
    } catch (err) {
      console.error('Failed to load dashboard inventory stats:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    sessionStorage.setItem('active_tab_inventory', activeTab);
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'assigned_doctors') {
      api.getUsers('DOCTOR').then(res => setDoctorsList(res)).catch(console.error);
    }
  }, [activeTab]);

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':
        const totalItems = items.length;
        const lowStockItems = items.filter(i => i.stock > 0 && i.stock <= 10);
        const outOfStockItems = items.filter(i => i.stock === 0);
        const totalVials = items.reduce((sum, item) => sum + (item.stock || 0), 0);

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="dashboard-hero-banner">
              <span className="hero-banner-role">Dispensary Stock Control Desk</span>
              <h3 className="hero-banner-title">Welcome Back, {user?.full_name || 'Inventory Rep'}</h3>
              <p className="hero-banner-subtitle">Monitor clinical dilution stock levels, Mother Tincture vials, and refill queues.</p>
              <div className="hero-banner-stats">
                <div className="hero-stat-pill">
                  <span className="hero-stat-icon">📦</span>
                  <span>{totalVials} Total Vials</span>
                </div>
                <div className="hero-stat-pill">
                  <span className="hero-stat-icon">⚠️</span>
                  <span>{lowStockItems.length + outOfStockItems.length} Warnings</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{totalItems}</div>
                  <div className="text-xs text-slate-500">Total Medicines</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{lowStockItems.length}</div>
                  <div className="text-xs text-slate-500">Low Stock Items</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{outOfStockItems.length}</div>
                  <div className="text-xs text-slate-500">Out of Stock</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <ArrowLeftRight size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">0</div>
                  <div className="text-xs text-slate-500">Today's Transactions</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Portal Authentication">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-700 font-semibold bg-green-50 border border-green-200 p-3 rounded">
                    <ShieldCheck size={20} />
                    <span>Inventory Rep Session Verified</span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-2">
                    <p><strong>Name:</strong> {user?.full_name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                  </div>
                </div>
              </Card>

              <Card title="Low Stock & Out of Stock Alerts">
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {outOfStockItems.length === 0 && lowStockItems.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      All remedy stock levels are healthy!
                    </div>
                  ) : (
                    <>
                      {outOfStockItems.map(item => (
                        <div key={item.id} className="p-3 border border-red-200 bg-red-50/50 rounded flex-shrink-0 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="text-red-600" size={16} />
                            <span className="text-xs font-semibold text-red-800">{item.name}</span>
                          </div>
                          <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">OUT OF STOCK</span>
                        </div>
                      ))}
                      {lowStockItems.map(item => (
                        <div key={item.id} className="p-3 border border-yellow-200 bg-yellow-50/50 rounded flex-shrink-0 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="text-yellow-600" size={16} />
                            <span className="text-xs font-semibold text-yellow-800">{item.name}</span>
                          </div>
                          <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">{item.stock} {item.unit || 'vials'} LEFT</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );
      case 'assigned_doctors':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Assigned Doctors & Dispensary Requests</h2>
              <p className="text-xs text-slate-500">View consulting practitioners requesting inventory stocks.</p>
            </div>
            {doctorsList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 text-sm">
                No active practitioners found on site.
              </div>
            ) : (
              <Table headers={['Doctor Name', 'Email', 'Phone', 'Branch Status']}>
                {doctorsList.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800 text-sm">{doc.full_name}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{doc.email}</td>
                    <td className="px-4 py-3 text-slate-650 text-xs">{doc.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={doc.is_active ? 'success' : 'gray'}>
                        {doc.is_active ? 'On Duty' : 'Off Duty'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        );
      case 'inventory':
        return <InventoryList />;
      case 'prescription_requests':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">Prescription Refill Requests</h2>
            <p className="text-xs text-slate-500">Fulfill remedies ordered by practitioners during patient consultations.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              Refill request tickets queue will be enabled in Phase 4.
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">Dispensary Stock Transactions</h2>
            <p className="text-xs text-slate-500">Audit logs of restock additions and patient dispensations.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              Chronological audit log sheets will be enabled in Phase 4.
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900">Inventory Expiry & Low Stock Reports</h2>
            <p className="text-xs text-slate-500">Generate sheets of warning items nearing low threshold.</p>
            <div className="bg-white p-8 border border-slate-200 rounded-lg text-center text-slate-500 text-sm">
              PDF/CSV inventory exports will be enabled in Phase 4.
            </div>
          </div>
        );
      case 'profile':
        return <ProfileList />;
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderSection()}
    </Layout>
  );
};
