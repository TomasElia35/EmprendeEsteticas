import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import { getDailyBillingSummary } from '../../data/mockCommissions';
import EmployeeLayout from './EmployeeLayout';

const DailyBillingView = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const salon = initialSalons.find((s) => s.id === user?.businessId);
  const allBookings = (() => {
    const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    return [...initialBookings, ...stored];
  })();
  const allSales = JSON.parse(localStorage.getItem(`estetica_sales_${user?.businessId}`) || '[]');

  const { totalBilled, byProfessional, completedBookings } = getDailyBillingSummary(
    user?.businessId,
    selectedDate,
    allBookings,
    salon?.professionals || [],
    salon?.services || [],
  );

  const daySales = allSales.filter((s) => s.date === selectedDate);
  const totalSales = daySales.reduce((sum, s) => sum + s.totalPrice, 0);
  const grandTotal = totalBilled + totalSales;
  const totalCommissions = byProfessional.reduce((sum, p) => sum + p.commissionAmount, 0);

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary">Facturación del Día</h1>
            <p className="text-primary-500 text-sm mt-1">{salon?.name}</p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-primary-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Turnos cobrados', value: `$${totalBilled.toLocaleString('es-AR')}`, sub: `${completedBookings.length} turno${completedBookings.length !== 1 ? 's' : ''}`, icon: '💇', color: 'border-indigo-100 bg-indigo-50' },
            { label: 'Ventas productos', value: `$${totalSales.toLocaleString('es-AR')}`, sub: `${daySales.length} venta${daySales.length !== 1 ? 's' : ''}`, icon: '🛍️', color: 'border-primary-100 bg-primary-50' },
            { label: 'Comisiones del día', value: `$${totalCommissions.toLocaleString('es-AR')}`, sub: 'A distribuir', icon: '💰', color: 'border-amber-100 bg-amber-50' },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border ${item.color} p-5`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xl font-bold text-secondary">{item.value}</p>
              <p className="text-sm text-primary-500">{item.label}</p>
              <p className="text-xs text-primary-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Turnos completados */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-primary-50">
            <h2 className="font-bold text-secondary">Turnos Cobrados</h2>
          </div>
          {completedBookings.length === 0 ? (
            <p className="text-center text-primary-400 py-10 text-sm">No hay turnos cobrados en esta fecha.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-primary-100 text-primary-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-6 py-3">Horario</th>
                  <th className="text-left px-6 py-3">Cliente</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Servicio</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Método</th>
                  <th className="text-right px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {completedBookings.map((b) => {
                  const service = salon?.services.find((s) => s.id === b.serviceId);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-medium text-secondary">{b.time}</td>
                      <td className="px-6 py-3 text-secondary">{b.clientName}</td>
                      <td className="px-6 py-3 text-primary-500 hidden md:table-cell">{service?.name}</td>
                      <td className="px-6 py-3 text-primary-500 hidden md:table-cell capitalize">{b.payment?.method}</td>
                      <td className="px-6 py-3 text-right font-bold text-secondary">
                        ${b.payment?.amount?.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Comisiones por profesional */}
        {byProfessional.length > 0 && (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-50">
              <h2 className="font-bold text-secondary">Comisiones a Distribuir</h2>
            </div>
            <div className="divide-y divide-primary-50">
              {byProfessional.map(({ professional, bookingsCount, totalBilled: profTotal, commissionPercent, commissionAmount }) => (
                <div key={professional.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={professional.avatar} alt={professional.name} className="w-9 h-9 rounded-full" />
                    <div>
                      <p className="font-semibold text-secondary text-sm">{professional.name}</p>
                      <p className="text-xs text-primary-400">{bookingsCount} turno{bookingsCount !== 1 ? 's' : ''} · {commissionPercent}% comisión</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600 text-lg">${commissionAmount.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-primary-400">de ${profTotal.toLocaleString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-primary-200 bg-gray-50/50 flex justify-between">
              <span className="font-bold text-secondary">Total comisiones</span>
              <span className="font-bold text-indigo-700 text-lg">${totalCommissions.toLocaleString('es-AR')}</span>
            </div>
          </div>
        )}

        {/* Ventas de productos del día */}
        {daySales.length > 0 && (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-50">
              <h2 className="font-bold text-secondary">Ventas de Productos</h2>
            </div>
            <ul className="divide-y divide-primary-50">
              {daySales.map((s) => (
                <li key={s.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary text-sm">{s.productName}</p>
                    <p className="text-xs text-primary-400">{s.clientName} · {s.quantity} unidad{s.quantity !== 1 ? 'es' : ''}</p>
                  </div>
                  <span className="font-bold text-secondary">${s.totalPrice.toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
            <div className="px-6 py-4 border-t border-primary-200 bg-gray-50/50 flex justify-between">
              <span className="font-semibold text-primary-600">Subtotal productos</span>
              <span className="font-bold text-secondary">${totalSales.toLocaleString('es-AR')}</span>
            </div>
          </div>
        )}

        {/* Grand total */}
        <div className="bg-gradient-to-r from-secondary to-primary-800 text-white rounded-2xl p-6 flex justify-between items-center">
          <div>
            <p className="text-white/70 text-sm">Facturación total del día</p>
            <p className="text-3xl font-bold mt-1">${grandTotal.toLocaleString('es-AR')}</p>
          </div>
          <div className="text-5xl">📊</div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default DailyBillingView;
