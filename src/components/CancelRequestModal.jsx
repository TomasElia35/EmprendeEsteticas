import React, { useState } from 'react';

/**
 * CancelRequestModal — aparece cuando el cliente quiere cancelar un turno con seña.
 * Opciones:
 *   1. Contactar al local por WhatsApp (canal principal)
 *   2. Solicitar cancelación online (el admin/empleado decide la seña)
 */
const CancelRequestModal = ({ booking, salon, service, onSendRequest, onClose }) => {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const waLink = salon?.whatsapp
    ? `https://wa.me/${salon.whatsapp}?text=${encodeURIComponent(
        `Hola! Soy ${booking.clientName} y quiero avisarte que no voy a poder asistir a mi turno de ${service?.name} el ${booking.date} a las ${booking.time}hs. ¿Pueden cancelarlo?`
      )}`
    : null;

  const handleSendRequest = () => {
    onSendRequest(booking.id, reason.trim());
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">Cancelar turno</h2>
              <p className="text-white/80 text-sm">Este turno tiene una seña registrada</p>
            </div>
          </div>
        </div>

        {!submitted ? (
          <div className="p-5 space-y-4">
            {/* Info del turno */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
              <p className="font-semibold text-secondary">{service?.name}</p>
              <p className="text-primary-500">📅 {booking.date} a las {booking.time}hs</p>
              {booking.deposit?.paid && (
                <p className="text-amber-600 font-medium">
                  💰 Seña de ${booking.deposit.amount.toLocaleString('es-AR')} registrada
                </p>
              )}
            </div>

            {/* Opción 1 — WhatsApp (recomendado) */}
            {waLink && (
              <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                  <span className="text-lg">💬</span> Opción recomendada — WhatsApp
                </p>
                <p className="text-xs text-green-700 mb-3">
                  Contactá directamente al local. Ellos van a cancelar el turno desde su panel y
                  decidirán sobre la devolución de la seña.
                </p>
                <a
                  id={`cancel-whatsapp-${booking.id}`}
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Escribir al {salon?.name}
                </a>
              </div>
            )}

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">o también podés</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Opción 2 — Solicitud online */}
            <div className="border border-primary-100 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-secondary flex items-center gap-2">
                <span className="text-lg">📋</span> Solicitar cancelación online
              </p>
              <p className="text-xs text-primary-500">
                El local recibirá tu solicitud y decidirá si cancela el turno y qué hacer con la seña.
                <strong> Tu turno sigue vigente hasta que confirmen.</strong>
              </p>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Motivo (opcional)</label>
                <textarea
                  id={`cancel-reason-${booking.id}`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Ej: Me surgió algo inesperado..."
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                />
              </div>
              <button
                id={`send-cancel-request-${booking.id}`}
                onClick={handleSendRequest}
                className="w-full border border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold py-2 rounded-xl text-sm transition-colors"
              >
                Enviar solicitud de cancelación
              </button>
            </div>

            <button onClick={onClose} className="w-full text-sm text-primary-400 hover:text-primary-600 py-2 transition-colors">
              Volver, mantener mi turno
            </button>
          </div>
        ) : (
          /* Estado confirmado */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-secondary text-lg">Solicitud enviada</h3>
            <p className="text-sm text-primary-500">
              El local de <strong>{salon?.name}</strong> recibirá tu solicitud y se comunicará con vos.
              Tu turno sigue activo por ahora.
            </p>
            <button onClick={onClose} className="btn-primary w-full">
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelRequestModal;
