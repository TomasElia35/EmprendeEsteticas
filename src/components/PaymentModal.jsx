import React, { useState, useEffect } from 'react';
import { calculateCommission, applyDiscount } from '../data/mockCommissions';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-primary-800 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold">Registrar Cobro</h2>
          <p className="text-white/80 text-sm mt-1">
            {booking?.clientName} · {service?.name}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Monto base */}
          <div className="flex justify-between items-center py-2 border-b border-primary-100">
            <span className="text-primary-600 text-sm">Precio base</span>
            <span className="font-bold text-secondary">${basePrice.toLocaleString('es-AR')}</span>
          </div>

          {/* Descuento */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">Descuento (opcional)</label>
            <div className="flex gap-2">
              <div className="flex bg-primary-50 rounded-lg p-1 gap-1">
                <button
                  id="discount-type-percent"
                  onClick={() => setDiscountType('percent')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    discountType === 'percent' ? 'bg-white shadow text-secondary' : 'text-primary-500'
                  }`}
                >
                  %
                </button>
                <button
                  id="discount-type-fixed"
                  onClick={() => setDiscountType('fixed')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    discountType === 'fixed' ? 'bg-white shadow text-secondary' : 'text-primary-500'
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
                className="flex-1 border border-primary-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'efectivo', label: 'Efectivo', icon: '💵' },
                { id: 'transferencia', label: 'Transferencia', icon: '📲' },
                { id: 'tarjeta', label: 'Tarjeta', icon: '💳' },
              ].map((m) => (
                <button
                  key={m.id}
                  id={`payment-method-${m.id}`}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    method === m.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-primary-100 hover:border-primary-300'
                  }`}
                >
                  <div className="text-xl mb-1">{m.icon}</div>
                  <div className="text-xs font-medium text-secondary">{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resumen final */}
          <div className="bg-primary-50 rounded-xl p-4 space-y-2">
            {discount && (
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">
                  Descuento ({discountType === 'percent' ? `${discountValue}%` : `$${discountValue}`})
                </span>
                <span className="text-red-500 font-medium">
                  -${(basePrice - finalAmount).toLocaleString('es-AR')}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-primary-200 pt-2">
              <span className="text-secondary">Total a cobrar</span>
              <span className="text-primary-800">${finalAmount.toLocaleString('es-AR')}</span>
            </div>
            {professional && (
              <div className="flex justify-between text-sm text-primary-500 pt-1 border-t border-primary-100">
                <span>Comisión {professional.name} ({commPct}%)</span>
                <span className="font-semibold text-indigo-600">${commAmount.toLocaleString('es-AR')}</span>
              </div>
            )}
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Nota interna (opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: pagó en dos partes"
              className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button
              id="payment-confirm-btn"
              onClick={handleConfirm}
              className="flex-1 btn-primary bg-secondary hover:bg-secondary/90"
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
