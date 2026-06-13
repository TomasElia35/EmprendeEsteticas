import React, { useEffect } from 'react';

/**
 * Modal de promoción del local.
 * Se muestra automáticamente al cliente al entrar al perfil del salón.
 * Se marca en sessionStorage para no repetirse en la misma sesión.
 *
 * Props:
 *   promo: { title, description, imageUrl, cta, expiresAt }
 *   onClose(): callback al cerrar
 *   onCta(): callback al hacer click en el CTA (ej: abrir wizard de reserva)
 */
const PromotionModal = ({ promo, onClose, onCta }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
  if (isExpired) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          id="promo-modal-close"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
        >
          <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image / gradient header */}
        {promo.imageUrl ? (
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="h-32 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary flex items-center justify-center">
            <span className="text-5xl">🎉</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
            Promoción activa
          </div>

          <h2 className="text-xl font-bold text-secondary mb-2 leading-snug">{promo.title}</h2>
          <p className="text-primary-600 text-sm leading-relaxed mb-5">{promo.description}</p>

          {promo.expiresAt && (
            <p className="text-xs text-primary-400 mb-4">
              Válido hasta: {new Date(promo.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
            </p>
          )}

          <button
            id="promo-modal-cta"
            onClick={() => { onCta(); onClose(); }}
            className="w-full btn-primary py-3 rounded-xl font-semibold text-base"
          >
            {promo.cta || 'Reservar ahora'}
          </button>

          <button
            onClick={onClose}
            className="w-full mt-2 text-sm text-primary-400 hover:text-primary-600 transition-colors py-1"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
