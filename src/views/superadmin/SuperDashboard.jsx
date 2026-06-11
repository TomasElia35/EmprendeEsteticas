import React from 'react';
import { initialSalons, initialBookings } from '../../data/mockData';
import { mockUsers } from '../../data/mockUsers';
import StatCard from '../../components/ui/StatCard';
import SuperAdminLayout from './SuperAdminLayout';

const SuperDashboard = () => {
  const activeBusinesses = initialSalons.filter(s => s.isActive).length;
  const totalBookings = initialBookings.length;
  const totalClients = mockUsers.filter(u => u.role === 'client').length;
  const totalAdmins = mockUsers.filter(u => u.role === 'admin').length;
  const totalRevenue = initialSalons.reduce((sum, s) => sum + s.monthlyStats.revenue, 0);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Panel Global</h1>
          <p className="text-primary-600 text-sm mt-1">Visión general de todos los emprendimientos de la plataforma</p>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Emprendimientos activos" value={activeBusinesses} sub={`de ${initialSalons.length} totales`} icon="🏪" color="primary" />
          <StatCard label="Administradores" value={totalAdmins} icon="👔" color="blue" />
          <StatCard label="Clientes registrados" value={totalClients} icon="👥" color="purple" />
          <StatCard label="Ingresos del mes (global)" value={`$${totalRevenue.toLocaleString()}`} icon="💰" color="green" />
        </div>

        {/* Businesses overview */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-primary-100">
            <h2 className="font-bold text-secondary">Estado de Emprendimientos</h2>
          </div>
          <div className="divide-y divide-primary-50">
            {initialSalons.map(salon => {
              const admin = mockUsers.find(u => u.id === salon.adminId);
              return (
                <div key={salon.id} className="flex items-center gap-4 px-5 py-4">
                  <img src={salon.photo} alt={salon.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary text-sm truncate">{salon.name}</p>
                    <p className="text-xs text-primary-500 truncate">{salon.address}</p>
                    {admin && <p className="text-xs text-primary-400 truncate">Admin: {admin.name}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 hidden md:block">
                    <p className="text-sm font-bold text-green-600">${salon.monthlyStats.revenue.toLocaleString()}</p>
                    <p className="text-xs text-primary-400">{salon.monthlyStats.bookings} turnos/mes</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${salon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {salon.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperDashboard;
