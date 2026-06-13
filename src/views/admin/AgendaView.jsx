import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import CancelRequestsPanel from '../../components/CancelRequestsPanel';
import { toast } from '../../components/ui/Toast';

const STATUS_COLORS = {
  confirmed: 'bg-green-100 border-green-300 text-green-800',
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  cancelled: 'bg-red-100 border-red-300 text-red-700 opacity-60',
  cancel_requested: 'bg-amber-100 border-amber-300 text-amber-800',
};

const AgendaView = () => {
  const { user } = useAuth();
  const salon = initialSalons.find(s => s.id === user?.businessId);

  const [bookings, setBookings] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    return [...initialBookings, ...stored];
  });

  const today = new Date();
  const [selectedProfId, setSelectedProfId] = useState('all');
  const [viewDate, setViewDate] = useState(today.toISOString().split('T')[0]);

  const salonBookings = bookings.filter(b => b.salonId === salon?.id);

  const filteredBookings = salonBookings.filter(b => {
    const matchDate = b.date === viewDate;
    const matchProf = selectedProfId === 'all' || b.professionalId === Number(selectedProfId);
    return matchDate && matchProf;
  });

  const getService = (sid) => salon?.services.find(s => s.id === sid);
  const getProf = (pid) => salon?.professionals.find(p => p.id === pid);

  const persistBookings = (updated) => {
    const newOnes = updated.filter(b => !initialBookings.find(ib => ib.id === b.id));
    localStorage.setItem('estetica_bookings', JSON.stringify(newOnes));
  };

  // Confirmar seña recibida por el admin
  const handleConfirmDeposit = (bookingId) => {
    const updated = bookings.map(b =>
      b.id === bookingId && b.deposit
        ? { ...b, deposit: { ...b.deposit, confirmedByAdmin: true } }
        : b
    );
    setBookings(updated);
    persistBookings(updated);
    toast.success('Seña confirmada correctamente.');
  };

  // Resolver solicitud de cancelación: cancel_refund | cancel_no_refund | reject
  const handleResolveCancelRequest = (bookingId, action) => {
    const updated = bookings.map(b => {
      if (b.id !== bookingId) return b;
      if (action === 'reject') {
        return { ...b, cancelRequest: null };
      }
      const refunded = action === 'cancel_refund';
      return {
        ...b,
        status: 'cancelled',
        cancelRequest: null,
        deposit: b.deposit ? { ...b.deposit, refunded } : null,
      };
    });
    setBookings(updated);
    persistBookings(updated);
    if (action === 'reject') {
      toast.info('Solicitud rechazada. El turno sigue activo.');
    } else {
      const msg = action === 'cancel_refund'
        ? 'Turno cancelado. Se devolverá la seña al cliente.'
        : 'Turno cancelado. La seña no será devuelta.';
      toast.success(msg);
    }
  };

  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-secondary">Agenda</h1>
          <div className="flex gap-3">
            <input
              type="date"
              value={viewDate}
              onChange={e => setViewDate(e.target.value)}
              className="border border-primary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <select
              value={selectedProfId}
              onChange={e => setSelectedProfId(e.target.value)}
              className="border border-primary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">Todos los profesionales</option>
              {salon?.professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Panel de solicitudes de cancelación */}
        <CancelRequestsPanel
          salon={salon}
          bookings={salonBookings}
          onResolve={handleResolveCancelRequest}
        />

        {/* Señas pendientes de confirmar */}
        {(() => {
          const pendingDeposits = salonBookings.filter(
            b => b.deposit?.paid && !b.deposit?.confirmedByAdmin && b.status !== 'cancelled'
          );
          if (pendingDeposits.length === 0) return null;
          return (
            <div className="bg-white rounded-2xl border-2 border-yellow-200 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-secondary flex items-center gap-2 text-sm">
                <span className="text-lg">⚠️</span>
                Señas pendientes de confirmar ({pendingDeposits.length})
              </h3>
              <ul className="space-y-2">
                {pendingDeposits.map(b => {
                  const svc = getService(b.serviceId);
                  return (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 bg-yellow-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-semibold text-secondary text-sm">{b.clientName}</p>
                        <p className="text-xs text-primary-400">{svc?.name} — {b.date} {b.time}hs · Seña ${b.deposit.amount.toLocaleString('es-AR')}</p>
                      </div>
                      <button
                        id={`confirm-deposit-${b.id}`}
                        onClick={() => handleConfirmDeposit(b.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                      >
                        ✅ Confirmar recepción
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

        {/* Timeline view */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: '64px 1fr' }}>
            {/* Time column */}
            <div className="border-r border-primary-100">
              <div className="h-12 border-b border-primary-100" />
              {hours.map(h => (
                <div key={h} className="h-16 border-b border-primary-50 flex items-center justify-center">
                  <span className="text-xs text-primary-400 font-medium">{h}</span>
                </div>
              ))}
            </div>

            {/* Bookings column */}
            <div className="relative">
              <div className="h-12 border-b border-primary-100 flex items-center px-4">
                <span className="text-sm font-semibold text-secondary">
                  {new Date(viewDate + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="relative">
                {hours.map(h => (
                  <div key={h} className="h-16 border-b border-primary-50" />
                ))}

                {filteredBookings.map(booking => {
                  const svc = getService(booking.serviceId);
                  const prof = getProf(booking.professionalId);
                  const [hh, mm] = booking.time.split(':').map(Number);
                  const startHour = 9;
                  const topPx = ((hh - startHour) * 60 + mm) * (64 / 60);
                  const heightPx = ((svc?.duration || 60) / 60) * 64;
                  const statusKey = booking.cancelRequest && booking.status !== 'cancelled'
                    ? 'cancel_requested'
                    : booking.status;
                  const statusColor = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;

                  return (
                    <div
                      key={booking.id}
                      className={`absolute left-2 right-2 rounded-lg border px-3 py-1.5 text-xs overflow-hidden ${statusColor}`}
                      style={{ top: `${topPx}px`, height: `${Math.max(heightPx, 32)}px` }}
                    >
                      <p className="font-bold truncate">{booking.time} — {booking.clientName}</p>
                      <p className="truncate">{svc?.name}</p>
                      {prof && <p className="truncate opacity-70">{prof.name}</p>}
                      {booking.deposit?.paid && !booking.deposit?.confirmedByAdmin && (
                        <p className="text-amber-700 font-semibold">⚠️ Seña sin confirmar</p>
                      )}
                      {booking.cancelRequest && <p className="font-semibold">🔔 Cancel. solicitada</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-primary-400 bg-white rounded-2xl border border-primary-100">
            Sin turnos para esta fecha
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AgendaView;
