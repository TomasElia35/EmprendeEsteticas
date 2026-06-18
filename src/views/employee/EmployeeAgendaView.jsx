import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import { applyDiscount } from '../../data/mockCommissions';
import EmployeeLayout from './EmployeeLayout';
import PaymentModal from '../../components/PaymentModal';
import CancelRequestsPanel from '../../components/CancelRequestsPanel';
import { toast } from '../../components/ui/Toast';

const STATUS_LABELS = {
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Cobrado', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
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
    // Separar los que vienen de mock vs los nuevos
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

  // Confirmar seña recibida
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

  // Resolver solicitud de cancelación
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
    const discount = newBooking.discountValue
      ? { type: newBooking.discountType, value: parseFloat(newBooking.discountValue) }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary">Agenda</h1>
            <p className="text-primary-500 text-sm mt-1">{salon?.name}</p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-primary-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <button
              id="employee-agenda-new-btn"
              onClick={() => setShowNewForm(true)}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-sm"
            >
              + Nuevo turno
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
            <div className="bg-white rounded-2xl border-2 border-yellow-200 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-secondary flex items-center gap-2 text-sm">
                <span className="text-lg">⚠️</span> Señas pendientes ({pendingDeposits.length})
              </h3>
              <ul className="space-y-2">
                {pendingDeposits.map(b => {
                  const svc = salon?.services.find(s => s.id === b.serviceId);
                  return (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 bg-yellow-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-semibold text-secondary text-sm">{b.clientName}</p>
                        <p className="text-xs text-primary-400">{svc?.name} — {b.date} {b.time}hs · Seña ${b.deposit.amount.toLocaleString('es-AR')}</p>
                      </div>
                      <button
                        id={`confirm-deposit-emp-${b.id}`}
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

        {/* Nuevo turno form */}
        {showNewForm && (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
            <h3 className="font-bold text-secondary mb-4">Nuevo Turno</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Cliente *</label>
                <input type="text" value={newBooking.clientName}
                  onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Nombre completo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Teléfono</label>
                <input type="tel" value={newBooking.clientPhone}
                  onChange={(e) => setNewBooking({ ...newBooking, clientPhone: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Ej: 11 2345 6789" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Servicio *</label>
                <select value={newBooking.serviceId}
                  onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Seleccionar...</option>
                  {salon?.services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — ${s.price.toLocaleString('es-AR')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Profesional</label>
                <select value={newBooking.professionalId}
                  onChange={(e) => setNewBooking({ ...newBooking, professionalId: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Sin asignar</option>
                  {salon?.professionals.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Horario *</label>
                <input type="time" value={newBooking.time}
                  onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Descuento (opcional)</label>
                <div className="flex gap-2">
                  <select value={newBooking.discountType}
                    onChange={(e) => setNewBooking({ ...newBooking, discountType: e.target.value })}
                    className="border border-primary-200 rounded-lg px-2 py-2 text-sm outline-none">
                    <option value="percent">%</option>
                    <option value="fixed">$</option>
                  </select>
                  <input type="number" min="0" value={newBooking.discountValue}
                    onChange={(e) => setNewBooking({ ...newBooking, discountValue: e.target.value })}
                    placeholder="0"
                    className="flex-1 border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-primary-600 mb-1">Notas</label>
                <input type="text" value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Observaciones..." />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowNewForm(false)} className="btn-secondary text-sm">Cancelar</button>
              <button id="employee-save-booking-btn" onClick={handleAddBooking} className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-sm">
                Guardar turno
              </button>
            </div>
          </div>
        )}

        {/* Bookings del día */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-primary-50 bg-gray-50/50">
            <h2 className="font-bold text-secondary">
              {selectedDate === today ? 'Turnos de hoy' : `Turnos del ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR')}`}
              <span className="ml-2 text-sm font-normal text-primary-400">({dayBookings.length} turno{dayBookings.length !== 1 ? 's' : ''})</span>
            </h2>
          </div>

          {dayBookings.length === 0 ? (
            <p className="text-center text-primary-400 py-12 text-sm">No hay turnos para esta fecha.</p>
          ) : (
            <ul className="divide-y divide-primary-50">
              {dayBookings.map((b) => {
                const service = salon?.services.find((s) => s.id === b.serviceId);
                const professional = salon?.professionals.find((p) => p.id === b.professionalId);
                const statusInfo = STATUS_LABELS[b.status] || STATUS_LABELS.pending;
                const price = b.payment?.amount ?? service?.price;
                const hasDiscount = b.discount && b.discount.value;

                return (
                  <li key={b.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-14 flex-shrink-0">
                        <p className="font-bold text-secondary">{b.time}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-secondary">{b.clientName}</p>
                        <p className="text-xs text-primary-400 mt-0.5">
                          {service?.name}
                          {service?.duration ? ` · ${service.duration} min` : ''}
                          {professional ? ` · ${professional.name}` : ''}
                          {hasDiscount && (
                            <span className="ml-2 text-red-500">
                              {b.discount.type === 'percent' ? `-${b.discount.value}%` : `-$${b.discount.value.toLocaleString('es-AR')}`}
                            </span>
                          )}
                        </p>
                        {b.notes && <p className="text-xs text-primary-300 mt-0.5 italic">{b.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-secondary text-sm">
                        ${price?.toLocaleString('es-AR')}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {(b.status === 'confirmed' || b.status === 'pending') && (
                        <button
                          onClick={() => setPayingBooking(b)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
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
