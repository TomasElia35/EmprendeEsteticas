import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import Icon from '../../components/ui/Icon';
import { BarCard, PieCard } from '../../components/ui/Charts';
import AnimatedNumber from '../../components/ui/AnimatedNumber';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ReportsView = () => {
  const { user } = useAuth();
  const salon = initialSalons.find(s => s.id === user?.businessId);
  const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
  const allBookings = [...initialBookings, ...stored].filter(b => b.salonId === salon?.id);

  const completedBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');

  // Revenue por servicio
  const revenueByService = salon?.services.map(svc => {
    const count = completedBookings.filter(b => b.serviceId === svc.id).length;
    return { name: svc.name, count, revenue: count * svc.price };
  }).sort((a, b) => b.count - a.count) || [];

  // Revenue por profesional con comisión
  const revenueByProf = salon?.professionals.map(prof => {
    const bookings = completedBookings.filter(b => b.professionalId === prof.id);
    const revenue = bookings.reduce((sum, b) => {
      const svc = salon.services.find(s => s.id === b.serviceId);
      return sum + (svc?.price || 0);
    }, 0);
    const commission = Math.round(revenue * (prof.commission / 100));
    return { name: prof.name, count: bookings.length, revenue, commission, commissionPct: prof.commission };
  }).sort((a, b) => b.revenue - a.revenue) || [];

  const totalRevenue = revenueByProf.reduce((s, p) => s + p.revenue, 0);
  const totalCommissions = revenueByProf.reduce((s, p) => s + p.commission, 0);
  const netRevenue = totalRevenue - totalCommissions;

  // ── Datos para gráficos ──────────────────────────────────────
  // Servicios más solicitados (cantidad de turnos por servicio)
  const serviceChartData = revenueByService
    .filter(s => s.count > 0)
    .slice(0, 6)
    .map(s => ({ name: s.name, cantidad: s.count }));

  // Ingresos + comisiones por profesional
  const profChartData = revenueByProf
    .filter(p => p.count > 0)
    .map(p => ({ name: p.name, ingresos: p.revenue, comisiones: p.commission }));

  // Composición de ingresos (neto vs comisiones)
  const splitChartData = totalRevenue > 0
    ? [
        { name: 'Ingreso neto', value: netRevenue },
        { name: 'Comisiones', value: totalCommissions },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Reportes del Mes</h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="calendar" className="w-4 h-4 text-primary-500" />
              <span className="stat-label">Total turnos</span>
            </div>
            <p className="stat-value"><AnimatedNumber value={completedBookings.length} /></p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="dollar" className="w-4 h-4 text-primary-500" />
              <span className="stat-label">Facturación bruta</span>
            </div>
            <p className="stat-value text-gold"><AnimatedNumber value={totalRevenue} prefix="$" /></p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="user" className="w-4 h-4 text-primary-500" />
              <span className="stat-label">Comisiones</span>
            </div>
            <p className="stat-value"><AnimatedNumber value={totalCommissions} prefix="$" /></p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="arrow-trending-up" className="w-4 h-4 text-primary-500" />
              <span className="stat-label">Ingreso neto</span>
            </div>
            <p className="stat-value"><AnimatedNumber value={netRevenue} prefix="$" /></p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarCard
            title="Servicios más solicitados"
            subtitle="Cantidad de turnos por servicio"
            data={serviceChartData}
            bars={[{ key: 'cantidad', label: 'Turnos' }]}
          />
          <BarCard
            title="Ingresos por profesional"
            subtitle="Facturación y comisiones"
            money
            data={profChartData}
            bars={[
              { key: 'ingresos', label: 'Ingresos' },
              { key: 'comisiones', label: 'Comisiones' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PieCard
            title="Composición de ingresos"
            subtitle="Ingreso neto vs comisiones"
            money
            data={splitChartData}
          />

          {/* Detalle por profesional */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Icon name="users" className="w-4 h-4 text-primary-500" />
                <h2 className="font-bold text-secondary">Comisiones por profesional</h2>
              </div>
            </div>
            <div className="card-body space-y-3">
              {revenueByProf.map(prof => (
                <div key={prof.name} className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 hover:bg-primary-50/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary text-sm truncate">{prof.name}</p>
                    <p className="text-xs text-primary-500">{prof.count} turnos · {prof.commissionPct}% comisión</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary-700">${prof.revenue.toLocaleString()}</p>
                    <p className="text-xs text-primary-600 font-medium">+${prof.commission.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {revenueByProf.length === 0 && (
                <p className="text-sm text-primary-400">Sin datos disponibles</p>
              )}

              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-primary-100 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-600">Total facturado</span>
                  <span className="font-bold text-secondary">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Total comisiones</span>
                  <span className="font-bold text-primary-700">- ${totalCommissions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-primary-100">
                  <span className="font-semibold text-secondary">Ingreso neto</span>
                  <span className="font-bold text-gold">${netRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsView;
