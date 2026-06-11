import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

const CATEGORIES = ['Peluquería', 'Estética', 'Barbería', 'Spa', 'Uñas', 'Otro'];

const emptyService = { name: '', category: CATEGORIES[0], duration: 60, price: 0 };

const ServicesView = () => {
  const { user } = useAuth();
  const [salons, setSalons] = useState(initialSalons);
  const salon = salons.find(s => s.id === user?.businessId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => { setEditItem(null); setForm(emptyService); setModalOpen(true); };
  const openEdit = (svc) => { setEditItem(svc); setForm({ ...svc }); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'duration' || name === 'price' ? Number(value) : value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio.'); return; }
    setSalons(prev => prev.map(s => {
      if (s.id !== salon.id) return s;
      let services;
      if (editItem) {
        services = s.services.map(sv => sv.id === editItem.id ? { ...sv, ...form } : sv);
        toast.success('Servicio actualizado.');
      } else {
        services = [...s.services, { ...form, id: Date.now() }];
        toast.success('Servicio creado.');
      }
      return { ...s, services };
    }));
    closeModal();
  };

  const handleDelete = (id) => {
    setSalons(prev => prev.map(s => s.id !== salon.id ? s : { ...s, services: s.services.filter(sv => sv.id !== id) }));
    toast.success('Servicio eliminado.');
    setDeleteConfirm(null);
  };

  const categories = [...new Set(salon?.services.map(s => s.category) || [])];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary">Servicios y Precios</h1>
          <button id="admin-create-service-btn" onClick={openCreate} className="btn-primary">+ Nuevo servicio</button>
        </div>

        {categories.map(cat => (
          <div key={cat} className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
              <h2 className="font-semibold text-primary-800 text-sm uppercase tracking-wider">{cat}</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-primary-50">
                <tr className="text-primary-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Nombre</th>
                  <th className="text-left px-6 py-3 hidden sm:table-cell">Duración</th>
                  <th className="text-left px-6 py-3">Precio</th>
                  <th className="text-right px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {salon?.services.filter(s => s.category === cat).map(svc => (
                  <tr key={svc.id} className="hover:bg-primary-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-secondary">{svc.name}</td>
                    <td className="px-6 py-4 text-primary-600 hidden sm:table-cell">{svc.duration} min</td>
                    <td className="px-6 py-4 font-bold text-primary-700">${svc.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(svc)} className="text-xs text-primary-600 hover:text-primary-900 border border-primary-200 hover:border-primary-400 px-3 py-1.5 rounded-lg transition-colors">
                          Editar
                        </button>
                        <button onClick={() => setDeleteConfirm(svc.id)} className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Create / Edit Modal */}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'Editar Servicio' : 'Nuevo Servicio'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Nombre</label>
              <input id="svc-name" name="name" value={form.name} onChange={handleChange}
                className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Ej. Corte Clásico" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Categoría</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Duración (min)</label>
                <input id="svc-duration" name="duration" type="number" min="15" step="15" value={form.duration} onChange={handleChange}
                  className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Precio ($)</label>
              <input id="svc-price" name="price" type="number" min="0" step="100" value={form.price} onChange={handleChange}
                className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeModal} className="btn-secondary">Cancelar</button>
              <button id="svc-save-btn" onClick={handleSave} className="btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm Modal */}
        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" size="sm">
          <p className="text-primary-600 mb-6">¿Estás seguro de que querés eliminar este servicio? Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-primary bg-red-500 hover:bg-red-600 border-red-500">Eliminar</button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ServicesView;
