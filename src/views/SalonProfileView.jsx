import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingWizard from '../components/BookingWizard';
import PromotionModal from '../components/PromotionModal';
import { useAuth } from '../context/AuthContext';

const SalonProfileView = ({ salon, onBack, onBookingComplete }) => {
  const { isLoggedIn, isClient } = useAuth();
  const navigate = useNavigate();
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

      <button onClick={onBack} className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-6 font-medium transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a resultados
      </button>

      {bookingSuccess && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium text-lg">¡Reserva confirmada con éxito!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Salon Details Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-primary-100 overflow-hidden">
            <img src={salon.photo} alt={salon.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-secondary mb-2">{salon.name}</h2>
              <div className="flex items-center gap-2 text-sm text-primary-700 mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {salon.rating} ({salon.reviews} reseñas)
              </div>
              <p className="text-primary-600 mb-4 text-sm leading-relaxed">{salon.description}</p>
              <div className="pt-4 border-t border-primary-100 text-sm text-primary-700 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{salon.address}</span>
                </div>
                {salon.openHours && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{salon.openHours}</span>
                  </div>
                )}
                {salon.instagram && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📸</span>
                    <span className="text-primary-500">{salon.instagram}</span>
                  </div>
                )}
              </div>

              {/* Login gate notice */}
              {!isLoggedIn() && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <strong>Para reservar</strong> necesitás estar registrado.{' '}
                  <button
                    onClick={() => navigate('/login', { state: { from: { pathname: '/' } } })}
                    className="underline font-semibold hover:text-amber-900"
                  >
                    Ingresá o registrate aquí
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {showWizard ? (
            <BookingWizard
              salon={salon}
              onComplete={handleBookingComplete}
              onCancel={() => setShowWizard(false)}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-primary-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-primary-100">
                <h3 className="text-2xl font-bold text-secondary">Nuestros Servicios</h3>
                <button
                  id="open-booking-wizard-btn"
                  onClick={handleReserveClick}
                  className="btn-primary"
                >
                  {isLoggedIn() ? 'Reservar Turno' : 'Reservar (requiere login)'}
                </button>
              </div>

              <div className="space-y-8">
                {Array.from(new Set(salon.services.map((s) => s.category))).map((category) => (
                  <div key={category}>
                    <h4 className="text-lg font-semibold text-primary-800 mb-4 uppercase tracking-wider text-sm">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {salon.services.filter((s) => s.category === category).map((service) => (
                        <div key={service.id} className="p-4 border border-primary-100 rounded-lg hover:border-primary-300 transition-colors">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-secondary">{service.name}</span>
                            <span className="font-bold text-primary-700">${service.price.toLocaleString('es-AR')}</span>
                          </div>
                          <span className="text-xs text-primary-500 bg-primary-50 px-2 py-1 rounded inline-block">
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
      </div>
    </div>
  );
};

export default SalonProfileView;
