import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import StatCard from '../../components/ui/StatCard';

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

  const maxCount = Math.max(...revenueByService.map(s => s.count), 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary">Reportes del Mes</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total turnos" value={completedBookings.length} icon="📅" color="primary" />
          <StatCard label="Facturación bruta" value={`$${totalRevenue.toLocaleString()}`} icon="💰" color="green" />
          <StatCard label="Comisiones" value={`$${totalCommissions.toLocaleString()}`} icon="👤" color="orange" />
          <StatCard label="Ingreso neto" value={`$${netRevenue.toLocaleString()}`} icon="📈" color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Servicios más solicitados */}
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
            <h2 className="font-bold text-secondary mb-4">Servicios más solicitados</h2>
            <div className="space-y-3">
              {revenueByService.map(svc => (
                <div key={svc.name}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium text-secondary truncate pr-2">{svc.name}</span>
                    <span className="text-primary-500 flex-shrink-0">{svc.count} turnos · ${svc.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${(svc.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {revenueByService.length === 0 && <p className="text-sm text-primary-400">Sin datos disponibles</p>}
            </div>
          </div>

          {/* Comisiones por profesional */}
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
            <h2 className="font-bold text-secondary mb-4">Comisiones por profesional</h2>
            <div className="space-y-3">
              {revenueByProf.map(prof => (
                <div key={prof.name} className="flex items-center gap-3 p-3 rounded-xl bg-primary-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary text-sm truncate">{prof.name}</p>
                    <p className="text-xs text-primary-500">{prof.count} turnos · {prof.commissionPct}% comisión</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary-700">${prof.revenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 font-medium">+${prof.commission.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {revenueByProf.length === 0 && <p className="text-sm text-primary-400">Sin datos disponibles</p>}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-primary-100 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-600">Total facturado</span>
                <span className="font-bold text-secondary">${totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-600">Total comisiones</span>
                <span className="font-bold text-orange-600">- ${totalCommissions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-primary-100">
                <span className="font-semibold text-secondary">Ingreso neto</span>
                <span className="font-bold text-green-600">${netRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsView;
