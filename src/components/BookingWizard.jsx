import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { initialBookings } from '../data/mockData';

const BookingWizard = ({ salon, onComplete, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingData, setBookingData] = useState({
    serviceId: null,
    professionalId: null,
    time: null,
    clientName: user?.name || '',
    clientPhone: user?.phone || '',
    clientEmail: user?.email || '',
    addRecommendedProduct: false,
  });

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
      notes: bookingData.addRecommendedProduct
        ? `Interesado en producto recomendado`
        : '',
      payment: null,
    });
  };

  const isStepValid = () => {
    if (step === 1) return !!bookingData.serviceId;
    if (step === 2) return !!bookingData.professionalId;
    if (step === 3) return !!bookingData.time;
    if (step === 4) return bookingData.clientName.trim().length > 0;
    return false;
  };

  const STEP_LABELS = ['Servicio', 'Profesional', 'Horario', 'Confirmar'];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden">
      {/* Wizard Header */}
      <div className="bg-primary-50 p-6 border-b border-primary-200">
        <h3 className="text-xl font-bold text-secondary mb-4">Nueva Reserva</h3>
        <div className="flex justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-primary-200 -z-10" />
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                step > num
                  ? 'bg-green-500 border-green-500 text-white'
                  : step === num
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-primary-300 text-primary-400'
              }`}>
                {step > num ? '✓' : num}
              </div>
              <span className="text-xs text-primary-500 hidden sm:block">{STEP_LABELS[num - 1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Body */}
      <div className="p-6 md:p-8 min-h-[300px]">
        {/* Step 1: Service */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h4 className="text-lg font-semibold text-secondary mb-4">Seleccioná un Servicio</h4>
            <div className="space-y-3">
              {salon.services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setBookingData({ ...bookingData, serviceId: srv.id })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    bookingData.serviceId === srv.id ? 'border-primary-600 bg-primary-50' : 'border-primary-100 hover:border-primary-300'
                  } flex justify-between items-center`}
                >
                  <div>
                    <h5 className="font-semibold text-secondary">{srv.name}</h5>
                    <p className="text-sm text-primary-600">{srv.duration} min</p>
                  </div>
                  <div className="font-bold text-primary-800">${srv.price.toLocaleString('es-AR')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Professional */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h4 className="text-lg font-semibold text-secondary mb-4">Seleccioná un Profesional</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {salon.professionals.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => setBookingData({ ...bookingData, professionalId: prof.id })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-4 ${
                    bookingData.professionalId === prof.id ? 'border-primary-600 bg-primary-50' : 'border-primary-100 hover:border-primary-300'
                  }`}
                >
                  <img src={prof.avatar} alt={prof.name} className="w-12 h-12 rounded-full shadow-sm" />
                  <div>
                    <h5 className="font-semibold text-secondary">{prof.name}</h5>
                    <p className="text-xs text-primary-600 uppercase tracking-wider">{prof.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h4 className="text-lg font-semibold text-secondary mb-2">Seleccioná Fecha y Horario</h4>

            {/* Date picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 mb-1">Fecha</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setBookingData({ ...bookingData, time: null }); // reset time on date change
                }}
                className="border border-primary-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
              />
            </div>

            <p className="text-sm text-primary-600 mb-3">
              Disponibilidad de <strong>{salon.professionals.find(p => p.id === bookingData.professionalId)?.name}</strong>
              {occupiedSlots.size > 0 && (
                <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
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
                    className={`relative py-3 px-2 rounded-lg border-2 text-center font-medium transition-all
                      ${ isOccupied
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'border-primary-600 bg-primary-600 text-white cursor-pointer'
                          : 'border-primary-200 hover:border-primary-400 text-secondary cursor-pointer'
                      }`
                    }
                  >
                    {time}
                    {isOccupied && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs text-primary-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-2 border-primary-600 bg-primary-600 inline-block" /> Seleccionado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-2 border-gray-100 bg-gray-50 inline-block" /> Ocupado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-2 border-primary-200 inline-block" /> Disponible
              </span>
            </div>
          </div>
        )}

        {/* Step 4: Confirm + product recommendation */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h4 className="text-lg font-semibold text-secondary mb-2">Tus Datos y Resumen</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={bookingData.clientName}
                  onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                  className="w-full border border-primary-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ej. Ana Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={bookingData.clientPhone}
                  onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                  className="w-full border border-primary-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ej. 11 2345 6789"
                />
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
              <h5 className="font-bold text-secondary mb-3 border-b border-primary-200 pb-2">Resumen de Reserva</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-primary-600">Servicio:</span> <span className="font-medium text-secondary">{selectedService?.name}</span></div>
                <div className="flex justify-between"><span className="text-primary-600">Profesional:</span> <span className="font-medium text-secondary">{selectedProfessional?.name}</span></div>
                <div className="flex justify-between"><span className="text-primary-600">Fecha/Hora:</span> <span className="font-medium text-secondary">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}, {bookingData.time}</span></div>
                <div className="flex justify-between pt-2 border-t border-primary-200 mt-2">
                  <span className="font-bold text-secondary">Total:</span>
                  <span className="font-bold text-primary-800">${selectedService?.price.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            {/* Recommended products */}
            {recommendedProducts.length > 0 && (
              <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">✨</span>
                  <h5 className="font-bold text-secondary text-sm">Recomendado para tu servicio</h5>
                </div>
                <p className="text-xs text-amber-700 mb-3">
                  Clientes que reservaron <strong>{selectedService?.name}</strong> también llevaron:
                </p>
                <div className="space-y-2">
                  {recommendedProducts.map((prod) => (
                    <div key={prod.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                      <div>
                        <p className="font-semibold text-secondary text-sm">{prod.name}</p>
                        <p className="text-xs text-primary-400">{prod.category}</p>
                      </div>
                      <span className="font-bold text-primary-700 text-sm">${prod.salePrice.toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="add-recommended-product"
                    checked={bookingData.addRecommendedProduct}
                    onChange={(e) => setBookingData({ ...bookingData, addRecommendedProduct: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary-600"
                  />
                  <span className="text-xs text-secondary font-medium">Quiero consultar sobre estos productos al llegar</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wizard Footer */}
      <div className="p-6 border-t border-primary-200 flex justify-between bg-white">
        {step === 1 ? (
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
        ) : (
          <button onClick={handlePrev} className="btn-secondary">Atrás</button>
        )}

        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`btn-primary ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Siguiente
          </button>
        ) : (
          <button
            id="confirm-booking-btn"
            onClick={handleConfirm}
            disabled={!isStepValid()}
            className={`btn-primary bg-secondary hover:bg-secondary/90 ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Confirmar Reserva
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
