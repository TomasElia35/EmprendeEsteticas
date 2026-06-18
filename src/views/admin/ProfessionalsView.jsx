import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

const emptyProf = { name: '', role: '', commission: 40, specialties: '', avatar: '', assignedServices: [] };

const ProfessionalsView = () => {
  const { user } = useAuth();
  const [salons, setSalons] = useState(initialSalons);
  const salon = salons.find(s => s.id === user?.businessId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyProf);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...emptyProf, assignedServices: [] });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      ...p,
      specialties: Array.isArray(p.specialties) ? p.specialties.join(', ') : p.specialties,
      assignedServices: p.assignedServices || [],
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'commission' ? Number(value) : value }));
  };

  const toggleService = (serviceId) => {
    setForm(f => ({
      ...f,
      assignedServices: f.assignedServices.includes(serviceId)
        ? f.assignedServices.filter(id => id !== serviceId)
        : [...f.assignedServices, serviceId],
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio.'); return; }
    const specialtiesArr = form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [];
    const avatarUrl = form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=a37c6d&color=fff`;

    setSalons(prev => prev.map(s => {
      if (s.id !== salon.id) return s;
      let professionals;
      if (editItem) {
        professionals = s.professionals.map(p =>
          p.id === editItem.id
            ? { ...p, ...form, specialties: specialtiesArr, avatar: avatarUrl, assignedServices: form.assignedServices }
            : p
        );
        toast.success('Profesional actualizado.');
      } else {
        professionals = [...s.professionals, {
          ...form,
          specialties: specialtiesArr,
          avatar: avatarUrl,
          assignedServices: form.assignedServices,
          id: Date.now(),
          schedule: {},
        }];
        toast.success('Profesional agregado.');
      }
      return { ...s, professionals };
    }));
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setSalons(prev => prev.map(s => s.id !== salon.id ? s : { ...s, professionals: s.professionals.filter(p => p.id !== id) }));
    toast.success('Profesional eliminado.');
    setDeleteConfirm(null);
  };

  const getAssignedServiceNames = (prof) => {
    const assigned = prof.assignedServices || [];
    if (assigned.length === 0) return [];
    return salon?.services.filter(s => assigned.includes(s.id)) || [];
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Personal</h1>
          <button id="admin-create-prof-btn" onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Icon name="plus" className="w-4 h-4" />
            Agregar profesional
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {salon?.professionals.map(prof => {
            const assignedSvcs = getAssignedServiceNames(prof);
            return (
              <div key={prof.id} className="card p-5 flex gap-4">
                <img
                  src={prof.avatar}
                  alt={prof.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-secondary">{prof.name}</h3>
                      <p className="text-sm text-primary-500">{prof.role}</p>
                    </div>
                    <span className="badge badge-neutral flex-shrink-0">
                      {prof.commission}% comisión
                    </span>
                  </div>

                  {assignedSvcs.length > 0 && (
                    <div className="mt-3">
                      <p className="section-label mb-1.5">Servicios asignados</p>
                      <div className="flex flex-wrap gap-1.5">
                        {assignedSvcs.map(svc => (
                          <span key={svc.id} className="badge badge-accent">
                            {svc.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {prof.specialties?.length > 0 && assignedSvcs.length === 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {prof.specialties.map(sp => (
                        <span key={sp} className="badge badge-neutral">{sp}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEdit(prof)}
                      className="btn-ghost flex items-center gap-1.5 text-sm"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(prof.id)}
                      className="btn-ghost flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Profesional' : 'Nuevo Profesional'}>
          <div className="space-y-4">
            {[
              { name: 'name', label: 'Nombre completo', type: 'text', placeholder: 'María González', id: 'prof-name' },
              { name: 'role', label: 'Rol / Puesto', type: 'text', placeholder: 'Estilista Principal', id: 'prof-role' },
              { name: 'specialties', label: 'Especialidades (separadas por coma)', type: 'text', placeholder: 'Corte, Color, Estética', id: 'prof-specialties' },
            ].map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input
                  id={f.id}
                  name={f.name}
                  type={f.type}
                  value={form[f.name] || ''}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="input"
                />
              </div>
            ))}

            <div>
              <label className="label">Comisión (%)</label>
              <input
                id="prof-commission"
                name="commission"
                type="number"
                min="0"
                max="100"
                value={form.commission}
                onChange={handleChange}
                className="input"
              />
            </div>

            {salon?.services && salon.services.length > 0 && (
              <div>
                <label className="label">Servicios que realiza</label>
                <div className="border border-primary-200 rounded-xl overflow-hidden divide-y divide-primary-100">
                  {salon.services.map(svc => {
                    const checked = form.assignedServices?.includes(svc.id) || false;
                    return (
                      <label
                        key={svc.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? 'bg-primary-100' : 'hover:bg-primary-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(svc.id)}
                          className="w-4 h-4 rounded border-primary-300 accent-primary-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${checked ? 'text-primary-800' : 'text-secondary'}`}>{svc.name}</p>
                          <p className="text-xs text-primary-400">{svc.category} · {svc.duration} min · ${svc.price.toLocaleString('es-AR')}</p>
                        </div>
                        {checked && (
                          <Icon name="check-circle" className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </div>
                {form.assignedServices?.length === 0 && (
                  <p className="text-xs text-primary-400 mt-1.5">Sin servicios seleccionados — el profesional aparecerá para todos.</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button id="prof-save-btn" onClick={handleSave} className="btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" size="sm">
          <p className="text-primary-600 mb-6">Eliminar este profesional? Se perderán sus horarios y datos asociados.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Eliminar</button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ProfessionalsView;
