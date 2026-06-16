import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Table } from '../../../components/ui/Table/Table';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Card } from '../../../components/ui/Card/Card';
import { Edit3, Package2 } from 'lucide-react';
import './InventoryList.css';

export const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await api.getInventory();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const handleEditClick = (item) => {
    setEditingItem(item);
    setNewStock(item.stock.toString());
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!editingItem || newStock === '') return;

    try {
      const updated = await api.updateStock(editingItem.id, parseInt(newStock));
      setItems(items.map(i => i.id === editingItem.id ? { ...i, stock: updated.stock, status: updated.status } : i));
      setEditingItem(null);
      setNewStock('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-slate-500 text-sm">Loading pharmacy inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pharmacy Inventory Logs</h2>
          <p className="text-xs text-slate-500">Record stock counts, edit remedy batches, and update prices.</p>
        </div>
      </div>

      {editingItem && (
        <Card title={`Adjust Stock Balance: ${editingItem.name}`}>
          <form onSubmit={handleUpdateStock} className="flex flex-col sm:flex-row gap-4 items-end max-w-lg">
            <Input 
              label={`Adjust Stock Quantity (${editingItem.unit})`} 
              type="number"
              placeholder="e.g. 50" 
              value={newStock} 
              onChange={(e) => setNewStock(e.target.value)} 
              required 
            />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      <Table headers={['Item ID', 'Medicine Name', 'Category', 'Stock Level', 'Unit Price', 'Status', 'Actions']}>
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/50">
            <td className="px-4 py-3 font-semibold text-slate-500">{item.id}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Package2 size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-800">{item.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-650">{item.category}</td>
            <td className="px-4 py-3 text-slate-800 font-semibold">{item.stock} {item.unit}</td>
            <td className="px-4 py-3 font-bold text-slate-850">${item.price.toFixed(2)}</td>
            <td className="px-4 py-3">
              <Badge variant={
                item.status === 'In Stock' ? 'success' :
                item.status === 'Low Stock' ? 'warning' : 'danger'
              }>
                {item.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <Button size="sm" variant="secondary" onClick={() => handleEditClick(item)} className="flex items-center gap-1">
                <Edit3 size={12} />
                <span>Adjust Stock</span>
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};
