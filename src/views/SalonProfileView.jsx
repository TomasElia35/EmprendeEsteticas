import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingWizard from '../components/BookingWizard';
import PromotionModal from '../components/PromotionModal';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/ui/Icon';

const SalonProfileView = ({ salon, onBack, onBookingComplete }) => {
  const { isLoggedIn, isClient } = useAuth();
  const navigate = useNavigate();

  // Solo los clientes (o visitantes que luego se registran) pueden sacar turnos.
  // Admin, empleado y superadmin no reservan desde el flujo del cliente.
  const isStaff = isLoggedIn() && !isClient();
  const [showWizard, setShowWizard] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  // Mostrar el modal de promo al cargar (solo clientes, una vez por sesión)
  useEffect(() => {
    if (!salon?.promotionModal?.active) return;
    if (!isLoggedIn() || isClient()) {
      const seenKey = `promo_seen_${salon.id}`;
      if (!sessionStorage.getItem(seenKey)) {
        const timer = setTimeout(() => {
          setShowPromo(true);
          sessionStorage.setItem(seenKey, '1');
        }, 600); // pequeño delay para que la vista cargue primero
        return () => clearTimeout(timer);
      }
    }
  }, [salon?.id]);

  const handleReserveClick = () => {
    if (!isLoggedIn()) {
      // Redirige a login con estado para volver
      navigate('/login', { state: { from: { pathname: '/' }, openBooking: salon.id } });
      return;
    }
    // El staff no puede reservar desde el flujo del cliente
    if (isStaff) return;
    setShowWizard(true);
  };

  const handleBookingComplete = (booking) => {
    onBookingComplete(booking);
    setShowWizard(false);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      onBack();
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Promotion Modal */}
      {showPromo && salon.promotionModal?.active && (
        <PromotionModal
          promo={salon.promotionModal}
          onClose={() => setShowPromo(false)}
          onCta={() => handleReserveClick()}
        />
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-6 font-medium transition-colors"
      >
        <Icon name="chevron-left" className="w-5 h-5" />
        Volver a resultados
      </button>

      {bookingSuccess && (
        <div className="mb-6 p-4 bg-white border border-primary-200 rounded-2xl shadow-card flex items-center gap-3">
          <span className="status-dot status-dot-green flex-shrink-0" />
          <span className="font-medium text-primary-800 text-base">Reserva confirmada con exito.</span>
        </div>
      )}

      {/* Hero */}
      <div className="relative h-64 overflow-hidden rounded-2xl">
        <img
          src={salon.photo}
          alt={salon.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-secondary/40" />
      </div>

      {/* Info bar */}
      <div className="bg-white border border-primary-100 rounded-2xl shadow-card p-6 mt-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="page-title text-3xl mb-1">{salon.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
              <span className="flex items-center gap-1 text-gold-600 font-semibold">
                <Icon name="star" className="w-4 h-4 text-gold-500" />
                {salon.rating}
                <span className="text-primary-500 font-normal ml-1">({salon.reviews} reseñas)</span>
              </span>
              <span className="flex items-center gap-1 text-primary-600">
                <Icon name="map-pin" className="w-4 h-4 text-primary-400" />
                {salon.address}
              </span>
              {salon.openHours && (
                <span className="flex items-center gap-1 text-primary-600">
                  <Icon name="clock" className="w-4 h-4 text-primary-400" />
                  {salon.openHours}
                </span>
              )}
              {salon.instagram && (
                <span className="flex items-center gap-1 text-primary-500">
                  <Icon name="sparkles" className="w-4 h-4 text-primary-400" />
                  {salon.instagram}
                </span>
              )}
            </div>
            {salon.description && (
              <p className="text-primary-600 text-sm leading-relaxed mt-3 max-w-2xl">{salon.description}</p>
            )}
          </div>

          {!isStaff && (
            <div className="flex-shrink-0">
              <button
                id="open-booking-wizard-btn"
                onClick={handleReserveClick}
                className="btn-gold whitespace-nowrap"
              >
                {isLoggedIn() ? 'Reservar Turno' : 'Reservar'}
              </button>
            </div>
          )}
        </div>

        {/* Staff notice — no pueden reservar como cliente */}
        {isStaff && (
          <div className="mt-4 pt-4 border-t border-primary-100 flex items-center gap-2">
            <Icon name="info" className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <p className="text-sm text-primary-600">
              Las reservas son exclusivas para clientes. Tu cuenta de staff no puede sacar turnos desde aqui.
            </p>
          </div>
        )}

        {/* Login gate notice */}
        {!isLoggedIn() && (
          <div className="mt-4 pt-4 border-t border-primary-100 flex items-center gap-2">
            <Icon name="info" className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <p className="text-sm text-primary-600">
              Para reservar necesitas estar registrado.{' '}
              <button
                onClick={() => navigate('/login', { state: { from: { pathname: '/' } } })}
                className="underline font-semibold text-primary-700 hover:text-primary-900 transition-colors"
              >
                Ingresa o registrate aqui
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Main content */}
      {showWizard && !isStaff ? (
        <BookingWizard
          salon={salon}
          onComplete={handleBookingComplete}
          onCancel={() => setShowWizard(false)}
        />
      ) : (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="page-title text-2xl">Nuestros Servicios</h3>
            {!isStaff && (
              <button
                id="open-booking-wizard-btn"
                onClick={handleReserveClick}
                className="btn-gold"
              >
                {isLoggedIn() ? 'Reservar Turno' : 'Reservar'}
              </button>
            )}
          </div>

          <div className="card-body space-y-8">
            {Array.from(new Set(salon.services.map((s) => s.category))).map((category) => (
              <div key={category}>
                <p className="section-label mb-4">{category}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {salon.services.filter((s) => s.category === category).map((service) => (
                    <div
                      key={service.id}
                      className="lift p-4 border border-primary-100 rounded-xl hover:border-gold-400 hover:bg-primary-50/60 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-secondary">{service.name}</span>
                        <span className="text-gold font-bold">${service.price.toLocaleString('es-AR')}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-primary-500 bg-primary-50 border border-primary-100 px-2 py-1 rounded-lg">
                        <Icon name="clock" className="w-3 h-3" />
                        {service.duration} minutos
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonProfileView;
