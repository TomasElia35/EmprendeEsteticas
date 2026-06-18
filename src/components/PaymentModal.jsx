import React, { useState, useEffect } from 'react';
import { calculateCommission, applyDiscount } from '../data/mockCommissions';
import Icon from './ui/Icon';

/**
 * Modal de cobro de turno.
 * Muestra monto base, permite aplicar descuento (fijo o %) y método de pago.
 * Calcula la comisión del profesional antes de confirmar.
 *
 * Props:
 *   booking: el booking a cobrar
 *   service: objeto del servicio
 *   professional: objeto del profesional
 *   onConfirm(paymentData): callback al confirmar el pago
 *   onClose(): callback al cerrar
 */
const PaymentModal = ({ booking, service, professional, onConfirm, onClose }) => {
  const basePrice = service?.price || 0;

  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [method, setMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');

  const discount = discountValue
    ? { type: discountType, value: parseFloat(discountValue) }
    : null;

  const finalAmount = applyDiscount(basePrice, discount);
  const { percent: commPct, amount: commAmount } = calculateCommission(finalAmount, professional, service?.id);

  const handleConfirm = () => {
    onConfirm({
      amount: finalAmount,
      method,
      discount,
      commissionPercent: commPct,
      commissionAmount: commAmount,
      notes,
      paidAt: new Date().toISOString(),
    });
  };

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const paymentMethods = [
    { id: 'efectivo', label: 'Efectivo', icon: 'dollar' },
    { id: 'transferencia', label: 'Transferencia', icon: 'arrow-right' },
    { id: 'tarjeta', label: 'Tarjeta', icon: 'credit-card' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-modal w-full max-w-md overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="bg-secondary px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Registrar Cobro</h2>
            <p className="text-white/70 text-sm mt-0.5">
              {booking?.clientName} &middot; {service?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors mt-0.5"
            aria-label="Cerrar"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Monto base */}
          <div className="flex justify-between items-center py-2 border-b border-primary-100">
            <span className="text-sm text-primary-500">Precio base</span>
            <span className="font-bold text-secondary">${basePrice.toLocaleString('es-AR')}</span>
          </div>

          {/* Descuento */}
          <div>
            <label className="label">Descuento (opcional)</label>
            <div className="flex gap-2 mt-1">
              <div className="flex bg-primary-50 border border-primary-200 rounded-xl p-1 gap-1">
                <button
                  id="discount-type-percent"
                  onClick={() => setDiscountType('percent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    discountType === 'percent'
                      ? 'bg-white shadow text-secondary border border-primary-200'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  %
                </button>
                <button
                  id="discount-type-fixed"
                  onClick={() => setDiscountType('fixed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    discountType === 'fixed'
                      ? 'bg-white shadow text-secondary border border-primary-200'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  $
                </button>
              </div>
              <input
                id="discount-value-input"
                type="number"
                min="0"
                max={discountType === 'percent' ? '100' : basePrice}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percent' ? 'Ej: 10' : 'Ej: 5000'}
                className="input flex-1"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="label">Método de pago</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  id={`payment-method-${m.id}`}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                    method === m.id
                      ? 'border-primary-700 bg-primary-50'
                      : 'border-primary-100 hover:border-primary-300 bg-white'
                  }`}
                >
                  <Icon
                    name={m.icon}
                    className={`w-5 h-5 ${method === m.id ? 'text-primary-700' : 'text-primary-400'}`}
                  />
                  <span className={`text-xs font-medium ${method === m.id ? 'text-secondary' : 'text-primary-500'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Resumen final */}
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-200 space-y-2">
            {discount && (
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">
                  Descuento ({discountType === 'percent' ? `${discountValue}%` : `$${discountValue}`})
                </span>
                <span className="text-accent font-medium">
                  -${(basePrice - finalAmount).toLocaleString('es-AR')}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-primary-200 pt-2">
              <span className="font-semibold text-secondary">Total a cobrar</span>
              <span className="text-2xl font-bold text-secondary">${finalAmount.toLocaleString('es-AR')}</span>
            </div>
            {professional && (
              <div className="flex justify-between text-sm text-primary-500 pt-1 border-t border-primary-100">
                <span>Comisión {professional.name} ({commPct}%)</span>
                <span className="font-semibold text-primary-700">${commAmount.toLocaleString('es-AR')}</span>
              </div>
            )}
          </div>

          {/* Nota */}
          <div>
            <label className="label">Nota interna (opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: pagó en dos partes"
              className="input w-full mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button
              id="payment-confirm-btn"
              onClick={handleConfirm}
              className="flex-1 btn-primary"
            >
              Confirmar cobro
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
