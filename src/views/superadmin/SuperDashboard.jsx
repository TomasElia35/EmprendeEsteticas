import React from 'react';
import { initialSalons, initialBookings } from '../../data/mockData';
import { mockUsers } from '../../data/mockUsers';
import StatCard from '../../components/ui/StatCard';
import SuperAdminLayout from './SuperAdminLayout';
import Icon from '../../components/ui/Icon';

const SuperDashboard = () => {
  const activeBusinesses = initialSalons.filter(s => s.isActive).length;
  const totalBookings = initialBookings.length;
  const totalClients = mockUsers.filter(u => u.role === 'client').length;
  const totalAdmins = mockUsers.filter(u => u.role === 'admin').length;
  const totalRevenue = initialSalons.reduce((sum, s) => sum + s.monthlyStats.revenue, 0);

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-secondary tracking-tight">Panel Global</h1>
            <p className="text-primary-500 text-sm mt-1">
              Vision general de todos los emprendimientos de la plataforma
            </p>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Emprendimientos activos</span>
              <span className="p-2 bg-primary-100 rounded-xl">
                <Icon name="building" className="w-4 h-4 text-primary-600" />
              </span>
            </div>
            <p className="stat-value">{activeBusinesses}</p>
            <p className="stat-sub">de {initialSalons.length} totales</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Administradores</span>
              <span className="p-2 bg-primary-100 rounded-xl">
                <Icon name="briefcase" className="w-4 h-4 text-primary-600" />
              </span>
            </div>
            <p className="stat-value">{totalAdmins}</p>
            <p className="stat-sub">cuentas admin activas</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Clientes registrados</span>
              <span className="p-2 bg-primary-100 rounded-xl">
                <Icon name="users" className="w-4 h-4 text-primary-600" />
              </span>
            </div>
            <p className="stat-value">{totalClients}</p>
            <p className="stat-sub">en toda la plataforma</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Ingresos del mes</span>
              <span className="p-2 bg-primary-100 rounded-xl">
                <Icon name="arrow-trending-up" className="w-4 h-4 text-primary-600" />
              </span>
            </div>
            <p className="stat-value">${totalRevenue.toLocaleString()}</p>
            <p className="stat-sub">total global</p>
          </div>
        </div>

        {/* Businesses overview */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Icon name="building" className="w-4 h-4 text-primary-500" />
              <h2 className="font-bold text-secondary">Estado de Emprendimientos</h2>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-primary-100">
              {initialSalons.map(salon => {
                const admin = mockUsers.find(u => u.id === salon.adminId);
                return (
                  <div
                    key={salon.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-primary-50/60 transition-colors"
                  >
                    <img
                      src={salon.photo}
                      alt={salon.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 hidden sm:block"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary text-sm truncate">{salon.name}</p>
                      <p className="text-xs text-primary-500 truncate">{salon.address}</p>
                      {admin && (
                        <p className="text-xs text-primary-400 truncate">Admin: {admin.name}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 hidden md:block">
                      <p className="text-sm font-bold text-primary-700">
                        ${salon.monthlyStats.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-primary-400">
                        {salon.monthlyStats.bookings} turnos/mes
                      </p>
                    </div>
                    <span
                      className={`badge flex-shrink-0 ${
                        salon.isActive ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {salon.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperDashboard;
