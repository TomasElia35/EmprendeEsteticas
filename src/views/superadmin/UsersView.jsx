import React, { useState } from 'react';
import { mockUsers, ROLES } from '../../data/mockUsers';
import { initialSalons } from '../../data/mockData';
import SuperAdminLayout from './SuperAdminLayout';
import { toast } from '../../components/ui/Toast';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  employee: 'Empleado',
  client: 'Cliente',
};
const ROLE_COLORS = {
  superadmin: 'bg-secondary text-white',
  admin: 'bg-primary-700 text-white',
  employee: 'bg-indigo-500 text-white',
  client: 'bg-primary-100 text-primary-800',
};

const EDITABLE_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.EMPLOYEE];

const EMPTY_FORM = { name: '', email: '', phone: '', role: ROLES.ADMIN, businessId: '' };

const UsersView = () => {
  const [users, setUsers] = useState(mockUsers);
  const [filter, setFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const admins = users.filter((u) => u.role === ROLES.ADMIN);
  const employees = users.filter((u) => u.role === ROLES.EMPLOYEE);
  const clients = users.filter((u) => u.role === ROLES.CLIENT);

  const displayed = filter === 'all'
    ? users
    : users.filter((u) => u.role === filter);

  const getSalon = (userId) => initialSalons.find((s) => s.adminId === userId);

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, businessId: u.businessId || '' });
    setIsNew(false);
    setShowModal(true);
  };

  const openNew = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setIsNew(true);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Nombre y email son obligatorios.');
      return;
    }
    if (isNew) {
      const newUser = {
        id: `u-new-${Date.now()}`,
        ...form,
        password: 'temp1234',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=a37c6d&color=fff&size=128`,
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success('Usuario creado.');
    } else {
      setUsers((prev) =>
        prev.map((u) => u.id === editingUser.id ? { ...u, ...form } : u)
      );
      toast.success('Usuario actualizado.');
    }
    setShowModal(false);
  };

  const handleDelete = (userId) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.info('Usuario eliminado.');
  };

  const tabs = [
    { id: 'all', label: `Todos (${users.length})` },
    { id: ROLES.ADMIN, label: `Admins (${admins.length})` },
    { id: ROLES.EMPLOYEE, label: `Empleados (${employees.length})` },
    { id: ROLES.CLIENT, label: `Clientes (${clients.length})` },
    { id: ROLES.SUPERADMIN, label: `SuperAdmins (${users.filter((u) => u.role === ROLES.SUPERADMIN).length})` },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-secondary">Usuarios del Sistema</h1>
          <button
            id="users-new-btn"
            onClick={openNew}
            className="btn-primary text-sm"
          >
            + Nuevo usuario
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`users-tab-${tab.id}`}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filter === tab.id ? 'bg-white shadow text-secondary' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Super Admins', value: users.filter((u) => u.role === ROLES.SUPERADMIN).length, color: 'border-secondary/20 bg-secondary/5' },
            { label: 'Administradores', value: admins.length, color: 'border-primary-200 bg-primary-50' },
            { label: 'Empleados', value: employees.length, color: 'border-indigo-200 bg-indigo-50' },
            { label: 'Clientes', value: clients.length, color: 'border-blue-200 bg-blue-50' },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl border ${item.color} p-4 text-center`}>
              <p className="text-2xl font-bold text-secondary">{item.value}</p>
              <p className="text-xs text-primary-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-primary-100">
              <tr className="text-primary-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3">Usuario</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Contacto</th>
                <th className="text-left px-6 py-3">Rol</th>
                <th className="text-left px-6 py-3 hidden lg:table-cell">Negocio</th>
                <th className="text-center px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {displayed.map((u) => {
                const salon = u.role === ROLES.ADMIN ? getSalon(u.id) : null;
                const canEdit = EDITABLE_ROLES.includes(u.role);
                return (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-secondary truncate">{u.name}</p>
                          <p className="text-xs text-primary-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-primary-500 hidden md:table-cell">{u.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {salon ? (
                        <span className="text-sm text-secondary font-medium">{salon.name}</span>
                      ) : (
                        <span className="text-xs text-primary-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {canEdit ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`edit-user-${u.id}`}
                            onClick={() => openEdit(u)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Editar
                          </button>
                          {u.role !== ROLES.SUPERADMIN && (
                            <button
                              id={`delete-user-${u.id}`}
                              onClick={() => handleDelete(u.id)}
                              className="text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-primary-300 italic">Solo lectura</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-secondary mb-5">
              {isNew ? 'Nuevo Usuario' : `Editar: ${editingUser?.name}`}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Nombre *</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="Nombre completo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Email *</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="email@ejemplo.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Teléfono</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="11 2345 6789" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Rol</label>
                <select value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400">
                  <option value={ROLES.ADMIN}>Administrador</option>
                  <option value={ROLES.EMPLOYEE}>Empleado</option>
                  <option value={ROLES.SUPERADMIN}>Super Admin</option>
                </select>
              </div>
              {isNew && (
                <p className="text-xs text-primary-400 bg-primary-50 p-3 rounded-lg">
                  La contraseña inicial será <strong>temp1234</strong>. El usuario deberá cambiarla al ingresar.
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancelar</button>
              <button id="save-user-btn" onClick={handleSave} className="flex-1 btn-primary">
                {isNew ? 'Crear usuario' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default UsersView;
