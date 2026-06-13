import React, { useState } from 'react';

/**
 * CancelRequestsPanel — Panel para admin/empleado.
 * Muestra los turnos con solicitudes de cancelación pendientes y permite
 * resolverlas: cancelar con seña, cancelar sin seña, o rechazar la solicitud.
 */
const CancelRequestsPanel = ({ salon, bookings, onResolve }) => {
  const [expanded, setExpanded] = useState(true);

  const pending = bookings.filter(
    (b) => b.cancelRequest && b.status !== 'cancelled' && b.status !== 'completed'
  );

  if (pending.length === 0) return null;

  const getService = (sid) => salon?.services.find((s) => s.id === sid);
  const getProf = (pid) => salon?.professionals.find((p) => p.id === pid);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden">
      {/* Header clickeable */}
      <button
        id="cancel-requests-panel-toggle"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {pending.length}
            </span>
          </div>
          <div className="text-left">
            <p className="font-bold text-secondary text-sm">
              Solicitudes de cancelación pendientes
            </p>
            <p className="text-xs text-amber-600">{pending.length} turno{pending.length > 1 ? 's' : ''} esperando resolución</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-primary-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <ul className="divide-y divide-amber-100">
          {pending.map((b) => {
            const service = getService(b.serviceId);
            const prof = getProf(b.professionalId);
            const hasDeposit = b.deposit?.paid;

            return (
              <li key={b.id} className="p-5 space-y-3 bg-amber-50/30">
                {/* Info del turno */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-secondary">{b.clientName}</p>
                    <p className="text-xs text-primary-500 mt-0.5">
                      {service?.name}{prof ? ` · ${prof.name}` : ''} — {b.date} a las {b.time}hs
                    </p>
                    {b.clientPhone && (
                      <p className="text-xs text-primary-400 mt-0.5">📞 {b.clientPhone}</p>
                    )}
                  </div>
                  {hasDeposit && (
                    <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      💰 Seña ${b.deposit.amount.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>

                {/* Motivo de la solicitud */}
                {b.cancelRequest?.reason && (
                  <div className="bg-white border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-primary-400 font-medium mb-0.5">Motivo del cliente:</p>
                    <p className="text-sm text-secondary italic">"{b.cancelRequest.reason}"</p>
                  </div>
                )}
                <p className="text-xs text-primary-400">
                  Solicitud recibida: {formatDate(b.cancelRequest.requestedAt)}
                </p>

                {/* Acciones */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {hasDeposit ? (
                    <>
                      <button
                        id={`resolve-cancel-refund-${b.id}`}
                        onClick={() => onResolve(b.id, 'cancel_refund')}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                      >
                        ✅ Cancelar y devolver seña
                      </button>
                      <button
                        id={`resolve-cancel-no-refund-${b.id}`}
                        onClick={() => onResolve(b.id, 'cancel_no_refund')}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        ❌ Cancelar sin devolver seña
                      </button>
                    </>
                  ) : (
                    <button
                      id={`resolve-cancel-${b.id}`}
                      onClick={() => onResolve(b.id, 'cancel_refund')}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      ✅ Confirmar cancelación
                    </button>
                  )}
                  <button
                    id={`resolve-reject-${b.id}`}
                    onClick={() => onResolve(b.id, 'reject')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    🟡 Rechazar solicitud (mantener turno)
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CancelRequestsPanel;
