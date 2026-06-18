import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

const PROD_CATEGORIES = ['Cabello', 'Barba', 'Facial', 'Uñas', 'Spa', 'Otro'];
const emptyProduct = { name: '', category: PROD_CATEGORIES[0], stock: 0, costPrice: 0, salePrice: 0 };

const ProductsView = () => {
  const { user } = useAuth();
  const [salons, setSalons] = useState(initialSalons);
  const salon = salons.find(s => s.id === user?.businessId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => { setEditItem(null); setForm(emptyProduct); setModalOpen(true); };
  const openEdit = (p) => { setEditItem(p); setForm({ ...p }); setModalOpen(true); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['stock', 'costPrice', 'salePrice'];
    setForm(f => ({ ...f, [name]: numericFields.includes(name) ? Number(value) : value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio.'); return; }
    setSalons(prev => prev.map(s => {
      if (s.id !== salon.id) return s;
      let products;
      if (editItem) {
        products = s.products.map(p => p.id === editItem.id ? { ...p, ...form } : p);
        toast.success('Producto actualizado.');
      } else {
        products = [...s.products, { ...form, id: Date.now() }];
        toast.success('Producto creado.');
      }
      return { ...s, products };
    }));
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setSalons(prev => prev.map(s => s.id !== salon.id ? s : { ...s, products: s.products.filter(p => p.id !== id) }));
    toast.success('Producto eliminado.');
    setDeleteConfirm(null);
  };

  const adjustStock = (productId, delta) => {
    setSalons(prev => prev.map(s => {
      if (s.id !== salon.id) return s;
      const products = s.products.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p);
      return { ...s, products };
    }));
  };

  const totalStock = salon?.products.reduce((sum, p) => sum + p.stock, 0) || 0;
  const totalValue = salon?.products.reduce((sum, p) => sum + p.stock * p.costPrice, 0) || 0;
  const lowStock = salon?.products.filter(p => p.stock <= 5) || [];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Productos</h1>
            <p className="text-sm text-primary-500 mt-0.5">Gestion de inventario y precios</p>
          </div>
          <button id="admin-create-product-btn" onClick={openCreate} className="btn-gold flex items-center gap-2">
            <Icon name="plus" className="w-4 h-4" />
            Nuevo producto
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <Icon name="package" className="w-4 h-4 text-primary-600" />
              </div>
              <span className="stat-label">Productos</span>
            </div>
            <p className="stat-value">{salon?.products.length || 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <Icon name="tag" className="w-4 h-4 text-primary-600" />
              </div>
              <span className="stat-label">Unidades en stock</span>
            </div>
            <p className="stat-value">{totalStock}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <Icon name="dollar" className="w-4 h-4 text-primary-600" />
              </div>
              <span className="stat-label">Valor del inventario</span>
            </div>
            <p className="stat-value text-gold">${totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div className="flex items-start gap-3 bg-primary-100 border border-primary-200 rounded-xl p-4">
            <Icon name="alert" className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <div className="text-sm text-primary-800">
              <span className="font-semibold text-primary-900">Stock bajo: </span>
              {lowStock.map((p, i) => (
                <span key={p.id}>
                  <span className="badge badge-danger">{p.name}</span>
                  {i < lowStock.length - 1 && ' '}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Products table */}
        <div className="table-container">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-th">Producto</th>
                <th className="table-th hidden md:table-cell">Categoria</th>
                <th className="table-th text-center">Stock</th>
                <th className="table-th hidden sm:table-cell">P. Costo</th>
                <th className="table-th">P. Venta</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {salon?.products.map(prod => (
                <tr key={prod.id} className="hover:bg-primary-50/60 transition-colors">
                  <td className="table-td font-medium text-secondary">
                    <div className="flex items-center gap-2">
                      {prod.name}
                      {prod.stock <= 5 && (
                        <span className="badge badge-danger">Stock bajo</span>
                      )}
                    </div>
                  </td>
                  <td className="table-td text-primary-500 hidden md:table-cell">{prod.category}</td>
                  <td className="table-td">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => adjustStock(prod.id, -1)}
                        className="btn-ghost w-6 h-6 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm leading-none p-0"
                        aria-label="Reducir stock"
                      >
                        −
                      </button>
                      <span className={`font-bold w-8 text-center tabular-nums ${prod.stock <= 5 ? 'text-accent' : 'text-secondary'}`}>
                        {prod.stock}
                      </span>
                      <button
                        onClick={() => adjustStock(prod.id, 1)}
                        className="btn-ghost w-6 h-6 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm leading-none p-0"
                        aria-label="Aumentar stock"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="table-td text-primary-500 hidden sm:table-cell">${prod.costPrice.toLocaleString()}</td>
                  <td className="table-td font-bold text-gold">${prod.salePrice.toLocaleString()}</td>
                  <td className="table-td text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(prod)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                        <Icon name="edit" className="w-3 h-3" />
                        Editar
                      </button>
                      <button onClick={() => setDeleteConfirm(prod.id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                        <Icon name="trash" className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!salon?.products || salon.products.length === 0) && (
                <tr>
                  <td colSpan={6} className="table-td text-center text-primary-400 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="package" className="w-8 h-8 text-primary-300" />
                      <span>No hay productos registrados</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create / Edit modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Producto' : 'Nuevo Producto'}>
          <div className="space-y-4">
            <div>
              <label className="label">Nombre</label>
              <input
                id="prod-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Ej. Shampoo Loreal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Categoria</label>
                <select name="category" value={form.category} onChange={handleChange} className="input">
                  {PROD_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Stock inicial</label>
                <input
                  id="prod-stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Precio de costo ($)</label>
                <input
                  id="prod-cost"
                  name="costPrice"
                  type="number"
                  min="0"
                  value={form.costPrice}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Precio de venta ($)</label>
                <input
                  id="prod-sale"
                  name="salePrice"
                  type="number"
                  min="0"
                  value={form.salePrice}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button id="prod-save-btn" onClick={handleSave} className="btn-gold">Guardar</button>
            </div>
          </div>
        </Modal>

        {/* Delete confirmation modal */}
        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminacion" size="sm">
          <div className="flex items-start gap-3 mb-6">
            <Icon name="alert" className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <p className="text-primary-600 text-sm">Esta accion eliminara el producto del inventario de forma permanente.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Eliminar</button>
          </div>
        </Modal>

      </div>
    </AdminLayout>
  );
};

export default ProductsView;
