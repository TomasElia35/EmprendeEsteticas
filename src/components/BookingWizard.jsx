import React, { useState } from 'react';

const BookingWizard = ({ salon, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceId: null,
    professionalId: null,
    time: null,
    clientName: '',
    clientPhone: ''
  });

  const selectedService = salon.services.find(s => s.id === bookingData.serviceId);
  const selectedProfessional = salon.professionals.find(p => p.id === bookingData.professionalId);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleConfirm = () => {
    onComplete({
      id: `b-${Date.now()}`,
      salonId: salon.id,
      serviceId: bookingData.serviceId,
      professionalId: bookingData.professionalId,
      date: new Date().toISOString().split('T')[0],
      time: bookingData.time,
      clientName: bookingData.clientName || 'Cliente Invitado',
      clientPhone: bookingData.clientPhone || 'No registrado',
      status: 'confirmed'
    });
  };

  const isStepValid = () => {
    if (step === 1) return !!bookingData.serviceId;
    if (step === 2) return !!bookingData.professionalId;
    if (step === 3) return !!bookingData.time;
    if (step === 4) return bookingData.clientName.trim().length > 0;
    return false;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden">
      {/* Wizard Header */}
      <div className="bg-primary-50 p-6 border-b border-primary-200">
        <h3 className="text-xl font-bold text-secondary mb-4">Nueva Reserva</h3>
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary-200 -z-10"></div>
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
              step >= num ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-primary-300 text-primary-400'
            }`}>
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Body */}
      <div className="p-6 md:p-8 min-h-[300px]">
        {step === 1 && (
          <div className="animate-fade-in">
            <h4 className="text-lg font-semibold text-secondary mb-4">Selecciona un Servicio</h4>
            <div className="space-y-3">
              {salon.services.map(srv => (
                <div 
                  key={srv.id}
                  onClick={() => setBookingData({...bookingData, serviceId: srv.id})}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    bookingData.serviceId === srv.id ? 'border-primary-600 bg-primary-50' : 'border-primary-100 hover:border-primary-300'
                  } flex justify-between items-center`}
                >
                  <div>
                    <h5 className="font-semibold text-secondary">{srv.name}</h5>
                    <p className="text-sm text-primary-600">{srv.duration} min</p>
                  </div>
                  <div className="font-bold text-primary-800">${srv.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h4 className="text-lg font-semibold text-secondary mb-4">Selecciona un Profesional</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {salon.professionals.map(prof => (
                <div 
                  key={prof.id}
                  onClick={() => setBookingData({...bookingData, professionalId: prof.id})}
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

        {step === 3 && (
          <div className="animate-fade-in">
            <h4 className="text-lg font-semibold text-secondary mb-4">Selecciona un Horario</h4>
            <p className="text-sm text-primary-600 mb-4">Disponibilidad para hoy</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {salon.availableSlots.map(time => (
                <div 
                  key={time}
                  onClick={() => setBookingData({...bookingData, time})}
                  className={`py-3 px-2 rounded-lg border-2 text-center cursor-pointer font-medium transition-all ${
                    bookingData.time === time ? 'border-primary-600 bg-primary-600 text-white' : 'border-primary-200 hover:border-primary-400 text-secondary'
                  }`}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h4 className="text-lg font-semibold text-secondary mb-4">Tus Datos y Resumen</h4>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={bookingData.clientName}
                  onChange={e => setBookingData({...bookingData, clientName: e.target.value})}
                  className="w-full border border-primary-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ej. Ana Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Teléfono</label>
                <input 
                  type="tel" 
                  value={bookingData.clientPhone}
                  onChange={e => setBookingData({...bookingData, clientPhone: e.target.value})}
                  className="w-full border border-primary-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Ej. 11 2345 6789"
                />
              </div>
            </div>

            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
              <h5 className="font-bold text-secondary mb-3 border-b border-primary-200 pb-2">Resumen de Reserva</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-primary-600">Servicio:</span> <span className="font-medium text-secondary">{selectedService?.name}</span></div>
                <div className="flex justify-between"><span className="text-primary-600">Profesional:</span> <span className="font-medium text-secondary">{selectedProfessional?.name}</span></div>
                <div className="flex justify-between"><span className="text-primary-600">Fecha/Hora:</span> <span className="font-medium text-secondary">Hoy, {bookingData.time}</span></div>
                <div className="flex justify-between pt-2 border-t border-primary-200 mt-2"><span className="font-bold text-secondary">Total:</span> <span className="font-bold text-primary-800">${selectedService?.price.toLocaleString()}</span></div>
              </div>
            </div>
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
          <button onClick={handleNext} disabled={!isStepValid()} className={`btn-primary ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Siguiente
          </button>
        ) : (
          <button onClick={handleConfirm} disabled={!isStepValid()} className={`btn-primary bg-secondary hover:bg-secondary/90 ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}>
            Confirmar Reserva
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
