import React, { useState } from 'react';
import { mockUsers, ROLES } from '../../data/mockUsers';
import { initialSalons } from '../../data/mockData';
import SuperAdminLayout from './SuperAdminLayout';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  employee: 'Empleado',
  client: 'Cliente',
};

const ROLE_BADGE = {
  superadmin: 'badge badge-neutral',
  admin: 'badge badge-accent',
  employee: 'badge badge-info',
  client: 'badge badge-warning',
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
      <div className="space-y-6 animate-fade-in">

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-secondary tracking-tight">Usuarios del Sistema</h1>
            <p className="text-sm text-primary-500 mt-0.5">{users.length} usuarios registrados</p>
          </div>
          <button
            id="users-new-btn"
            onClick={openNew}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Icon name="plus" className="w-4 h-4" />
            Nuevo usuario
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-primary-100 p-1 rounded-xl w-fit border border-primary-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`users-tab-${tab.id}`}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-white shadow-sm text-secondary border border-primary-200'
                  : 'text-primary-500 hover:text-primary-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Super Admins', value: users.filter((u) => u.role === ROLES.SUPERADMIN).length, icon: 'lock' },
            { label: 'Administradores', value: admins.length, icon: 'briefcase' },
            { label: 'Empleados', value: employees.length, icon: 'scissors' },
            { label: 'Clientes', value: clients.length, icon: 'users' },
          ].map((item) => (
            <div key={item.label} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="stat-label">{item.label}</span>
                <Icon name={item.icon} className="w-4 h-4 text-primary-400" />
              </div>
              <p className="stat-value">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-th">Usuario</th>
                <th className="table-th hidden md:table-cell">Contacto</th>
                <th className="table-th">Rol</th>
                <th className="table-th hidden lg:table-cell">Negocio</th>
                <th className="table-th text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {displayed.map((u) => {
                const salon = u.role === ROLES.ADMIN ? getSalon(u.id) : null;
                const canEdit = EDITABLE_ROLES.includes(u.role);
                return (
                  <tr key={u.id} className="hover:bg-primary-50/60 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full flex-shrink-0 border border-primary-100" />
                        <div className="min-w-0">
                          <p className="font-semibold text-secondary truncate">{u.name}</p>
                          <p className="text-xs text-primary-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-primary-500 hidden md:table-cell">
                      {u.phone || <span className="text-primary-300">—</span>}
                    </td>
                    <td className="table-td">
                      <span className={ROLE_BADGE[u.role]}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="table-td hidden lg:table-cell">
                      {salon ? (
                        <div className="flex items-center gap-1.5">
                          <Icon name="building" className="w-3.5 h-3.5 text-primary-400" />
                          <span className="text-sm text-secondary font-medium">{salon.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-primary-300">—</span>
                      )}
                    </td>
                    <td className="table-td text-center">
                      {canEdit ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`edit-user-${u.id}`}
                            onClick={() => openEdit(u)}
                            className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-2.5"
                          >
                            <Icon name="edit" className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          {u.role !== ROLES.SUPERADMIN && (
                            <button
                              id={`delete-user-${u.id}`}
                              onClick={() => handleDelete(u.id)}
                              className="btn-ghost text-xs py-1.5 px-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5"
                            >
                              <Icon name="trash" className="w-3.5 h-3.5" />
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
          <div className="relative bg-white rounded-3xl shadow-modal w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                <Icon name="user" className="w-4 h-4 text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-secondary">
                {isNew ? 'Nuevo Usuario' : `Editar: ${editingUser?.name}`}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                  placeholder="11 2345 6789"
                />
              </div>
              <div>
                <label className="label">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input"
                >
                  <option value={ROLES.ADMIN}>Administrador</option>
                  <option value={ROLES.EMPLOYEE}>Empleado</option>
                  <option value={ROLES.SUPERADMIN}>Super Admin</option>
                </select>
              </div>
              {isNew && (
                <div className="flex items-start gap-2.5 bg-primary-50 border border-primary-200 p-3 rounded-xl">
                  <Icon name="info" className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-primary-600">
                    La contraseña inicial será <strong>temp1234</strong>. El usuario deberá cambiarla al ingresar.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-primary-100">
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
