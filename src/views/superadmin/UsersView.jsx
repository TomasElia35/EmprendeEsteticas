import React, { useState } from 'react';
import { mockUsers, ROLES } from '../../data/mockUsers';
import { initialSalons } from '../../data/mockData';
import SuperAdminLayout from './SuperAdminLayout';
import { toast } from '../../components/ui/Toast';

const ROLE_LABELS = { superadmin: 'Super Admin', admin: 'Administrador', client: 'Cliente' };
const ROLE_COLORS = {
  superadmin: 'bg-secondary text-white',
  admin: 'bg-primary-700 text-white',
  client: 'bg-primary-100 text-primary-800',
};

const UsersView = () => {
  const [users] = useState(mockUsers);
  const [filter, setFilter] = useState('all');

  const admins = users.filter(u => u.role === ROLES.ADMIN);
  const clients = users.filter(u => u.role === ROLES.CLIENT);
  const displayed = filter === 'all' ? users : users.filter(u => u.role === filter);

  const getSalon = (adminId) => initialSalons.find(s => s.adminId === adminId);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-secondary">Usuarios del Sistema</h1>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {[
              { id: 'all', label: `Todos (${users.length})` },
              { id: ROLES.ADMIN, label: `Admins (${admins.length})` },
              { id: ROLES.CLIENT, label: `Clientes (${clients.length})` },
            ].map(tab => (
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
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Super Admins', value: 1, color: 'border-secondary/20 bg-secondary/5' },
            { label: 'Administradores', value: admins.length, color: 'border-primary-200 bg-primary-50' },
            { label: 'Clientes', value: clients.length, color: 'border-blue-200 bg-blue-50' },
          ].map(item => (
            <div key={item.label} className={`rounded-xl border ${item.color} p-4 text-center`}>
              <p className="text-2xl font-bold text-secondary">{item.value}</p>
              <p className="text-xs text-primary-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-primary-100">
              <tr className="text-primary-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-3">Usuario</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Contacto</th>
                <th className="text-left px-6 py-3">Rol</th>
                <th className="text-left px-6 py-3 hidden lg:table-cell">Negocio asignado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {displayed.map(u => {
                const salon = u.role === ROLES.ADMIN ? getSalon(u.id) : null;
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
                    <td className="px-6 py-4 text-primary-500 hidden md:table-cell">
                      {u.phone || '-'}
                    </td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-primary-400 text-center">
          Los clientes registrados dinámicamente en esta sesión no se muestran aquí (sería parte de la integración con backend).
        </p>
      </div>
    </SuperAdminLayout>
  );
};

export default UsersView;
