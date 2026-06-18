import React, { useState } from 'react';
import { initialSalons } from '../../data/mockData';
import { mockUsers } from '../../data/mockUsers';
import SuperAdminLayout from './SuperAdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

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
      <div className="space-y-6 animate-fade-in">

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Emprendimientos</h1>
            <p className="text-sm text-primary-500 mt-0.5">{salons.length} negocios registrados en la plataforma</p>
          </div>
          <button id="super-create-business-btn" onClick={openCreate} className="btn-gold flex items-center gap-2">
            <Icon name="plus" className="w-4 h-4" />
            Nuevo emprendimiento
          </button>
        </div>

        {/* Business cards list */}
        <div className="space-y-4">
          {salons.map(salon => {
            const assignedAdmin = admins.find(a => a.id === salon.adminId);
            return (
              <div key={salon.id} className="card overflow-hidden lift">
                <div className="card-body">
                  <div className="flex gap-5">
                    <img
                      src={salon.photo}
                      alt={salon.name}
                      className="w-24 h-20 rounded-xl object-cover flex-shrink-0 hidden sm:block border border-primary-100"
                    />
                    <div className="flex-1 min-w-0">

                      {/* Top row: name + actions */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-secondary text-lg leading-tight">{salon.name}</h3>
                            <span className={`badge ${salon.isActive ? 'badge-success' : 'badge-danger'}`}>
                              {salon.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Icon name="map-pin" className="w-3.5 h-3.5 text-primary-400" />
                            <p className="text-sm text-primary-500">{salon.address}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {salon.categories.map(c => (
                              <span key={c} className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded-full">{c}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => toggleActive(salon.id)}
                            className="btn-ghost text-xs flex items-center gap-1.5"
                            title={salon.isActive ? 'Desactivar' : 'Activar'}
                          >
                            <span className={`status-dot ${salon.isActive ? 'status-dot-green' : 'status-dot-red'}`} />
                            {salon.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => openEdit(salon)} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3">
                            <Icon name="edit" className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button onClick={() => setDeleteConfirm(salon.id)} className="btn-danger text-xs flex items-center gap-1.5 py-1.5 px-3">
                            <Icon name="trash" className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {/* Admin assignment */}
                      <div className="mt-3 flex items-center gap-3">
                        <label className="label text-xs flex-shrink-0">Admin asignado:</label>
                        <select
                          value={salon.adminId || ''}
                          onChange={e => assignAdmin(salon.id, e.target.value)}
                          className="input text-xs py-1.5 px-3 max-w-xs"
                        >
                          <option value="">Sin asignar</option>
                          {admins.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                          ))}
                        </select>
                        {assignedAdmin && (
                          <img src={assignedAdmin.avatar} alt={assignedAdmin.name} className="w-6 h-6 rounded-full border border-primary-200" />
                        )}
                      </div>

                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {[
                          { label: 'Servicios', value: salon.services?.length || 0, icon: 'scissors' },
                          { label: 'Profesionales', value: salon.professionals?.length || 0, icon: 'users' },
                          { label: 'Turnos/mes', value: salon.monthlyStats?.bookings || 0, icon: 'calendar' },
                        ].map(stat => (
                          <div key={stat.label} className="bg-primary-50 rounded-xl px-3 py-2.5 text-center border border-primary-100">
                            <p className="text-lg font-bold text-secondary">{stat.value}</p>
                            <p className="text-xs text-primary-500 mt-0.5">{stat.label}</p>
                          </div>
                        ))}
                      </div>

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
                  <label className="label">{f.label}</label>
                  <input
                    id={f.id}
                    name={f.name}
                    value={form[f.name] || ''}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="input"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="label">Descripción</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                rows={3}
                className="input resize-none"
                placeholder="Breve descripción del negocio..."
              />
            </div>

            <div>
              <label className="label mb-2">Categorías</label>
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
              <label className="label">URL Foto (opcional)</label>
              <input
                name="photo"
                value={form.photo || ''}
                onChange={handleChange}
                placeholder="https://..."
                className="input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-primary-100">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button id="biz-save-btn" onClick={handleSave} className="btn-gold">Guardar</button>
            </div>
          </div>
        </Modal>

        {/* Delete confirm modal */}
        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" size="sm">
          <div className="flex items-start gap-3 mb-5">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <Icon name="alert" className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-primary-600 text-sm mt-1">
              Esta acción eliminará el emprendimiento de la plataforma de forma permanente. Todos sus datos, servicios y configuraciones se perderán.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Eliminar</button>
          </div>
        </Modal>

      </div>
    </SuperAdminLayout>
  );
};

export default BusinessesView;
