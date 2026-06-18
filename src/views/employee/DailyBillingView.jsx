import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import { getDailyBillingSummary, getRangeBillingSummary } from '../../data/mockCommissions';
import EmployeeLayout from './EmployeeLayout';
import Icon from '../../components/ui/Icon';

const DailyBillingView = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState('day'); // 'day' | 'range'
  const [selectedDate, setSelectedDate] = useState(today);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const salon = initialSalons.find((s) => s.id === user?.businessId);
  const allBookings = (() => {
    const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    return [...initialBookings, ...stored];
  })();
  const allSales = JSON.parse(localStorage.getItem(`estetica_sales_${user?.businessId}`) || '[]');

  const { totalBilled, byProfessional, completedBookings } = mode === 'day'
    ? getDailyBillingSummary(user?.businessId, selectedDate, allBookings, salon?.professionals || [], salon?.services || [])
    : getRangeBillingSummary(user?.businessId, fromDate, toDate, allBookings, salon?.professionals || [], salon?.services || []);

  const filteredSales = mode === 'day'
    ? allSales.filter((s) => s.date === selectedDate)
    : allSales.filter((s) => s.date >= fromDate && s.date <= toDate);

  const totalSales = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);
  const grandTotal = totalBilled + totalSales;
  const totalCommissions = byProfessional.reduce((sum, p) => sum + p.commissionAmount, 0);

  const periodLabel = mode === 'day'
    ? new Date(selectedDate + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    : `${fromDate} → ${toDate}`;

  return (
    <EmployeeLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="page-header flex-wrap gap-4">
          <div>
            <h1 className="page-title">Facturación</h1>
            <p className="text-primary-500 text-sm mt-1">{salon?.name}</p>
          </div>

          {/* Period controls */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Mode toggle — segmented control */}
            <div className="flex rounded-xl border border-primary-200 overflow-hidden text-sm">
              <button
                onClick={() => setMode('day')}
                className={`px-4 py-2 font-medium transition-colors ${mode === 'day' ? 'bg-primary-700 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
              >
                Día
              </button>
              <button
                onClick={() => setMode('range')}
                className={`px-4 py-2 font-medium transition-colors ${mode === 'range' ? 'bg-primary-700 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
              >
                Rango
              </button>
            </div>

            {mode === 'day' ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
              />
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="input"
                />
                <span className="text-primary-400 text-sm font-medium">
                  <Icon name="arrow-right" className="w-4 h-4 text-primary-400" />
                </span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="input"
                />
              </div>
            )}
          </div>
        </div>

        {/* Active period label */}
        <div className="bg-primary-100 border border-primary-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Icon name="calendar" className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <p className="text-sm text-primary-700 font-medium capitalize">{periodLabel}</p>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Turnos cobrados</span>
              <Icon name="receipt" className="w-5 h-5 text-primary-400" />
            </div>
            <p className="stat-value">${totalBilled.toLocaleString('es-AR')}</p>
            <p className="stat-sub">{completedBookings.length} turno{completedBookings.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Ventas productos</span>
              <Icon name="package" className="w-5 h-5 text-primary-400" />
            </div>
            <p className="stat-value">${totalSales.toLocaleString('es-AR')}</p>
            <p className="stat-sub">{filteredSales.length} venta{filteredSales.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Comisiones</span>
              <Icon name="dollar" className="w-5 h-5 text-primary-400" />
            </div>
            <p className="stat-value">${totalCommissions.toLocaleString('es-AR')}</p>
            <p className="stat-sub">A distribuir</p>
          </div>
        </div>

        {/* Completed bookings table */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-bold text-secondary">Turnos Cobrados</h2>
          </div>
          <div className="card-body p-0">
            {completedBookings.length === 0 ? (
              <p className="text-center text-primary-400 py-10 text-sm">No hay turnos cobrados en este período.</p>
            ) : (
              <div className="table-container">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {mode === 'range' && <th className="table-th text-left">Fecha</th>}
                      <th className="table-th text-left">Horario</th>
                      <th className="table-th text-left">Cliente</th>
                      <th className="table-th text-left hidden md:table-cell">Servicio</th>
                      <th className="table-th text-left hidden md:table-cell">Método</th>
                      <th className="table-th text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    {completedBookings.map((b) => {
                      const service = salon?.services.find((s) => s.id === b.serviceId);
                      return (
                        <tr key={b.id} className="hover:bg-primary-50/60 transition-colors">
                          {mode === 'range' && <td className="table-td text-primary-400 text-xs">{b.date}</td>}
                          <td className="table-td font-medium text-secondary">{b.time}</td>
                          <td className="table-td text-secondary">{b.clientName}</td>
                          <td className="table-td text-primary-500 hidden md:table-cell">{service?.name}</td>
                          <td className="table-td text-primary-500 hidden md:table-cell capitalize">{b.payment?.method}</td>
                          <td className="table-td text-right font-bold text-secondary">
                            ${b.payment?.amount?.toLocaleString('es-AR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Commission breakdown by professional */}
        {byProfessional.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="font-bold text-secondary">Comisiones a Distribuir</h2>
            </div>
            <div className="card-body p-0">
              <div className="divide-y divide-primary-100">
                {byProfessional.map(({ professional, bookingsCount, totalBilled: profTotal, commissionPercent, commissionAmount }) => (
                  <div key={professional.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-primary-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={professional.avatar} alt={professional.name} className="w-9 h-9 rounded-full object-cover border border-primary-200" />
                      <div>
                        <p className="font-semibold text-secondary text-sm">{professional.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-primary-400">{bookingsCount} turno{bookingsCount !== 1 ? 's' : ''}</span>
                          <span className="badge badge-neutral text-xs">{commissionPercent}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-700 text-lg">${commissionAmount.toLocaleString('es-AR')}</p>
                      <p className="text-xs text-primary-400">de ${profTotal.toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-primary-200 bg-primary-50 flex justify-between items-center">
                <span className="font-bold text-secondary">Total comisiones</span>
                <span className="font-bold text-primary-700 text-lg">${totalCommissions.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Product sales */}
        {filteredSales.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="font-bold text-secondary">Ventas de Productos</h2>
            </div>
            <div className="card-body p-0">
              <ul className="divide-y divide-primary-100">
                {filteredSales.map((s) => (
                  <li key={s.id} className="px-6 py-3 flex items-center justify-between hover:bg-primary-50/60 transition-colors">
                    <div>
                      <p className="font-medium text-secondary text-sm">{s.productName}</p>
                      <p className="text-xs text-primary-400">
                        {s.clientName} · {s.quantity} unidad{s.quantity !== 1 ? 'es' : ''}
                        {mode === 'range' && <span> · {s.date}</span>}
                      </p>
                    </div>
                    <span className="font-bold text-secondary">${s.totalPrice.toLocaleString('es-AR')}</span>
                  </li>
                ))}
              </ul>
              <div className="px-6 py-4 border-t border-primary-200 bg-primary-50 flex justify-between items-center">
                <span className="font-semibold text-primary-600">Subtotal productos</span>
                <span className="font-bold text-secondary">${totalSales.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Grand total */}
        <div className="bg-primary-800 text-white rounded-2xl p-6 flex justify-between items-center">
          <div>
            <p className="text-white/70 text-sm">
              {mode === 'day' ? 'Facturación total del día' : 'Facturación total del período'}
            </p>
            <p className="display text-3xl font-bold mt-1 text-gold-400">${grandTotal.toLocaleString('es-AR')}</p>
          </div>
          <Icon name="chart" className="w-10 h-10 text-white/40" />
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default DailyBillingView;
