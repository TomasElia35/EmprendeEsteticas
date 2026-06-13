import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import EmployeeLayout from './EmployeeLayout';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className={`bg-white rounded-2xl border border-primary-100 shadow-sm p-5 flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-secondary">{value}</p>
      <p className="text-sm text-primary-500">{label}</p>
      {sub && <p className="text-xs text-primary-400 mt-0.5">{sub}</p>}
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            ¡Hola, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-primary-500 text-sm mt-1">
            {salon?.name} · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Turnos del día"
            value={todayBookings.length}
            sub={`${completedToday.length} completados`}
            color="bg-indigo-50"
            icon="📅"
          />
          <StatCard
            label="Facturación del día"
            value={`$${billedToday.toLocaleString('es-AR')}`}
            sub="Turnos cobrados"
            color="bg-green-50"
            icon="💰"
          />
          <StatCard
            label="Pendientes"
            value={pendingToday.length}
            sub="Por atender"
            color="bg-amber-50"
            icon="⏳"
          />
        </div>

        {/* Próximos turnos */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-50">
            <h2 className="font-bold text-secondary">Próximos Turnos de Hoy</h2>
            <Link to="/empleado/agenda" className="text-sm text-indigo-600 hover:underline font-medium">
              Ver agenda →
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="text-center text-primary-400 py-10 text-sm">No hay turnos pendientes para hoy.</p>
          ) : (
            <ul className="divide-y divide-primary-50">
              {upcomingBookings.map((b) => {
                const service = salon?.services.find((s) => s.id === b.serviceId);
                const professional = salon?.professionals.find((p) => p.id === b.professionalId);
                return (
                  <li key={b.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-14">
                        <p className="font-bold text-secondary">{b.time}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-secondary text-sm">{b.clientName}</p>
                        <p className="text-xs text-primary-400">{service?.name} · {professional?.name}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/empleado/agenda', label: 'Ir a la Agenda', icon: '📅', color: 'bg-indigo-600 hover:bg-indigo-700' },
            { to: '/empleado/productos', label: 'Vender Producto', icon: '🛍️', color: 'bg-primary-600 hover:bg-primary-700' },
            { to: '/empleado/facturacion', label: 'Ver Facturación', icon: '📊', color: 'bg-secondary hover:bg-secondary/90' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`${item.color} text-white rounded-2xl p-5 flex items-center gap-3 transition-colors shadow-sm`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
