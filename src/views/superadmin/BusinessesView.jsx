import React, { useState } from 'react';
import { initialSalons } from '../../data/mockData';
import { mockUsers } from '../../data/mockUsers';
import SuperAdminLayout from './SuperAdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

const CATEGORIES_OPTIONS = ['Peluquería', 'Estética', 'Barbería', 'Spa', 'Uñas', 'Cejas & Pestañas', 'Clínica Estética', 'Otro'];

const emptySalon = {
  name: '', address: '', phone: '', email: '', instagram: '',
  description: '', categories: [], openDays: [], openHours: '09:00 - 20:00',
  photo: '', isActive: true,
};

const BusinessesView = () => {
  const [salons, setSalons] = useState(initialSalons);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptySalon);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const admins = mockUsers.filter(u => u.role === 'admin');

  const openCreate = () => { setEditItem(null); setForm(emptySalon); setModalOpen(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ ...s, categories: [...s.categories], openDays: [...s.openDays] }); setModalOpen(true); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const toggleCategory = (cat) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat]
    }));
  };

  const toggleActive = (id) => {
    setSalons(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    toast.success('Estado actualizado.');
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.address.trim()) { toast.error('Nombre y dirección son obligatorios.'); return; }
    setSalons(prev => {
      if (editItem) {
        toast.success('Emprendimiento actualizado.');
        return prev.map(s => s.id === editItem.id ? { ...s, ...form } : s);
      }
      toast.success('Emprendimiento creado.');
      return [...prev, {
        ...form,
        id: Date.now(),
        adminId: null,
        rating: 0, reviews: 0,
        monthlyStats: { bookings: 0, revenue: 0, newClients: 0 },
        services: [], professionals: [], products: [],
        availableSlots: [],
        photo: form.photo || `https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80`,
      }];
    });
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setSalons(prev => prev.filter(s => s.id !== id));
    toast.success('Emprendimiento eliminado.');
    setDeleteConfirm(null);
  };

  const assignAdmin = (salonId, adminId) => {
    setSalons(prev => prev.map(s => s.id === salonId ? { ...s, adminId: adminId || null } : s));
    toast.success('Admin asignado.');
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary">Emprendimientos</h1>
          <button id="super-create-business-btn" onClick={openCreate} className="btn-primary">+ Nuevo emprendimiento</button>
        </div>

        <div className="space-y-4">
          {salons.map(salon => {
            const assignedAdmin = admins.find(a => a.id === salon.adminId);
            return (
              <div key={salon.id} className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
                <div className="flex gap-4 p-5">
                  <img src={salon.photo} alt={salon.name} className="w-24 h-20 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-bold text-secondary text-lg">{salon.name}</h3>
                        <p className="text-sm text-primary-500">{salon.address}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {salon.categories.map(c => (
                            <span key={c} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => toggleActive(salon.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                            salon.isActive
                              ? 'bg-green-100 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                              : 'bg-red-100 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                          }`}
                        >
                          {salon.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                        <button onClick={() => openEdit(salon)} className="text-xs btn-secondary py-1.5 px-3">Editar</button>
                        <button onClick={() => setDeleteConfirm(salon.id)} className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg transition-colors hover:bg-red-50">Eliminar</button>
                      </div>
                    </div>

                    {/* Admin assignment */}
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-xs text-primary-500 flex-shrink-0">Admin asignado:</label>
                      <select
                        value={salon.adminId || ''}
                        onChange={e => assignAdmin(salon.id, e.target.value)}
                        className="text-xs border border-primary-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none text-secondary"
                      >
                        <option value="">Sin asignar</option>
                        {admins.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                        ))}
                      </select>
                      {assignedAdmin && (
                        <img src={assignedAdmin.avatar} alt={assignedAdmin.name} className="w-6 h-6 rounded-full" />
                      )}
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {[
                        { label: 'Servicios', value: salon.services?.length || 0 },
                        { label: 'Profesionales', value: salon.professionals?.length || 0 },
                        { label: 'Turnos/mes', value: salon.monthlyStats?.bookings || 0 },
                      ].map(stat => (
                        <div key={stat.label} className="bg-primary-50 rounded-lg px-3 py-2 text-center">
                          <p className="text-lg font-bold text-secondary">{stat.value}</p>
                          <p className="text-xs text-primary-500">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create/Edit Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Emprendimiento' : 'Nuevo Emprendimiento'} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'name', label: 'Nombre del negocio', placeholder: "L'Elegance Studio", id: 'biz-name' },
                { name: 'address', label: 'Dirección', placeholder: 'Av. Libertador 1234, CABA', id: 'biz-address' },
                { name: 'phone', label: 'Teléfono', placeholder: '1122334455', id: 'biz-phone' },
                { name: 'email', label: 'Email', placeholder: 'contacto@negocio.com', id: 'biz-email' },
                { name: 'instagram', label: 'Instagram', placeholder: '@negocio.ba', id: 'biz-instagram' },
                { name: 'openHours', label: 'Horario', placeholder: '09:00 - 20:00', id: 'biz-hours' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-primary-700 mb-1">{f.label}</label>
                  <input id={f.id} name={f.name} value={form[f.name] || ''} onChange={handleChange}
                    placeholder={f.placeholder}
                    className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Descripción</label>
              <textarea name="description" value={form.description || ''} onChange={handleChange} rows={3}
                className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Breve descripción del negocio..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">Categorías</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_OPTIONS.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.categories?.includes(cat)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-primary-700 border-primary-300 hover:border-primary-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">URL Foto (opcional)</label>
              <input name="photo" value={form.photo || ''} onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button id="biz-save-btn" onClick={handleSave} className="btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" size="sm">
          <p className="text-primary-600 mb-6">¿Eliminar este emprendimiento de la plataforma? Todos sus datos se perderán.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-primary bg-red-500 hover:bg-red-600 border-red-500">Eliminar</button>
          </div>
        </Modal>
      </div>
    </SuperAdminLayout>
  );
};

export default BusinessesView;
