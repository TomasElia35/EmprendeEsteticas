import React, { useState } from 'react';
import Icon from './ui/Icon';

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
    <div className="bg-white rounded-2xl border border-primary-200 shadow-card overflow-hidden">
      {/* Header clickeable */}
      <button
        id="cancel-requests-panel-toggle"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-primary-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Icon name="alert" className="w-5 h-5 text-accent" />
            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {pending.length}
            </span>
          </div>
          <div className="text-left">
            <p className="font-bold text-secondary text-sm">
              Solicitudes de cancelación pendientes
            </p>
            <p className="text-xs text-primary-500">
              {pending.length} turno{pending.length > 1 ? 's' : ''} esperando resolución
            </p>
          </div>
        </div>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          className="w-4 h-4 text-primary-400"
        />
      </button>

      {expanded && (
        <ul className="divide-y divide-primary-100">
          {pending.map((b) => {
            const service = getService(b.serviceId);
            const prof = getProf(b.professionalId);
            const hasDeposit = b.deposit?.paid;

            return (
              <li key={b.id} className="p-5 space-y-3 bg-primary-50/40">
                {/* Info del turno */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-secondary">{b.clientName}</p>
                    <p className="text-xs text-primary-500 mt-0.5">
                      {service?.name}{prof ? ` · ${prof.name}` : ''} — {b.date} a las {b.time}hs
                    </p>
                    {b.clientPhone && (
                      <p className="text-xs text-primary-400 mt-0.5 flex items-center gap-1">
                        <Icon name="phone" className="w-3 h-3" />
                        {b.clientPhone}
                      </p>
                    )}
                  </div>
                  {hasDeposit && (
                    <span className="badge badge-warning flex items-center gap-1">
                      <Icon name="dollar" className="w-3 h-3" />
                      Seña ${b.deposit.amount.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>

                {/* Motivo de la solicitud */}
                {b.cancelRequest?.reason && (
                  <div className="bg-white border border-primary-100 rounded-xl px-3 py-2">
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
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Icon name="check" className="w-3.5 h-3.5" />
                        Cancelar y devolver seña
                      </button>
                      <button
                        id={`resolve-cancel-no-refund-${b.id}`}
                        onClick={() => onResolve(b.id, 'cancel_no_refund')}
                        className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Icon name="x" className="w-3.5 h-3.5" />
                        Cancelar sin devolver seña
                      </button>
                    </>
                  ) : (
                    <button
                      id={`resolve-cancel-${b.id}`}
                      onClick={() => onResolve(b.id, 'cancel_refund')}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Icon name="check" className="w-3.5 h-3.5" />
                      Confirmar cancelación
                    </button>
                  )}
                  <button
                    id={`resolve-reject-${b.id}`}
                    onClick={() => onResolve(b.id, 'reject')}
                    className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 border border-primary-200 rounded-xl"
                  >
                    <Icon name="x-circle" className="w-3.5 h-3.5 text-primary-500" />
                    Rechazar solicitud (mantener turno)
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
