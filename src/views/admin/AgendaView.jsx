import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import CancelRequestsPanel from '../../components/CancelRequestsPanel';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

const STATUS_COLORS = {
  confirmed: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  pending: 'bg-amber-50 border-amber-200 text-amber-800',
  cancelled: 'bg-primary-50 border-primary-200 text-primary-400 opacity-70',
  cancel_requested: 'bg-red-50 border-red-200 text-red-700',
  completed: 'bg-primary-100 border-primary-300 text-primary-800',
};

const SLOT_HEIGHT = 64; // px per hour
const START_HOUR = 9;
const END_HOUR = 19;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) =>
  `${String(START_HOUR + i).padStart(2, '0')}:00`
);

const addMinutes = (time, mins) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
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
  const [showAvailable, setShowAvailable] = useState(false);

  const salonBookings = bookings.filter(b => b.salonId === salon?.id);

  const getService = (sid) => salon?.services.find(s => s.id === sid);
  const getProf = (pid) => salon?.professionals.find(p => p.id === pid);

  const persistBookings = (updated) => {
    const newOnes = updated.filter(b => !initialBookings.find(ib => ib.id === b.id));
    localStorage.setItem('estetica_bookings', JSON.stringify(newOnes));
  };

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

  const handleResolveCancelRequest = (bookingId, action) => {
    const updated = bookings.map(b => {
      if (b.id !== bookingId) return b;
      if (action === 'reject') return { ...b, cancelRequest: null };
      const refunded = action === 'cancel_refund';
      return { ...b, status: 'cancelled', cancelRequest: null, deposit: b.deposit ? { ...b.deposit, refunded } : null };
    });
    setBookings(updated);
    persistBookings(updated);
    if (action === 'reject') toast.info('Solicitud rechazada. El turno sigue activo.');
    else toast.success(action === 'cancel_refund' ? 'Turno cancelado. Se devolverá la seña.' : 'Turno cancelado sin devolución.');
  };

  // Profesionales a mostrar en las columnas
  const displayedProfs = selectedProfId === 'all'
    ? (salon?.professionals || [])
    : (salon?.professionals || []).filter(p => p.id === Number(selectedProfId));

  // Bookings del día filtrados
  const dayBookings = salonBookings.filter(b => b.date === viewDate);

  // Verifica si un slot de 30min está ocupado para un profesional
  const isSlotOccupied = (profId, slotHour, slotMin) => {
    return dayBookings.some(b => {
      if (b.professionalId !== profId || b.status === 'cancelled' || !b.time?.includes(':')) return false;
      const svc = getService(b.serviceId);
      const bStart = timeToMinutes(b.time);
      const bEnd = bStart + (svc?.duration || 60);
      const sStart = slotHour * 60 + slotMin;
      const sEnd = sStart + 30;
      return sStart < bEnd && sEnd > bStart;
    });
  };

  // Genera todos los slots disponibles de 30 min para un profesional
  const getAvailableSlots = (profId) => {
    const slots = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (!isSlotOccupied(profId, h, m)) {
          slots.push({ hour: h, min: m });
        }
      }
    }
    return slots;
  };

  // Bookings de un profesional en el día
  const getProfBookings = (profId) =>
    dayBookings.filter(b => b.professionalId === profId);

  // Conteo de slots disponibles totales
  const totalAvailableSlots = displayedProfs.reduce(
    (sum, p) => sum + getAvailableSlots(p.id).length, 0
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Agenda</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="date"
              value={viewDate}
              onChange={e => setViewDate(e.target.value)}
              className="input"
            />
            <select
              value={selectedProfId}
              onChange={e => setSelectedProfId(e.target.value)}
              className="input"
            >
              <option value="all">Todos los profesionales</option>
              {salon?.professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAvailable(v => !v)}
              className={`btn-secondary flex items-center gap-2 ${
                showAvailable ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showAvailable ? 'bg-emerald-500' : 'bg-primary-300'}`} />
              {showAvailable ? 'Ocultar disponibles' : 'Ver disponibles'}
            </button>
          </div>
        </div>

        {/* Resumen del día */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="stat-card">
            <Icon name="calendar" className="w-5 h-5 text-primary-500 mb-1" />
            <p className="stat-value">{dayBookings.filter(b => b.status !== 'cancelled').length}</p>
            <p className="stat-label">Turnos totales</p>
          </div>
          <div className="stat-card">
            <Icon name="check-circle" className="w-5 h-5 text-emerald-500 mb-1" />
            <p className="stat-value">{dayBookings.filter(b => b.status === 'confirmed').length}</p>
            <p className="stat-label">Confirmados</p>
          </div>
          <div className="stat-card">
            <Icon name="clock" className="w-5 h-5 text-amber-500 mb-1" />
            <p className="stat-value">{dayBookings.filter(b => b.status === 'pending').length}</p>
            <p className="stat-label">Pendientes</p>
          </div>
          <div className="stat-card">
            <Icon name="sparkles" className="w-5 h-5 text-primary-400 mb-1" />
            <p className="stat-value">{totalAvailableSlots}</p>
            <p className="stat-label">Slots disponibles</p>
          </div>
        </div>

        {/* Alertas de cancelaciones */}
        <CancelRequestsPanel salon={salon} bookings={salonBookings} onResolve={handleResolveCancelRequest} />

        {/* Señas pendientes de confirmar */}
        {(() => {
          const pendingDeposits = salonBookings.filter(
            b => b.deposit?.paid && !b.deposit?.confirmedByAdmin && b.status !== 'cancelled'
          );
          if (pendingDeposits.length === 0) return null;
          return (
            <div className="border-l-4 border-amber-400 bg-white rounded-xl shadow-card px-5 py-4 space-y-3">
              <h3 className="font-bold text-secondary flex items-center gap-2 text-sm">
                <Icon name="alert" className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Señas pendientes de confirmar ({pendingDeposits.length})
              </h3>
              <ul className="space-y-2">
                {pendingDeposits.map(b => {
                  const svc = getService(b.serviceId);
                  return (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-semibold text-secondary text-sm">{b.clientName}</p>
                        <p className="text-xs text-primary-400">{svc?.name} — {b.date} {b.time}hs · Seña ${b.deposit.amount.toLocaleString('es-AR')}</p>
                      </div>
                      <button
                        onClick={() => handleConfirmDeposit(b.id)}
                        className="btn-secondary text-xs flex items-center gap-1.5"
                      >
                        <Icon name="check" className="w-3.5 h-3.5" />
                        Confirmar recepción
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3 text-xs items-center">
          <span className="section-label">Referencias</span>
          {[
            { cls: 'badge badge-success', label: 'Confirmado' },
            { cls: 'badge badge-warning', label: 'Pendiente' },
            { cls: 'badge badge-neutral', label: 'Completado' },
            { cls: 'badge badge-danger', label: 'Cancelación solicitada' },
            { cls: 'badge', label: 'Cancelado' },
            ...(showAvailable ? [{ cls: 'badge badge-accent', label: 'Disponible (30 min)' }] : []),
          ].map(item => (
            <span key={item.label} className={item.cls}>{item.label}</span>
          ))}
        </div>

        {/* Timeline multi-columna */}
        <div className="card overflow-x-auto">
          <div
            className="grid"
            style={{ gridTemplateColumns: `64px repeat(${displayedProfs.length}, minmax(160px, 1fr))` }}
          >
            {/* Header: hora vacía + nombre de cada profesional */}
            <div className="border-r border-primary-100 border-b h-14" />
            {displayedProfs.map(prof => (
              <div
                key={prof.id}
                className="border-r border-b border-primary-100 h-14 flex items-center gap-2.5 px-3 last:border-r-0 bg-primary-50/40"
              >
                <img src={prof.avatar} alt={prof.name} className="w-8 h-8 rounded-full flex-shrink-0 object-cover border border-primary-200" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-secondary truncate">{prof.name}</p>
                  <p className="text-xs text-primary-400 truncate">{prof.role}</p>
                </div>
              </div>
            ))}

            {/* Columna de horas */}
            <div className="border-r border-primary-100">
              {HOURS.map(h => (
                <div key={h} className="h-16 border-b border-primary-50 flex items-center justify-center last:border-b-0">
                  <span className="text-xs text-primary-400 font-medium">{h}</span>
                </div>
              ))}
            </div>

            {/* Columna por profesional */}
            {displayedProfs.map(prof => {
              const profBookings = getProfBookings(prof.id);
              const availableSlots = showAvailable ? getAvailableSlots(prof.id) : [];

              return (
                <div key={prof.id} className="relative border-r border-primary-100 last:border-r-0">
                  {/* Filas de hora (fondo) */}
                  {HOURS.map(h => (
                    <div key={h} className="h-16 border-b border-primary-50 last:border-b-0" />
                  ))}

                  {/* Slots disponibles */}
                  {availableSlots.map(({ hour, min }) => {
                    const topPx = ((hour - START_HOUR) * 60 + min) * (SLOT_HEIGHT / 60);
                    const slotH = 30 * (SLOT_HEIGHT / 60);
                    return (
                      <div
                        key={`${hour}-${min}`}
                        className="absolute left-1 right-1 rounded border border-emerald-200 bg-emerald-50 flex items-center justify-center"
                        style={{ top: `${topPx}px`, height: `${slotH}px` }}
                      >
                        <span className="text-emerald-600 text-xs font-medium">
                          {String(hour).padStart(2, '0')}:{String(min).padStart(2, '0')} libre
                        </span>
                      </div>
                    );
                  })}

                  {/* Turnos */}
                  {profBookings.filter(b => b.time && b.time.includes(':')).map(booking => {
                    const svc = getService(booking.serviceId);
                    const duration = svc?.duration || 60;
                    const [bh, bm] = booking.time.split(':').map(Number);
                    const topPx = ((bh - START_HOUR) * 60 + bm) * (SLOT_HEIGHT / 60);
                    const heightPx = (duration / 60) * SLOT_HEIGHT;
                    const statusKey = booking.cancelRequest && booking.status !== 'cancelled'
                      ? 'cancel_requested'
                      : booking.status;
                    const statusColor = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;
                    const endTime = addMinutes(booking.time, duration);

                    return (
                      <div
                        key={booking.id}
                        className={`absolute left-1 right-1 rounded-lg border px-2 py-1.5 text-xs overflow-hidden ${statusColor}`}
                        style={{ top: `${topPx}px`, height: `${Math.max(heightPx, 36)}px`, zIndex: 10 }}
                      >
                        <p className="font-bold truncate">{booking.time}–{endTime}</p>
                        <p className="truncate font-semibold">{booking.clientName}</p>
                        <p className="truncate opacity-80">{svc?.name}</p>
                        <p className="truncate opacity-60">{duration} min</p>
                        {booking.deposit?.paid && !booking.deposit?.confirmedByAdmin && (
                          <p className="font-semibold flex items-center gap-1 text-amber-700">
                            <Icon name="alert" className="w-3 h-3" />
                            Seña
                          </p>
                        )}
                        {booking.cancelRequest && (
                          <p className="font-semibold flex items-center gap-1">
                            <Icon name="x-circle" className="w-3 h-3" />
                            Cancelación
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {displayedProfs.length === 0 && (
          <div className="text-center py-10 text-primary-400 bg-white rounded-2xl border border-primary-100">
            Sin profesionales para mostrar
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AgendaView;
