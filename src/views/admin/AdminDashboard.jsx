import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import StatCard from '../../components/ui/StatCard';
import AdminLayout from './AdminLayout';
import Icon from '../../components/ui/Icon';

const STATUS_MAP = {
  confirmed: { label: 'Confirmado', badge: 'badge badge-success' },
  pending:   { label: 'Pendiente',  badge: 'badge badge-warning' },
  cancelled: { label: 'Cancelado',  badge: 'badge badge-danger' },
  completed: { label: 'Completado', badge: 'badge badge-info' },
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
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-secondary tracking-tight">{salon.name}</h1>
            <p className="text-primary-500 text-sm mt-1 flex items-center gap-1.5">
              <Icon name="map-pin" className="w-4 h-4 text-primary-400" />
              {salon.address}
              <span className="text-primary-300 mx-1">·</span>
              <Icon name="clock" className="w-4 h-4 text-primary-400" />
              {salon.openHours}
            </p>
          </div>
        </div>

        {/* KPIs del día */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Turnos Hoy"
            value={todayBookings.length}
            sub={`${confirmedCount} confirmados`}
            iconName="calendar"
            color="primary"
          />
          <StatCard
            label="Pendientes"
            value={pendingCount}
            sub="Sin confirmar"
            iconName="clock"
            color="orange"
          />
          <StatCard
            label="Ingresos Hoy"
            value={`$${todayRevenue.toLocaleString()}`}
            sub="Turnos confirmados"
            iconName="dollar"
            color="green"
          />
          <StatCard
            label="Clientes Mes"
            value={salon.monthlyStats.newClients}
            sub="Nuevos este mes"
            iconName="users"
            color="blue"
          />
        </div>

        {/* Agenda del día */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="calendar" className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary">Agenda de Hoy</h2>
            </div>
            <span className="text-sm text-primary-400">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {todayBookings.length === 0 ? (
            <div className="card-body text-center py-12">
              <Icon name="calendar" className="w-10 h-10 text-primary-200 mx-auto mb-3" />
              <p className="font-medium text-primary-400">Sin turnos para hoy</p>
            </div>
          ) : (
            <div className="divide-y divide-primary-100">
              {todayBookings
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(booking => {
                  const svc = salon.services.find(s => s.id === booking.serviceId);
                  const prof = salon.professionals.find(p => p.id === booking.professionalId);
                  const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.pending;

                  return (
                    <div key={booking.id} className="flex items-center gap-4 px-5 py-4 hover:bg-primary-50/60 transition-colors">
                      <div className="w-14 text-center flex-shrink-0">
                        <span className="text-base font-bold text-primary-700">{booking.time}</span>
                      </div>
                      <img src={prof?.avatar} alt={prof?.name} className="w-9 h-9 rounded-full flex-shrink-0 object-cover border border-primary-200" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary text-sm truncate">{booking.clientName}</p>
                        <p className="text-xs text-primary-500 truncate">{svc?.name} · {prof?.name}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-primary-700 hidden sm:block">
                          ${svc?.price.toLocaleString()}
                        </span>
                        <span className={statusInfo.badge}>
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
        <div>
          <p className="section-label mb-3">Resumen del mes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Turnos del Mes"
              value={salon.monthlyStats.bookings}
              sub="Total del mes"
              iconName="chart"
              color="primary"
            />
            <StatCard
              label="Ingresos del Mes"
              value={`$${salon.monthlyStats.revenue.toLocaleString()}`}
              sub="Total facturado"
              iconName="arrow-trending-up"
              color="green"
            />
            <StatCard
              label="Clientes Nuevos"
              value={salon.monthlyStats.newClients}
              sub="Este mes"
              iconName="sparkles"
              color="purple"
            />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
