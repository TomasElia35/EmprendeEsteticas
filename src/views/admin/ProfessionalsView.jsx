import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';

const emptyProf = { name: '', role: '', commission: 40, specialties: '', avatar: '' };

const ProfessionalsView = () => {
  const { user } = useAuth();
  const [salons, setSalons] = useState(initialSalons);
  const salon = salons.find(s => s.id === user?.businessId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyProf);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => { setEditItem(null); setForm(emptyProf); setModalOpen(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({ ...p, specialties: Array.isArray(p.specialties) ? p.specialties.join(', ') : p.specialties });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'commission' ? Number(value) : value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio.'); return; }
    const specialtiesArr = form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [];
    const avatarUrl = form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=a37c6d&color=fff`;

    setSalons(prev => prev.map(s => {
      if (s.id !== salon.id) return s;
      let professionals;
      if (editItem) {
        professionals = s.professionals.map(p => p.id === editItem.id ? { ...p, ...form, specialties: specialtiesArr, avatar: avatarUrl } : p);
        toast.success('Profesional actualizado.');
      } else {
        professionals = [...s.professionals, { ...form, specialties: specialtiesArr, avatar: avatarUrl, id: Date.now(), schedule: {} }];
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary">Personal</h1>
          <button id="admin-create-prof-btn" onClick={openCreate} className="btn-primary">+ Agregar profesional</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {salon?.professionals.map(prof => (
            <div key={prof.id} className="bg-white rounded-2xl border border-primary-100 shadow-sm p-5 flex gap-4">
              <img src={prof.avatar} alt={prof.name} className="w-16 h-16 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-secondary">{prof.name}</h3>
                    <p className="text-sm text-primary-600">{prof.role}</p>
                  </div>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex-shrink-0">
                    {prof.commission}% comisión
                  </span>
                </div>
                {prof.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {prof.specialties.map(sp => (
                      <span key={sp} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{sp}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(prof)} className="text-xs btn-secondary py-1.5 px-3">Editar</button>
                  <button onClick={() => setDeleteConfirm(prof.id)} className="text-xs text-red-500 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Profesional' : 'Nuevo Profesional'}>
          <div className="space-y-4">
            {[
              { name: 'name', label: 'Nombre completo', type: 'text', placeholder: 'María González', id: 'prof-name' },
              { name: 'role', label: 'Rol / Puesto', type: 'text', placeholder: 'Estilista Principal', id: 'prof-role' },
              { name: 'specialties', label: 'Especialidades (separadas por coma)', type: 'text', placeholder: 'Corte, Color, Estética', id: 'prof-specialties' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-primary-700 mb-1">{f.label}</label>
                <input id={f.id} name={f.name} type={f.type} value={form[f.name] || ''} onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Comisión (%)</label>
              <input id="prof-commission" name="commission" type="number" min="0" max="100" value={form.commission} onChange={handleChange}
                className="w-full border border-primary-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button id="prof-save-btn" onClick={handleSave} className="btn-primary">Guardar</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" size="sm">
          <p className="text-primary-600 mb-6">¿Eliminar este profesional? Se perderán sus horarios y datos asociados.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-primary bg-red-500 hover:bg-red-600 border-red-500">Eliminar</button>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default ProfessionalsView;
