import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { initialBookings } from '../data/mockData';
import Icon from './ui/Icon';
import ServiceMatch from './ServiceMatch';

const BookingWizard = ({ salon, onComplete, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositDeclared, setDepositDeclared] = useState(false); // cliente declara que va a transferir
  const [showServiceMatch, setShowServiceMatch] = useState(false); // UI: panel del recomendador
  const [bookingData, setBookingData] = useState({
    serviceId: null,
    professionalId: null,
    time: null,
    clientName: user?.name || '',
    clientPhone: user?.phone || '',
    clientEmail: user?.email || '',
    notes: '',
    addRecommendedProduct: false,
  });

  const depositConfig = salon.depositConfig;

  // Turnos ya existentes (mock + localStorage)
  const allBookings = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
      return [...initialBookings, ...stored];
    } catch { return initialBookings; }
  })();

  // Slots ocupados del profesional seleccionado en la fecha seleccionada
  const occupiedSlots = new Set(
    allBookings
      .filter(
        (b) =>
          b.salonId === salon.id &&
          b.professionalId === bookingData.professionalId &&
          b.date === selectedDate &&
          b.status !== 'cancelled'
      )
      .map((b) => b.time)
  );

  const selectedService = salon.services.find((s) => s.id === bookingData.serviceId);
  const selectedProfessional = salon.professionals.find((p) => p.id === bookingData.professionalId);

  // Productos recomendados para el servicio seleccionado
  const recommendedProducts = selectedService?.recommendedProductIds
    ?.map((pid) => salon.products.find((p) => p.id === pid))
    .filter(Boolean) || [];

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleConfirm = () => {
    const hasDeposit = depositConfig?.required && depositDeclared;
    onComplete({
      id: `b-${Date.now()}`,
      salonId: salon.id,
      serviceId: bookingData.serviceId,
      professionalId: bookingData.professionalId,
      date: selectedDate,
      time: bookingData.time,
      clientName: bookingData.clientName || user?.name || 'Cliente',
      clientPhone: bookingData.clientPhone || user?.phone || '',
      clientEmail: bookingData.clientEmail || user?.email || '',
      clientId: user?.id || null,
      status: 'confirmed',
      discount: null,
      notes: [
        bookingData.notes || '',
        bookingData.addRecommendedProduct ? 'Interesado en producto recomendado' : '',
      ].filter(Boolean).join(' | '),
      payment: null,
      deposit: hasDeposit
        ? { amount: depositConfig.amount, paid: true, confirmedByAdmin: false, refunded: null }
        : null,
      cancelRequest: null,
    });
  };

  const isStepValid = () => {
    if (step === 1) return !!bookingData.serviceId;
    if (step === 2) return !!bookingData.professionalId;
    if (step === 3) return !!bookingData.time;
    if (step === 4) {
      if (bookingData.clientName.trim().length === 0) return false;
      // Si hay seña requerida, el cliente debe declararla
      if (depositConfig?.required && !depositDeclared) return false;
      return true;
    }
    return false;
  };

  const STEP_LABELS = ['Servicio', 'Profesional', 'Horario', 'Confirmar'];

  return (
    <div className="bg-white rounded-2xl shadow-modal border border-primary-200 overflow-hidden">
      {/* Wizard Header */}
      <div className="glass px-6 pt-6 pb-5 border-b border-primary-200">
        <h3 className="page-title text-2xl text-secondary mb-5">Nueva Reserva</h3>
        <div className="flex justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-primary-200 -z-10" />
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  step > num
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : step === num
                    ? 'bg-gold-500 border-gold-500 text-secondary'
                    : 'bg-white border-primary-200 text-primary-400'
                }`}
              >
                {step > num ? (
                  <Icon name="check" className="w-4 h-4" />
                ) : (
                  num
                )}
              </div>
              <span
                className={`text-xs tracking-wide hidden sm:block ${
                  step === num ? 'text-gold-600 font-semibold' : 'text-primary-500'
                }`}
              >
                {STEP_LABELS[num - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Body */}
      <div className="p-6 md:p-8 min-h-[300px]">
        {/* Step 1: Service */}
        {step === 1 && (
          <div className="animate-fade-in">
            {/* CTA ServiceMatch */}
            {!showServiceMatch ? (
              <button
                id="open-service-match"
                onClick={() => setShowServiceMatch(true)}
                className="w-full mb-6 glass lift rounded-2xl border-2 border-gold-400 p-5 flex items-center gap-4 text-left transition-all"
              >
                <span className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 flex-shrink-0">
                  <Icon name="sparkles" className="w-6 h-6" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-gold">Nuevo</span>
                    <h4 className="font-serif font-bold text-secondary">Encontrá tu servicio ideal</h4>
                  </div>
                  <p className="text-sm text-primary-500 mt-0.5">
                    Subí una foto y te recomendamos el servicio perfecto para vos.
                  </p>
                </div>
                <Icon name="chevron-right" className="w-5 h-5 text-gold-600 flex-shrink-0" />
              </button>
            ) : (
              <div className="mb-6">
                <ServiceMatch
                  services={salon.services}
                  onSelectService={(id) => {
                    setBookingData({ ...bookingData, serviceId: id });
                    setShowServiceMatch(false);
                  }}
                  onSkip={() => setShowServiceMatch(false)}
                />
              </div>
            )}

            <h4 className="page-title text-lg text-secondary mb-4">Seleccioná un Servicio</h4>
            <div className="space-y-3">
              {salon.services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setBookingData({ ...bookingData, serviceId: srv.id })}
                  className={`lift p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                    bookingData.serviceId === srv.id
                      ? 'border-gold-500 bg-gold-50'
                      : 'border-primary-200 hover:border-gold-400'
                  }`}
                >
                  <div>
                    <h5 className="font-semibold text-secondary">{srv.name}</h5>
                    <p className="text-sm text-primary-500 flex items-center gap-1 mt-0.5">
                      <Icon name="clock" className="w-3.5 h-3.5" />
                      {srv.duration} min
                    </p>
                  </div>
                  <div className="font-bold text-gold">${srv.price.toLocaleString('es-AR')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Professional */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h4 className="page-title text-lg text-secondary mb-4">Seleccioná un Profesional</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {salon.professionals.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => setBookingData({ ...bookingData, professionalId: prof.id })}
                  className={`lift p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                    bookingData.professionalId === prof.id
                      ? 'border-gold-500 bg-gold-50'
                      : 'border-primary-200 hover:border-gold-400'
                  }`}
                >
                  <img src={prof.avatar} alt={prof.name} className="w-12 h-12 rounded-full shadow-sm" />
                  <div>
                    <h5 className="font-semibold text-secondary">{prof.name}</h5>
                    <p className="text-xs text-primary-500 uppercase tracking-wider">{prof.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h4 className="page-title text-lg text-secondary mb-2">Seleccioná Fecha y Horario</h4>

            {/* Date picker */}
            <div className="mb-4">
              <label className="label">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setBookingData({ ...bookingData, time: null }); // reset time on date change
                }}
                className="input w-auto"
              />
            </div>

            <p className="text-sm text-primary-600 mb-3">
              Disponibilidad de{' '}
              <strong>{salon.professionals.find((p) => p.id === bookingData.professionalId)?.name}</strong>
              {occupiedSlots.size > 0 && (
                <span className="ml-2 badge badge-warning">
                  {occupiedSlots.size} horario{occupiedSlots.size !== 1 ? 's' : ''} ocupado{occupiedSlots.size !== 1 ? 's' : ''}
                </span>
              )}
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {salon.availableSlots.map((time) => {
                const isOccupied = occupiedSlots.has(time);
                const isSelected = bookingData.time === time;
                return (
                  <div
                    key={time}
                    onClick={() => !isOccupied && setBookingData({ ...bookingData, time })}
                    title={isOccupied ? 'Este horario ya está reservado' : ''}
                    className={`relative py-3 px-2 rounded-xl border-2 text-center font-medium text-sm transition-all ${
                      isOccupied
                        ? 'border-primary-100 bg-primary-50 text-primary-300 cursor-not-allowed'
                        : isSelected
                        ? 'border-gold-500 bg-gold-500 text-secondary cursor-pointer'
                        : 'border-primary-200 hover:border-gold-400 text-secondary cursor-pointer'
                    }`}
                  >
                    {time}
                    {isOccupied && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-300 rounded-full flex items-center justify-center">
                        <Icon name="x" className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-primary-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-2 border-gold-500 bg-gold-500 inline-block" />
                Seleccionado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-2 border-primary-100 bg-primary-50 inline-block" />
                Ocupado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-2 border-primary-200 inline-block" />
                Disponible
              </span>
            </div>
          </div>
        )}

        {/* Step 4: Confirm + product recommendation */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h4 className="page-title text-lg text-secondary mb-2">Tus Datos y Resumen</h4>

            <div className="space-y-4">
              <div>
                <label className="label">Nombre Completo</label>
                <input
                  type="text"
                  value={bookingData.clientName}
                  onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                  className="input w-full"
                  placeholder="Ej. Ana Pérez"
                />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  value={bookingData.clientPhone}
                  onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                  className="input w-full"
                  placeholder="Ej. 11 2345 6789"
                />
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-primary-50 rounded-xl border border-primary-200 p-4">
              <h5 className="font-serif font-bold text-secondary mb-3 border-b border-primary-200 pb-2">Resumen de Reserva</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-500">Servicio:</span>
                  <span className="font-medium text-secondary">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500">Profesional:</span>
                  <span className="font-medium text-secondary">{selectedProfessional?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500">Fecha / Hora:</span>
                  <span className="font-medium text-secondary">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                    })}
                    , {bookingData.time}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary-200 mt-2">
                  <span className="font-bold text-secondary">Total:</span>
                  <span className="font-bold text-gold">${selectedService?.price.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* Recommended products */}
            {recommendedProducts.length > 0 && (
              <div className="bg-primary-50 rounded-xl border border-primary-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="tag" className="w-4 h-4 text-primary-500" />
                  <h5 className="font-serif font-bold text-secondary text-sm">Recomendado para tu servicio</h5>
                </div>
                <p className="text-xs text-primary-500 mb-3">
                  Clientes que reservaron <strong>{selectedService?.name}</strong> también llevaron:
                </p>
                <div className="space-y-2">
                  {recommendedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3 border border-primary-100"
                    >
                      <div>
                        <p className="font-semibold text-secondary text-sm">{prod.name}</p>
                        <p className="text-xs text-primary-400">{prod.category}</p>
                      </div>
                      <span className="font-bold text-gold text-sm">${prod.salePrice.toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="add-recommended-product"
                    checked={bookingData.addRecommendedProduct}
                    onChange={(e) => setBookingData({ ...bookingData, addRecommendedProduct: e.target.checked })}
                    className="w-4 h-4 rounded accent-gold-500"
                  />
                  <span className="text-xs text-secondary font-medium">
                    Quiero consultar sobre estos productos al llegar
                  </span>
                </label>
              </div>
            )}

            {/* Seña */}
            {depositConfig?.required && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="lock" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-secondary text-sm">Seña requerida para confirmar</h5>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Este local requiere una seña de{' '}
                      <strong>${depositConfig.amount.toLocaleString('es-AR')}</strong> para reservar.
                    </p>
                  </div>
                </div>

                {depositConfig.alias && (
                  <div className="bg-white rounded-lg p-3 border border-amber-200 text-xs space-y-1">
                    <p className="font-semibold text-secondary">Datos de transferencia:</p>
                    <p className="text-primary-600">
                      Alias: <strong>{depositConfig.alias}</strong>
                    </p>
                    <p className="text-amber-700 font-medium">
                      Monto: ${depositConfig.amount.toLocaleString('es-AR')}
                    </p>
                  </div>
                )}

                {depositConfig.policy && (
                  <p className="text-xs text-amber-600 italic">{depositConfig.policy}</p>
                )}

                <label
                  id="deposit-declared-label"
                  className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                    depositDeclared ? 'border-emerald-400 bg-emerald-50' : 'border-amber-200 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    id="deposit-declared-checkbox"
                    checked={depositDeclared}
                    onChange={(e) => setDepositDeclared(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded accent-emerald-600 flex-shrink-0"
                  />
                  <span className="text-xs text-secondary font-medium leading-relaxed">
                    Declaro que realizaré la transferencia de la seña antes del turno.
                    Entiendo que el local confirmará la recepción.
                  </span>
                </label>

                {!depositDeclared && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">
                    <Icon name="alert" className="w-3.5 h-3.5" />
                    Debés confirmar la seña para poder reservar.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wizard Footer */}
      <div className="px-6 py-4 border-t border-primary-200 flex justify-between bg-white">
        {step === 1 ? (
          <button onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        ) : (
          <button onClick={handlePrev} className="btn-secondary">
            <Icon name="chevron-left" className="w-4 h-4 mr-1 inline-block" />
            Atrás
          </button>
        )}

        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`btn-primary ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Siguiente
            <Icon name="chevron-right" className="w-4 h-4 ml-1 inline-block" />
          </button>
        ) : (
          <button
            id="confirm-booking-btn"
            onClick={handleConfirm}
            disabled={!isStepValid()}
            className={`btn-gold ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Icon name="check-circle" className="w-4 h-4 mr-1.5 inline-block" />
            Confirmar Reserva
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
