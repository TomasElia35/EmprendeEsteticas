import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import AdminLayout from './AdminLayout';

const STATUS_MAP = {
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const salon = initialSalons.find(s => s.id === user?.businessId);

  const today = new Date().toISOString().split('T')[0];
  const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
  const allBookings = [...initialBookings, ...stored];
  const todayBookings = allBookings.filter(b => b.salonId === salon?.id && b.date === today);

  const confirmedCount = todayBookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = todayBookings.filter(b => b.status === 'pending').length;
  const todayRevenue = todayBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => {
      const svc = salon?.services.find(s => s.id === b.serviceId);
      return sum + (svc?.price || 0);
    }, 0);

  if (!salon) return (
    <AdminLayout>
      <div className="text-center py-16 text-primary-500">No se encontró el negocio asignado.</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-secondary">{salon.name}</h1>
          <p className="text-primary-600 text-sm mt-1">{salon.address} · {salon.openHours}</p>
        </div>

        {/* KPIs del día */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Turnos Hoy" value={todayBookings.length} sub={`${confirmedCount} confirmados`} icon="📅" color="primary" />
          <StatCard label="Pendientes" value={pendingCount} sub="Sin confirmar" icon="⏳" color="orange" />
          <StatCard label="Ingresos Hoy" value={`$${todayRevenue.toLocaleString()}`} sub="Turnos confirmados" icon="💰" color="green" />
          <StatCard label="Clientes Mes" value={salon.monthlyStats.newClients} sub="Nuevos este mes" icon="👥" color="blue" />
        </div>

        {/* Agenda del día */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm">
          <div className="p-5 border-b border-primary-100 flex items-center justify-between">
            <h2 className="font-bold text-secondary">Agenda de Hoy</h2>
            <span className="text-sm text-primary-500">{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {todayBookings.length === 0 ? (
            <div className="text-center py-12 text-primary-400">
              <p className="font-medium">Sin turnos para hoy</p>
            </div>
          ) : (
            <div className="divide-y divide-primary-50">
              {todayBookings
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(booking => {
                  const svc = salon.services.find(s => s.id === booking.serviceId);
                  const prof = salon.professionals.find(p => p.id === booking.professionalId);
                  const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.pending;

                  return (
                    <div key={booking.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-14 text-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary-700">{booking.time}</span>
                      </div>
                      <img src={prof?.avatar} alt={prof?.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary text-sm truncate">{booking.clientName}</p>
                        <p className="text-xs text-primary-500 truncate">{svc?.name} · {prof?.name}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-primary-700 hidden sm:block">
                          ${svc?.price.toLocaleString()}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Stats del mes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Turnos del Mes" value={salon.monthlyStats.bookings} sub="Total del mes" icon="📊" color="primary" />
          <StatCard label="Ingresos del Mes" value={`$${salon.monthlyStats.revenue.toLocaleString()}`} sub="Total facturado" icon="💵" color="green" />
          <StatCard label="Clientes Nuevos" value={salon.monthlyStats.newClients} sub="Este mes" icon="✨" color="purple" />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
