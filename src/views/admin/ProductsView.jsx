import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary">Productos</h1>
          <button id="admin-create-product-btn" onClick={openCreate} className="btn-primary">+ Nuevo producto</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Productos', value: salon?.products.length || 0 },
            { label: 'Unidades en stock', value: totalStock },
            { label: 'Valor del inventario', value: `$${totalValue.toLocaleString()}` },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl border border-primary-100 p-4 text-center">
              <p className="text-2xl font-bold text-secondary">{item.value}</p>
              <p className="text-xs text-primary-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {lowStock.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <span className="font-semibold">Stock bajo:</span> {lowStock.map(p => p.name).join(', ')}
          </div>
        )}

        {/* Products table */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50 border-b border-primary-100">
              <tr className="text-primary-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3">Producto</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-center px-4 py-3">Stock</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">P. Costo</th>
                <th className="text-left px-6 py-3">P. Venta</th>
                <th className="text-right px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {salon?.products.map(prod => (
                <tr key={prod.id} className="hover:bg-primary-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-secondary">{prod.name}</td>
                  <td className="px-6 py-4 text-primary-500 hidden md:table-cell">{prod.category}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => adjustStock(prod.id, -1)} className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center hover:bg-primary-200 transition-colors text-xs">−</button>
                      <span className={`font-bold w-8 text-center ${prod.stock <= 5 ? 'text-red-600' : 'text-secondary'}`}>{prod.stock}</span>
                      <button onClick={() => adjustStock(prod.id, 1)} className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center hover:bg-primary-200 transition-colors text-xs">+</button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-primary-500 hidden sm:table-cell">${prod.costPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-primary-700">${prod.salePrice.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(prod)} className="text-xs text-primary-600 hover:text-primary-900 border border-primary-200 hover:border-primary-400 px-3 py-1.5 rounded-lg transition-colors">Editar</button>
                      <button onClick={() => setDeleteConfirm(prod.id)} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Producto' : 'Nuevo Producto'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Nombre</label>
              <input id="prod-name" name="name" value={form.name} onChange={handleChange}
                className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ej. Shampoo Loreal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Categoría</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  {PROD_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Stock inicial</label>
                <input id="prod-stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                  className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Precio de costo ($)</label>
                <input id="prod-cost" name="costPrice" type="number" min="0" value={form.costPrice} onChange={handleChange}
                  className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Precio de venta ($)</label>
                <input id="prod-sale" name="salePrice" type="number" min="0" value={form.salePrice} onChange={handleChange}
                  className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button id="prod-save-btn" onClick={handleSave} className="btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" size="sm">
          <p className="text-primary-600 mb-6">¿Eliminar este producto del inventario?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-primary bg-red-500 hover:bg-red-600 border-red-500">Eliminar</button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ProductsView;
