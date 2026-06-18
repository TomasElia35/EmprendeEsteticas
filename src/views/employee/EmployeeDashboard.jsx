import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import EmployeeLayout from './EmployeeLayout';
import Icon from '../../components/ui/Icon';

const StatCard = ({ label, value, sub, iconName, iconClass }) => (
  <div className="stat-card">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
        <Icon name={iconName} className={`w-5 h-5 ${iconClass}`} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  </div>
);

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const salon = initialSalons.find((s) => s.id === user?.businessId);
  const [bookings] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    return [...initialBookings, ...stored];
  });

  const todayBookings = bookings.filter(
    (b) => b.salonId === user?.businessId && b.date === today
  );
  const completedToday = todayBookings.filter((b) => b.status === 'completed');
  const pendingToday = todayBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  // Facturación del día (solo turnos completados con pago)
  const billedToday = completedToday.reduce(
    (sum, b) => sum + (b.payment?.amount || 0),
    0
  );

  const nowTime = new Date();
  const upcomingBookings = pendingToday
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 4);

  return (
    <EmployeeLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-secondary tracking-tight">
              Hola, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-primary-500 text-sm mt-1">
              {salon?.name} · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Turnos del día"
            value={todayBookings.length}
            sub={`${completedToday.length} completados`}
            iconName="calendar"
            iconClass="text-primary-600"
          />
          <StatCard
            label="Facturación del día"
            value={`$${billedToday.toLocaleString('es-AR')}`}
            sub="Turnos cobrados"
            iconName="dollar"
            iconClass="text-accent"
          />
          <StatCard
            label="Pendientes"
            value={pendingToday.length}
            sub="Por atender"
            iconName="clock"
            iconClass="text-primary-500"
          />
        </div>

        {/* Próximos turnos */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-bold text-secondary">Próximos Turnos de Hoy</h2>
            <Link
              to="/empleado/agenda"
              className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors"
            >
              Ver agenda
              <Icon name="arrow-right" className="w-4 h-4" />
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="card-body">
              <p className="text-center text-primary-400 py-8 text-sm">
                No hay turnos pendientes para hoy.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-primary-100">
              {upcomingBookings.map((b) => {
                const service = salon?.services.find((s) => s.id === b.serviceId);
                const professional = salon?.professionals.find((p) => p.id === b.professionalId);
                return (
                  <li key={b.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-primary-50/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-14 flex-shrink-0">
                        <p className="font-bold text-secondary text-sm">{b.time}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-secondary text-sm">{b.clientName}</p>
                        <p className="text-xs text-primary-400">{service?.name} · {professional?.name}</p>
                      </div>
                    </div>
                    <span className={`badge ${
                      b.status === 'confirmed' ? 'badge-success' :
                      b.status === 'pending' ? 'badge-warning' :
                      'badge-neutral'
                    }`}>
                      {b.status === 'confirmed' ? 'Confirmado' : b.status === 'pending' ? 'Pendiente' : b.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Accesos rápidos */}
        <div>
          <p className="section-label mb-3">Accesos rápidos</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/empleado/agenda"
              className="card card-body flex items-center gap-3 hover:border-primary-300 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Icon name="calendar" className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-semibold text-secondary">Ir a la Agenda</span>
              <Icon name="chevron-right" className="w-4 h-4 text-primary-400 ml-auto" />
            </Link>
            <Link
              to="/empleado/productos"
              className="card card-body flex items-center gap-3 hover:border-primary-300 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Icon name="package" className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-semibold text-secondary">Vender Producto</span>
              <Icon name="chevron-right" className="w-4 h-4 text-primary-400 ml-auto" />
            </Link>
            <Link
              to="/empleado/facturacion"
              className="card card-body flex items-center gap-3 hover:border-primary-300 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Icon name="chart" className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-semibold text-secondary">Ver Facturación</span>
              <Icon name="chevron-right" className="w-4 h-4 text-primary-400 ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
