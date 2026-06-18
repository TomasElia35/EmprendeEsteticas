// =============================================================================
// COMMISSION LOGIC — Cálculo de comisiones para profesionales
// =============================================================================

/**
 * Calcula la comisión de un profesional por un turno.
 * Prioridad: override por servicio (serviceCommissions) > comisión base (commission %)
 *
 * @param {number} baseAmount - Monto base del turno (después de descuentos)
 * @param {object} professional - Objeto del profesional con commission y serviceCommissions
 * @param {number} serviceId - ID del servicio realizado
 * @returns {{ percent: number, amount: number }}
 */
export const calculateCommission = (baseAmount, professional, serviceId) => {
  if (!professional) return { percent: 0, amount: 0 };

  const overrides = professional.serviceCommissions || {};
  const percent = overrides[serviceId] !== undefined
    ? overrides[serviceId]
    : professional.commission;

  const amount = Math.round(baseAmount * (percent / 100));
  return { percent, amount };
};

/**
 * Aplica un descuento a un monto base.
 *
 * @param {number} baseAmount - Monto original del servicio
 * @param {{ type: 'percent'|'fixed', value: number }|null} discount
 * @returns {number} - Monto final después del descuento
 */
export const applyDiscount = (baseAmount, discount) => {
  if (!discount || !discount.value) return baseAmount;
  if (discount.type === 'percent') {
    return Math.round(baseAmount * (1 - discount.value / 100));
  }
  if (discount.type === 'fixed') {
    return Math.max(0, baseAmount - discount.value);
  }
  return baseAmount;
};

/**
 * Obtiene el resumen de facturación del día para un negocio.
 * Incluye turnos completados y sus comisiones por profesional.
 *
 * @param {number} businessId
 * @param {string} date - formato YYYY-MM-DD
 * @param {Array} bookings - array de bookings con payment
 * @param {Array} professionals - array de profesionales del negocio
 * @param {Array} services - array de servicios del negocio
 * @returns {{ totalBilled: number, byProfessional: Array, completedBookings: Array }}
 */
export const getDailyBillingSummary = (businessId, date, bookings, professionals, services) => {
  const dayBookings = bookings.filter(
    (b) => b.salonId === businessId && b.date === date && b.status === 'completed' && b.payment
  );

  const totalBilled = dayBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

  // Agrupar por profesional
  const byProfessional = professionals.map((prof) => {
    const profBookings = dayBookings.filter((b) => b.professionalId === prof.id);
    const profTotal = profBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
    const service = profBookings.length > 0
      ? services.find((s) => s.id === profBookings[0].serviceId)
      : null;
    const { percent, amount: commissionAmount } = calculateCommission(profTotal, prof, service?.id);

    return {
      professional: prof,
      bookingsCount: profBookings.length,
      totalBilled: profTotal,
      commissionPercent: percent,
      commissionAmount,
    };
  }).filter((p) => p.bookingsCount > 0);

  return { totalBilled, byProfessional, completedBookings: dayBookings };
};

/**
 * Obtiene el resumen de facturación para un rango de fechas.
 */
export const getRangeBillingSummary = (businessId, fromDate, toDate, bookings, professionals, services) => {
  const rangeBookings = bookings.filter(
    (b) => b.salonId === businessId && b.date >= fromDate && b.date <= toDate && b.status === 'completed' && b.payment
  );

  const totalBilled = rangeBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

  const byProfessional = professionals.map((prof) => {
    const profBookings = rangeBookings.filter((b) => b.professionalId === prof.id);
    const profTotal = profBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
    const commissionAmounts = profBookings.map(b => {
      const svc = services.find(s => s.id === b.serviceId);
      const { amount } = calculateCommission(b.payment?.amount || 0, prof, svc?.id);
      return amount;
    });
    const commissionAmount = commissionAmounts.reduce((s, a) => s + a, 0);
    const percent = prof.commission;
    return { professional: prof, bookingsCount: profBookings.length, totalBilled: profTotal, commissionPercent: percent, commissionAmount };
  }).filter((p) => p.bookingsCount > 0);

  return { totalBilled, byProfessional, completedBookings: rangeBookings };
};
