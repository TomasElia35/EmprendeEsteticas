import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

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
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Servicios y Precios</h1>
          <button id="admin-create-service-btn" onClick={openCreate} className="btn-gold flex items-center gap-2">
            <Icon name="plus" className="w-4 h-4" />
            Nuevo servicio
          </button>
        </div>

        {categories.map(cat => (
          <div key={cat} className="card overflow-hidden">
            <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
              <span className="section-label">{cat}</span>
            </div>
            <div className="table-container">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="table-th">Nombre</th>
                    <th className="table-th hidden sm:table-cell">Duración</th>
                    <th className="table-th">Precio</th>
                    <th className="table-th text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {salon?.services.filter(s => s.category === cat).map(svc => (
                    <tr key={svc.id} className="hover:bg-primary-50/60 transition-colors">
                      <td className="table-td font-medium text-secondary">{svc.name}</td>
                      <td className="table-td text-primary-600 hidden sm:table-cell">
                        <Icon name="clock" className="w-3.5 h-3.5 inline mr-1 text-primary-400" />
                        {svc.duration} min
                      </td>
                      <td className="table-td font-semibold text-gold">${svc.price.toLocaleString('es-AR')}</td>
                      <td className="table-td text-right">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => openEdit(svc)}
                            className="btn-ghost flex items-center gap-1.5 text-xs px-2.5 py-1.5"
                          >
                            <Icon name="edit" className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(svc.id)}
                            className="btn-ghost flex items-center gap-1.5 text-xs px-2.5 py-1.5 text-red-600 hover:text-red-700"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Create / Edit Modal */}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? 'Editar Servicio' : 'Nuevo Servicio'}>
          <div className="space-y-4">
            <div>
              <label className="label">Nombre</label>
              <input
                id="svc-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Ej. Corte Clásico"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Categoría</label>
                <select name="category" value={form.category} onChange={handleChange} className="input">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Duración (min)</label>
                <input
                  id="svc-duration"
                  name="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={form.duration}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="label">Precio ($)</label>
              <input
                id="svc-price"
                name="price"
                type="number"
                min="0"
                step="100"
                value={form.price}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeModal} className="btn-secondary">Cancelar</button>
              <button id="svc-save-btn" onClick={handleSave} className="btn-gold">Guardar</button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm Modal */}
        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" size="sm">
          <p className="text-primary-600 mb-6">
            Estas seguro de que queres eliminar este servicio? Esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Eliminar</button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ServicesView;
