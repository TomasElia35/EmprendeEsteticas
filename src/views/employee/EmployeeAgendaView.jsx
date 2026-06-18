import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import { applyDiscount } from '../../data/mockCommissions';
import EmployeeLayout from './EmployeeLayout';
import PaymentModal from '../../components/PaymentModal';
import CancelRequestsPanel from '../../components/CancelRequestsPanel';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

const STATUS_LABELS = {
  confirmed: { label: 'Confirmado', badgeClass: 'badge badge-success' },
  pending:   { label: 'Pendiente',  badgeClass: 'badge badge-warning' },
  completed: { label: 'Cobrado',    badgeClass: 'badge badge-neutral' },
  cancelled: { label: 'Cancelado',  badgeClass: 'badge badge-danger'  },
};

const EmployeeAgendaView = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookings, setBookings] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    return [...initialBookings, ...stored];
  });
  const [payingBooking, setPayingBooking] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    clientName: '', clientPhone: '', serviceId: '', professionalId: '',
    time: '', notes: '', discountType: 'percent', discountValue: '',
  });

  const salon = initialSalons.find((s) => s.id === user?.businessId);
  const dayBookings = bookings
    .filter((b) => b.salonId === user?.businessId && b.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const persistBookings = (updated) => {
    const newOnes = updated.filter((b) => !initialBookings.find((ib) => ib.id === b.id));
    localStorage.setItem('estetica_bookings', JSON.stringify(newOnes));
  };

  const handlePaymentConfirm = (paymentData) => {
    const updated = bookings.map((b) =>
      b.id === payingBooking.id
        ? { ...b, status: 'completed', payment: paymentData, discount: paymentData.discount }
        : b
    );
    setBookings(updated);
    persistBookings(updated);
    setPayingBooking(null);
    toast.success('Pago registrado correctamente.');
  };

  const handleConfirmDeposit = (bookingId) => {
    const updated = bookings.map(b =>
      b.id === bookingId && b.deposit
        ? { ...b, deposit: { ...b.deposit, confirmedByAdmin: true } }
        : b
    );
    setBookings(updated);
    persistBookings(updated);
    toast.success('Seña confirmada.');
  };

  const handleResolveCancelRequest = (bookingId, action) => {
    const updated = bookings.map(b => {
      if (b.id !== bookingId) return b;
      if (action === 'reject') return { ...b, cancelRequest: null };
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
    if (action === 'reject') toast.info('Solicitud rechazada. El turno sigue activo.');
    else toast.success(action === 'cancel_refund' ? 'Turno cancelado. Seña a devolver.' : 'Turno cancelado. Seña retenida.');
  };

  const handleAddBooking = () => {
    if (!newBooking.clientName || !newBooking.serviceId || !newBooking.time) {
      toast.error('Completá nombre, servicio y horario.');
      return;
    }
    const service = salon.services.find((s) => s.id === parseInt(newBooking.serviceId));
    const discountNum = parseFloat(newBooking.discountValue);
    const discount = newBooking.discountValue !== '' && !isNaN(discountNum) && discountNum > 0
      ? { type: newBooking.discountType, value: discountNum }
      : null;

    const booking = {
      id: `b-emp-${Date.now()}`,
      salonId: user.businessId,
      serviceId: parseInt(newBooking.serviceId),
      professionalId: newBooking.professionalId ? parseInt(newBooking.professionalId) : null,
      date: selectedDate,
      time: newBooking.time,
      clientName: newBooking.clientName,
      clientPhone: newBooking.clientPhone,
      clientEmail: '',
      clientId: null,
      status: 'confirmed',
      discount,
      notes: newBooking.notes,
      payment: null,
      deposit: null,
      cancelRequest: null,
    };

    const updated = [...bookings, booking];
    setBookings(updated);
    persistBookings(updated);
    setShowNewForm(false);
    setNewBooking({ clientName: '', clientPhone: '', serviceId: '', professionalId: '', time: '', notes: '', discountType: 'percent', discountValue: '' });
    toast.success('Turno agendado.');
  };

  const payingService = payingBooking ? salon?.services.find((s) => s.id === payingBooking.serviceId) : null;
  const payingProfessional = payingBooking ? salon?.professionals.find((p) => p.id === payingBooking.professionalId) : null;

  return (
    <EmployeeLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Agenda</h1>
            <p className="text-primary-500 text-sm mt-1">{salon?.name}</p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input text-sm"
            />
            <button
              id="employee-agenda-new-btn"
              onClick={() => setShowNewForm(true)}
              className="btn-gold text-sm flex items-center gap-2"
            >
              <Icon name="plus" className="w-4 h-4" />
              Nuevo turno
            </button>
          </div>
        </div>

        {/* Panel de solicitudes de cancelación */}
        <CancelRequestsPanel
          salon={salon}
          bookings={bookings.filter(b => b.salonId === user?.businessId)}
          onResolve={handleResolveCancelRequest}
        />

        {/* Señas pendientes de confirmar */}
        {(() => {
          const pendingDeposits = bookings.filter(
            b => b.salonId === user?.businessId && b.deposit?.paid && !b.deposit?.confirmedByAdmin && b.status !== 'cancelled'
          );
          if (pendingDeposits.length === 0) return null;
          return (
            <div className="border-l-4 border-amber-400 bg-white rounded-xl shadow-card px-5 py-4 space-y-3">
              <h3 className="font-bold text-secondary flex items-center gap-2 text-sm">
                <Icon name="alert" className="w-4 h-4 text-amber-500" />
                Señas pendientes de confirmacion ({pendingDeposits.length})
              </h3>
              <ul className="space-y-2">
                {pendingDeposits.map(b => {
                  const svc = salon?.services.find(s => s.id === b.serviceId);
                  return (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 bg-primary-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-semibold text-secondary text-sm">{b.clientName}</p>
                        <p className="text-xs text-primary-400">
                          {svc?.name} — {b.date} {b.time}hs · Seña ${b.deposit.amount.toLocaleString('es-AR')}
                        </p>
                      </div>
                      <button
                        id={`confirm-deposit-emp-${b.id}`}
                        onClick={() => handleConfirmDeposit(b.id)}
                        className="btn-secondary text-xs flex items-center gap-1.5"
                      >
                        <Icon name="check" className="w-3.5 h-3.5" />
                        Confirmar recepcion
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

        {/* Nuevo turno form */}
        {showNewForm && (
          <div className="card p-6">
            <h3 className="font-bold text-secondary mb-5">Nuevo Turno</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Cliente *</label>
                <input
                  type="text"
                  value={newBooking.clientName}
                  onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
                  className="input"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="label">Telefono</label>
                <input
                  type="tel"
                  value={newBooking.clientPhone}
                  onChange={(e) => setNewBooking({ ...newBooking, clientPhone: e.target.value })}
                  className="input"
                  placeholder="Ej: 11 2345 6789"
                />
              </div>
              <div>
                <label className="label">Servicio *</label>
                <select
                  value={newBooking.serviceId}
                  onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                  className="input"
                >
                  <option value="">Seleccionar...</option>
                  {salon?.services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — ${s.price.toLocaleString('es-AR')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Profesional</label>
                <select
                  value={newBooking.professionalId}
                  onChange={(e) => setNewBooking({ ...newBooking, professionalId: e.target.value })}
                  className="input"
                >
                  <option value="">Sin asignar</option>
                  {salon?.professionals.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {!newBooking.professionalId && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <Icon name="alert" className="w-3.5 h-3.5 flex-shrink-0" />
                    Sin profesional asignado, la comision no se calculara.
                  </p>
                )}
              </div>
              <div>
                <label className="label">Horario *</label>
                <input
                  type="time"
                  value={newBooking.time}
                  onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Descuento (opcional)</label>
                <div className="flex gap-2">
                  <select
                    value={newBooking.discountType}
                    onChange={(e) => setNewBooking({ ...newBooking, discountType: e.target.value })}
                    className="input w-auto"
                  >
                    <option value="percent">%</option>
                    <option value="fixed">$</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={newBooking.discountValue}
                    onChange={(e) => setNewBooking({ ...newBooking, discountValue: e.target.value })}
                    placeholder="0"
                    className="input flex-1"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Notas</label>
                <input
                  type="text"
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  className="input"
                  placeholder="Observaciones..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowNewForm(false)} className="btn-secondary text-sm">
                Cancelar
              </button>
              <button
                id="employee-save-booking-btn"
                onClick={handleAddBooking}
                className="btn-gold text-sm"
              >
                Guardar turno
              </button>
            </div>
          </div>
        )}

        {/* Bookings del dia */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="font-bold text-secondary">
              {selectedDate === today
                ? 'Turnos de hoy'
                : `Turnos del ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR')}`}
              <span className="ml-2 text-sm font-normal text-primary-400">
                ({dayBookings.length} turno{dayBookings.length !== 1 ? 's' : ''})
              </span>
            </h2>
          </div>

          {dayBookings.length === 0 ? (
            <div className="card-body">
              <p className="text-center text-primary-400 py-8 text-sm">No hay turnos para esta fecha.</p>
            </div>
          ) : (
            <ul className="divide-y divide-primary-100">
              {dayBookings.map((b) => {
                const service = salon?.services.find((s) => s.id === b.serviceId);
                const professional = salon?.professionals.find((p) => p.id === b.professionalId);
                const statusInfo = STATUS_LABELS[b.status] || STATUS_LABELS.pending;
                const hasDiscount = b.discount && b.discount.value;
                const basePrice = service?.price ?? 0;
                const discountedPrice = hasDiscount
                  ? applyDiscount(basePrice, b.discount)
                  : basePrice;
                const price = b.payment?.amount ?? discountedPrice;

                return (
                  <li
                    key={b.id}
                    className="lift px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-primary-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center w-14 flex-shrink-0">
                        <p className="font-bold text-secondary">{b.time}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-secondary">{b.clientName}</p>
                        <p className="text-xs text-primary-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {service?.name}
                          {service?.duration && (
                            <span className="flex items-center gap-0.5">
                              <Icon name="clock" className="w-3 h-3" />
                              {service.duration} min
                            </span>
                          )}
                          {professional && (
                            <span>· {professional.name}</span>
                          )}
                          {hasDiscount && (
                            <span className="text-accent font-medium">
                              {b.discount.type === 'percent'
                                ? `-${b.discount.value}%`
                                : `-$${b.discount.value.toLocaleString('es-AR')}`}
                            </span>
                          )}
                        </p>
                        {b.notes && (
                          <p className="text-xs text-primary-300 mt-0.5 italic">{b.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gold text-sm">
                        ${price?.toLocaleString('es-AR')}
                      </span>
                      <span className={statusInfo.badgeClass}>
                        {statusInfo.label}
                      </span>
                      {(b.status === 'confirmed' || b.status === 'pending') && (
                        <button
                          onClick={() => setPayingBooking(b)}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Cobrar
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Payment modal */}
      {payingBooking && (
        <PaymentModal
          booking={payingBooking}
          service={payingService}
          professional={payingProfessional}
          onConfirm={handlePaymentConfirm}
          onClose={() => setPayingBooking(null)}
        />
      )}
    </EmployeeLayout>
  );
};

export default EmployeeAgendaView;
