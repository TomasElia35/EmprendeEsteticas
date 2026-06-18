import React, { useEffect } from 'react';
import Icon from './ui/Icon';

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-3xl shadow-modal w-full max-w-sm overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          id="promo-modal-close"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow"
          aria-label="Cerrar"
        >
          <Icon name="x" className="w-4 h-4 text-secondary" />
        </button>

        {/* Image / gradient header */}
        {promo.imageUrl ? (
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="h-32 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-900 flex items-center justify-center">
            <Icon name="sparkles" className="w-12 h-12 text-white/80" />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Active badge */}
          <div className="inline-flex items-center gap-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
            <span className="status-dot status-dot-green"></span>
            Promoción activa
          </div>

          <h2 className="text-xl font-bold text-secondary mb-2 leading-snug">
            {promo.title}
          </h2>
          <p className="text-primary-600 text-sm leading-relaxed mb-4">
            {promo.description}
          </p>

          {promo.expiresAt && (
            <div className="flex items-center gap-1.5 mb-5">
              <Icon name="calendar" className="w-3.5 h-3.5 text-primary-400" />
              <p className="text-xs text-primary-400">
                Válido hasta:{' '}
                {new Date(promo.expiresAt).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          )}

          <button
            id="promo-modal-cta"
            onClick={() => { onCta(); onClose(); }}
            className="btn-primary w-full py-3 text-base font-semibold"
          >
            {promo.cta || 'Reservar ahora'}
          </button>

          <button
            onClick={onClose}
            className="btn-ghost w-full mt-2 text-sm text-primary-400 hover:text-primary-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
