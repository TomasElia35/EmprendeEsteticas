import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import { calculateCommission } from '../../data/mockCommissions';
import StatCard from '../../components/ui/StatCard';
import AdminLayout from './AdminLayout';
import Icon from '../../components/ui/Icon';
import AnimatedNumber from '../../components/ui/AnimatedNumber';
import { BarCard, PieCard } from '../../components/ui/Charts';

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

  // ── Derivación de datos para gráficos (mes actual) ──────────────
  const currentMonth = today.slice(0, 7); // YYYY-MM
  const completedThisMonth = allBookings.filter(
    b => b.salonId === salon?.id && b.status === 'completed' && b.payment && b.date.startsWith(currentMonth)
  );

  // Ingresos vs comisiones por profesional
  const professionalChartData = (salon?.professionals || [])
    .map(prof => {
      const profBookings = completedThisMonth.filter(b => b.professionalId === prof.id);
      const ingresos = profBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
      const comisiones = profBookings.reduce((sum, b) => {
        const { amount } = calculateCommission(b.payment?.amount || 0, prof, b.serviceId);
        return sum + amount;
      }, 0);
      return { name: prof.name.split(' ')[0], ingresos, comisiones };
    })
    .filter(p => p.ingresos > 0);

  // Servicios (turnos completados) vs Productos (ventas en localStorage)
  const serviciosTotal = completedThisMonth.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
  const allSales = JSON.parse(localStorage.getItem(`estetica_sales_${salon?.id}`) || '[]');
  const productosTotal = allSales
    .filter(s => s.date && s.date.startsWith(currentMonth))
    .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const mixData = [
    { name: 'Servicios', value: serviciosTotal },
    { name: 'Productos', value: productosTotal },
  ].filter(d => d.value > 0);

  if (!salon) return (
    <AdminLayout>
      <div className="text-center py-16 text-primary-500">No se encontró el negocio asignado.</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="glass rounded-2xl px-6 py-5 page-header">
          <div>
            <h1 className="page-title">{salon.name}</h1>
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
          <div className="stat-card lift">
            <Icon name="calendar" className="w-6 h-6 text-primary-500 mb-2" />
            <p className="stat-value"><AnimatedNumber value={todayBookings.length} /></p>
            <p className="stat-label">Turnos Hoy</p>
            <p className="stat-sub">{confirmedCount} confirmados</p>
          </div>
          <div className="stat-card lift">
            <Icon name="clock" className="w-6 h-6 text-accent mb-2" />
            <p className="stat-value"><AnimatedNumber value={pendingCount} /></p>
            <p className="stat-label">Pendientes</p>
            <p className="stat-sub">Sin confirmar</p>
          </div>
          <div className="stat-card lift">
            <Icon name="dollar" className="w-6 h-6 text-gold-600 mb-2" />
            <p className="stat-value text-gold"><AnimatedNumber value={todayRevenue} prefix="$" /></p>
            <p className="stat-label">Ingresos Hoy</p>
            <p className="stat-sub">Turnos confirmados</p>
          </div>
          <div className="stat-card lift">
            <Icon name="users" className="w-6 h-6 text-primary-500 mb-2" />
            <p className="stat-value"><AnimatedNumber value={salon.monthlyStats.newClients} /></p>
            <p className="stat-label">Clientes Mes</p>
            <p className="stat-sub">Nuevos este mes</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarCard
            title="Ingresos por profesional"
            subtitle="Turnos completados del mes — ingresos vs comisiones"
            money
            data={professionalChartData}
            bars={[
              { key: 'ingresos', label: 'Ingresos' },
              { key: 'comisiones', label: 'Comisiones' },
            ]}
          />
          <PieCard
            title="Servicios vs Productos"
            subtitle="Distribución de facturación del mes"
            money
            data={mixData}
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
                        <span className="text-sm font-semibold text-gold hidden sm:block">
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
            <div className="stat-card lift">
              <Icon name="chart" className="w-6 h-6 text-primary-500 mb-2" />
              <p className="stat-value"><AnimatedNumber value={salon.monthlyStats.bookings} /></p>
              <p className="stat-label">Turnos del Mes</p>
              <p className="stat-sub">Total del mes</p>
            </div>
            <div className="stat-card lift">
              <Icon name="arrow-trending-up" className="w-6 h-6 text-gold-600 mb-2" />
              <p className="stat-value text-gold"><AnimatedNumber value={salon.monthlyStats.revenue} prefix="$" /></p>
              <p className="stat-label">Ingresos del Mes</p>
              <p className="stat-sub">Total facturado</p>
            </div>
            <div className="stat-card lift">
              <Icon name="sparkles" className="w-6 h-6 text-primary-500 mb-2" />
              <p className="stat-value"><AnimatedNumber value={salon.monthlyStats.newClients} /></p>
              <p className="stat-label">Clientes Nuevos</p>
              <p className="stat-sub">Este mes</p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
