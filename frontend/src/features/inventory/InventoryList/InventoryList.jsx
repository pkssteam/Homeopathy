import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Form, FormGroup, FormActions } from '../../../components/ui/Form/Form';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { 
  Plus, Search, RefreshCw, X, Trash2, Edit, Power,
  Package, AlertTriangle, AlertCircle, CheckCircle, HelpCircle
} from 'lucide-react';
import './InventoryList.css';

export const InventoryList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser;

  const [items, setItems] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Form & Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    unit: 'vials',
    price: 0.00,
    hospital_id: '',
    image: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
    type: 'warning' // 'warning', 'danger', 'success'
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [inventoryData, hospitalsData] = await Promise.all([
        api.getInventory(),
        isAdmin ? api.getHospitals() : Promise.resolve([])
      ]);
      setItems(inventoryData);
      setHospitals(hospitalsData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch pharmacy inventory.');
      toast.error(err.message || 'Failed to fetch pharmacy inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stock' ? (parseInt(value) || 0) : name === 'price' ? (parseFloat(value) || 0) : value
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Medicine name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (formData.stock < 0) errors.stock = 'Stock level cannot be negative';
    if (formData.price < 0) errors.price = 'Price cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Dilution',
      stock: 50,
      unit: 'vials',
      price: 15.00,
      hospital_id: hospitals[0]?.id || '',
      image: null
    });
    setFormErrors({});
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit: item.unit || 'vials',
      price: item.price,
      hospital_id: item.hospital || '',
      image: item.image || null
    });
    setFormErrors({});
    setSelectedItemId(item.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:8000${imagePath}`;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('category', formData.category);
    payload.append('stock', formData.stock);
    payload.append('unit', formData.unit);
    payload.append('price', formData.price);
    
    const hospitalVal = isAdmin ? (formData.hospital_id || '') : (user?.hospital?.id || user?.hospital_id || '');
    if (hospitalVal) {
      payload.append('hospital', hospitalVal);
    }
    
    if (formData.image instanceof File) {
      payload.append('image', formData.image);
    } else if (formData.image === null && isEditing) {
      payload.append('image', '');
    }

    try {
      if (isEditing) {
        await api.updateInventoryItem(selectedItemId, payload);
        toast.success(`Successfully updated ${formData.name}`);
      } else {
        await api.createInventoryItem(payload);
        toast.success(`Successfully created ${formData.name}`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save inventory item.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle activation (enable/disable) by settings stock to 50 or 0
  const handleToggleStatus = (item) => {
    const isActive = item.stock > 0;
    const actionText = isActive ? 'disable' : 'enable';
    setConfirmModal({
      isOpen: true,
      title: `${isActive ? 'Disable' : 'Enable'} Inventory Stock`,
      message: `Are you sure you want to ${actionText} "${item.name}"? ${
        isActive 
          ? 'This will set the stock count to 0 and mark it Out of Stock.' 
          : 'This will set a default stock balance of 50 vials and mark it In Stock.'
      }`,
      confirmText: isActive ? 'Disable' : 'Enable',
      cancelText: 'Cancel',
      type: isActive ? 'warning' : 'success',
      onConfirm: async () => {
        try {
          const targetStock = isActive ? 0 : 50;
          await api.updateStock(item.id, targetStock);
          toast.success(`Successfully ${isActive ? 'disabled' : 'enabled'} "${item.name}"`);
          fetchData();
        } catch (err) {
          console.error(err);
          toast.error(err.message || 'Failed to update stock status.');
        }
      }
    });
  };

  const handleDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Inventory Item',
      message: `Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete Item',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteInventoryItem(item.id);
          toast.success(`Successfully deleted "${item.name}"`);
          setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
          fetchData();
        } catch (err) {
          console.error(err);
          toast.error(err.message || 'Failed to delete inventory item.');
        }
      }
    });
  };

  const handleDeleteSelected = () => {
    const selectedCount = selectedIds.size;
    if (selectedCount === 0) return;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Items',
      message: `Are you sure you want to delete the ${selectedCount} selected items? This will remove them permanently.`,
      confirmText: 'Delete Selected',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(Array.from(selectedIds).map(id => api.deleteInventoryItem(id)));
          toast.success(`Successfully deleted ${selectedCount} items.`);
          setSelectedIds(new Set());
          fetchData();
        } catch (err) {
          console.error(err);
          toast.error(err.message || 'Failed to delete selected items.');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Inventory Items',
      message: 'Are you sure you want to permanently delete ALL inventory entries? This will empty the database for this branch and cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAllInventory();
          toast.success('Successfully cleared all inventory.');
          setSelectedIds(new Set());
          fetchData();
        } catch (err) {
          console.error(err);
          toast.error(err.message || 'Failed to delete all items.');
        }
      }
    });
  };

  // Client Side Filtering
  const filteredItems = items.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      (item.hospital_name && item.hospital_name.toLowerCase().includes(q)) ||
      (item.branch_name && item.branch_name.toLowerCase().includes(q))
    );
  });

  // Pagination Variables
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfFirstItem = (safeCurrentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalItems);
  const paginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Checkbox Selection Helpers
  const pageItemIds = paginatedItems.map(item => item.id);
  const isAllPageSelected = pageItemIds.length > 0 && pageItemIds.every(id => selectedIds.has(id));

  const handleSelectAllToggle = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        pageItemIds.forEach(id => next.delete(id));
      } else {
        pageItemIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleSelectRowToggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hospitalOptions = [
    { value: '', label: 'None (Global/Independent)' },
    ...hospitals.map(h => ({ value: h.id, label: `${h.hospital_name} (${h.branch_name})` }))
  ];

  return (
    <div className="inventory-container">
      {/* Header section */}
      <div className="inventory-header">
        <div className="inventory-header-info">
          <div className="inventory-header-icon">
            <Package size={20} />
          </div>
          <div>
            <h2 className="inventory-header-title">Medicine Directory & Stock Management</h2>
            <p className="inventory-header-subtitle">Create, view, edit, restock, and delete clinical homeopathy remedies.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {selectedIds.size > 0 && (
            <button onClick={handleDeleteSelected} className="inventory-delete-selected-btn">
              <Trash2 size={16} />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          )}
          {items.length > 0 && (
            <button onClick={handleDeleteAll} className="inventory-delete-all-btn">
              <Trash2 size={16} />
              <span>Delete All</span>
            </button>
          )}
          <button onClick={openAddModal} className="inventory-add-btn">
            <Plus size={16} />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="inventory-filters-container">
        <div className="inventory-filters-left">
          <div className="inventory-search-wrapper">
            <span className="inventory-search-icon">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search by remedy name, category, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inventory-search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="inventory-search-clear">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <button onClick={fetchData} className="inventory-refresh-btn">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="inventory-loading-container">
          <div className="inventory-loading-spinner"></div>
          <span className="inventory-loading-text">Loading pharmacy database...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="inventory-empty-container">
          <div className="inventory-empty-icon-wrapper">
            <Package size={24} />
          </div>
          <h3 className="inventory-empty-title">No Inventory Items Found</h3>
          <p className="inventory-empty-subtitle">
            {searchTerm 
              ? 'Try adjusting your search criteria.' 
              : 'Add new homeopathy remedies to initialize your pharmacy catalogue.'}
          </p>
        </div>
      ) : (
        <div className="inventory-table-card">
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th className="inventory-th inventory-checkbox-cell">
                    <input
                      type="checkbox"
                      className="inventory-checkbox"
                      checked={isAllPageSelected}
                      onChange={handleSelectAllToggle}
                    />
                  </th>
                  <th className="inventory-th">REMEDY NAME</th>
                  <th className="inventory-th">CATEGORY</th>
                  <th className="inventory-th">STOCK LEVEL</th>
                  <th className="inventory-th">UNIT PRICE</th>
                  <th className="inventory-th">HOSPITAL BRANCH</th>
                  <th className="inventory-th">STATUS</th>
                  <th className="inventory-th text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="inventory-tbody">
                {paginatedItems.map((item) => {
                  const isActive = item.stock > 0;
                  return (
                    <tr key={item.id}>
                      <td className="inventory-td inventory-checkbox-cell">
                        <input
                          type="checkbox"
                          className="inventory-checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => handleSelectRowToggle(item.id)}
                        />
                      </td>
                      <td className="inventory-td">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img 
                              src={getImageUrl(item.image)} 
                              alt={item.name} 
                              className="w-8 h-8 object-cover rounded-lg border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-slate-105 text-slate-400 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package size={14} />
                            </div>
                          )}
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                      </td>
                      <td className="inventory-td">
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="inventory-td text-slate-700 font-medium">
                        {item.stock} {item.unit || 'vials'}
                      </td>
                      <td className="inventory-td font-semibold text-slate-800">
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="inventory-td text-xs text-slate-500">
                        {item.hospital_name ? `${item.hospital_name} (${item.branch_name})` : 'Global/Independent'}
                      </td>
                      <td className="inventory-td">
                        <Badge variant={
                          item.status === 'In Stock' ? 'success' :
                          item.status === 'Low Stock' ? 'warning' : 'danger'
                        }>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="inventory-td">
                        <div className="actions-wrapper justify-center">
                          <button
                            onClick={() => openEditModal(item)}
                            className="action-btn action-btn-edit"
                            title="Edit Details"
                          >
                            <Edit size={13} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`action-btn ${isActive ? 'action-btn-deactivate' : 'action-btn-activate'}`}
                            title={isActive ? 'Disable / Set Out of Stock' : 'Enable / Replenish Stock'}
                          >
                            <Power size={13} />
                          </button>

                          <button
                            onClick={() => handleDelete(item)}
                            className="action-btn action-btn-delete"
                            title="Delete Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="pagination-wrapper">
            <div className="flex items-center gap-4">
              <div className="pagination-info">
                Showing <span className="pagination-info-highlight">{indexOfFirstItem + 1}</span> to{' '}
                <span className="pagination-info-highlight">{indexOfLastItem}</span> of{' '}
                <span className="pagination-info-highlight">{totalItems}</span> entries
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-xs text-slate-350">|</span>
                <span className="pagination-info">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2 border border-slate-200 rounded text-xs bg-slate-50 text-slate-650 cursor-pointer focus:outline-none"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="pagination-btn pagination-nav-btn"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`pagination-btn ${safeCurrentPage === pg ? 'pagination-btn-active' : ''}`}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="pagination-btn pagination-nav-btn"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Remedy Item' : 'Add New Pharmacy Remedy'}
        icon={Package}
      >
        <Form onSubmit={handleSave}>
          <Input
            label="Medicine Name"
            name="name"
            placeholder="e.g. Arnica Montana 30C"
            value={formData.name}
            onChange={handleInputChange}
            error={formErrors.name}
            disabled={isSaving}
            required
          />

          <FormGroup>
            <Input
              label="Category"
              name="category"
              placeholder="e.g. Dilution, Mother Tincture, Ointment, Pills"
              value={formData.category}
              onChange={handleInputChange}
              error={formErrors.category}
              disabled={isSaving}
              required
            />
            <Input
              label="Stock Level"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              error={formErrors.stock}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label="Stock Unit"
              name="unit"
              placeholder="e.g. vials, tablets, ml"
              value={formData.unit}
              onChange={handleInputChange}
              disabled={isSaving}
            />
            <Input
              label="Unit Price ($)"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              error={formErrors.price}
              disabled={isSaving}
              required
            />
          </FormGroup>

          <div className="form-field-wrapper">
            <label className="form-field-label">Remedy Image</label>
            <div className="flex items-center gap-3 mt-1.5 p-3 bg-slate-50 border border-dashed border-slate-250 rounded-lg">
              {formData.image ? (
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img
                    src={typeof formData.image === 'string' ? getImageUrl(formData.image) : URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: null })}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-650 text-white rounded-full p-0.5 shadow-sm transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0">
                  <Package size={20} />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs text-slate-600 file:mr-2.5 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  disabled={isSaving}
                />
                <span className="text-[10px] text-slate-450">Supported formats: JPG, PNG, WEBP. Max size: 5MB</span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <Select
              label="Assign to Hospital Branch"
              name="hospital_id"
              value={formData.hospital_id}
              onChange={handleInputChange}
              options={hospitalOptions}
              disabled={isSaving}
            />
          )}

          <FormActions>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Remedy'}
            </Button>
          </FormActions>
        </Form>
      </Modal>

      {/* Confirmation modal */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <div className="confirm-modal-header">
              <div className={`confirm-modal-icon-wrapper confirm-icon-${confirmModal.type}`}>
                {confirmModal.type === 'danger' ? (
                  <Trash2 size={20} />
                ) : confirmModal.type === 'warning' ? (
                  <AlertTriangle size={20} />
                ) : (
                  <CheckCircle size={20} />
                )}
              </div>
              <h3 className="confirm-modal-title">{confirmModal.title}</h3>
            </div>
            <div className="confirm-modal-body">
              <p>{confirmModal.message}</p>
            </div>
            <div className="confirm-modal-actions">
              <button 
                type="button" 
                className="confirm-btn-cancel"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                className={`confirm-btn-action confirm-btn-${confirmModal.type}`}
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
