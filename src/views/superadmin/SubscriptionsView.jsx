import React, { useState } from 'react';
import { initialSubscriptions, SUBSCRIPTION_PLANS } from '../../data/mockData';
import SuperAdminLayout from './SuperAdminLayout';
import Modal from '../../components/ui/Modal';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

const PLAN_BADGE = {
  Starter:    'badge badge-neutral',
  Pro:        'badge badge-info',
  Enterprise: 'badge-gold',
};

const PLAN_RING = {
  Starter:    'border-primary-300',
  Pro:        'border-primary-500',
  Enterprise: 'border-accent',
};

const PLAN_SELECTED = {
  Starter:    'border-primary-400 bg-primary-50 text-primary-700',
  Pro:        'border-primary-600 bg-primary-100 text-primary-800',
  Enterprise: 'border-accent bg-primary-100 text-accent',
};

const STATUS_BADGE = {
  active:    'badge badge-success',
  suspended: 'badge badge-warning',
  cancelled: 'badge badge-danger',
};

const STATUS_LABELS = { active: 'Activa', suspended: 'Suspendida', cancelled: 'Cancelada' };

const PAYMENT_METHODS = ['Mercado Pago', 'Transferencia bancaria', 'Tarjeta de crédito', 'Efectivo', 'Otro'];

const emptyForm = (sub) => ({
  plan: sub?.plan || 'Pro',
  billingCycle: sub?.billingCycle || 'monthly',
  status: sub?.status || 'active',
  paymentMethod: sub?.paymentMethod || 'Mercado Pago',
  contactEmail: sub?.contactEmail || '',
  nextBillingDate: sub?.nextBillingDate || '',
  notes: sub?.notes || '',
});

const SubscriptionsView = () => {
  const [subs, setSubs] = useState(initialSubscriptions);
  const [editSub, setEditSub] = useState(null);
  const [form, setForm] = useState({});
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const openEdit = (sub) => {
    setEditSub(sub);
    setForm(emptyForm(sub));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => {
      const updated = { ...f, [name]: value };
      // Al cambiar plan o ciclo, actualiza los precios automáticamente
      if (name === 'plan' || name === 'billingCycle') {
        const planDef = SUBSCRIPTION_PLANS[updated.plan];
        updated.monthlyPrice = planDef.monthlyPrice;
        updated.annualPrice = planDef.annualPrice;
      }
      return updated;
    });
  };

  const handleSave = () => {
    const planDef = SUBSCRIPTION_PLANS[form.plan];
    setSubs(prev => prev.map(s => s.id !== editSub.id ? s : {
      ...s,
      ...form,
      monthlyPrice: planDef.monthlyPrice,
      annualPrice: planDef.annualPrice,
    }));
    toast.success(`Suscripción de ${editSub.businessName} actualizada.`);
    setEditSub(null);
  };

  const filteredSubs = subs.filter(s => {
    if (filterPlan !== 'all' && s.plan !== filterPlan) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const activeSubs = subs.filter(s => s.status === 'active');
  const mrr = activeSubs.reduce((sum, s) =>
    sum + (s.billingCycle === 'annual' ? Math.round(s.annualPrice / 12) : s.monthlyPrice), 0);
  const arr = mrr * 12;

  const byPlan = Object.keys(SUBSCRIPTION_PLANS).map(plan => ({
    plan,
    count: subs.filter(s => s.plan === plan && s.status === 'active').length,
  }));

  const selectedPlanDef = form.plan ? SUBSCRIPTION_PLANS[form.plan] : null;
  const effectivePrice = form.billingCycle === 'annual'
    ? selectedPlanDef?.annualPrice
    : selectedPlanDef?.monthlyPrice;

  const statCards = [
    {
      label: 'MRR',
      value: `$${mrr.toLocaleString('es-AR')}`,
      sub: 'Ingreso mensual recurrente',
      icon: 'dollar',
      highlight: true,
    },
    {
      label: 'ARR',
      value: `$${arr.toLocaleString('es-AR')}`,
      sub: 'Ingreso anual estimado',
      icon: 'arrow-trending-up',
      highlight: true,
    },
    {
      label: 'Activas',
      value: activeSubs.length,
      sub: `de ${subs.length} en total`,
      icon: 'check-circle',
    },
    {
      label: 'Enterprise',
      value: byPlan.find(p => p.plan === 'Enterprise')?.count || 0,
      sub: 'clientes premium',
      icon: 'star',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="page-header">
          <h1 className="page-title">Suscripciones</h1>
        </div>

        {/* ── Métricas ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(item => (
            <div key={item.label} className="stat-card">
              <Icon name={item.icon} className={`w-5 h-5 mb-2 ${item.highlight ? 'text-gold-500' : 'text-primary-500'}`} />
              <p className={`stat-value ${item.highlight ? 'text-gold' : ''}`}>{item.value}</p>
              <p className="stat-label">{item.label}</p>
              <p className="stat-sub">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Planes disponibles ───────────────────────────────────────── */}
        <div>
          <p className="section-label mb-4">Planes disponibles</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(SUBSCRIPTION_PLANS).map(plan => {
              const activeCount = byPlan.find(p => p.plan === plan.name)?.count || 0;
              const ringClass = PLAN_RING[plan.name] || 'border-primary-300';
              return (
                <div key={plan.name} className={`card border-2 ${ringClass} overflow-hidden lift`}>
                  <div className="card-header flex items-center justify-between">
                    <div>
                      <span className={PLAN_BADGE[plan.name] || 'badge badge-neutral'}>{plan.name}</span>
                      <p className="text-xs text-primary-400 mt-1">
                        {activeCount} negocio{activeCount !== 1 ? 's' : ''} activo{activeCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gold">${plan.monthlyPrice.toLocaleString('es-AR')}</p>
                      <p className="text-xs text-primary-400">/mes</p>
                      <p className="text-xs text-primary-500 mt-0.5">${plan.annualPrice.toLocaleString('es-AR')}/año</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <ul className="space-y-1.5">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-primary-600">
                          <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-xs text-primary-600">
                        <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        {plan.maxProfessionals ? `Hasta ${plan.maxProfessionals} profesionales` : 'Profesionales ilimitados'}
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tabla de suscripciones ───────────────────────────────────── */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="section-label">Suscripciones activas</p>
            <div className="flex gap-2">
              <select
                value={filterPlan}
                onChange={e => setFilterPlan(e.target.value)}
                className="input py-1.5 text-sm"
              >
                <option value="all">Todos los planes</option>
                {Object.keys(SUBSCRIPTION_PLANS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="input py-1.5 text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activa</option>
                <option value="suspended">Suspendida</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th">Emprendimiento</th>
                  <th className="table-th">Plan</th>
                  <th className="table-th hidden sm:table-cell">Ciclo</th>
                  <th className="table-th hidden md:table-cell">Estado</th>
                  <th className="table-th hidden lg:table-cell">Prox. vencimiento</th>
                  <th className="table-th hidden lg:table-cell">Metodo de pago</th>
                  <th className="table-th text-right">Precio</th>
                  <th className="table-th text-right">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filteredSubs.map(sub => {
                  const price = sub.billingCycle === 'annual' ? sub.annualPrice : sub.monthlyPrice;
                  const priceLabel = sub.billingCycle === 'annual' ? '/año' : '/mes';
                  const daysUntil = Math.ceil((new Date(sub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const nearExpiry = daysUntil >= 0 && daysUntil <= 7;
                  return (
                    <tr key={sub.id} className="hover:bg-primary-50/60 transition-colors">
                      <td className="table-td">
                        <p className="font-semibold text-secondary">{sub.businessName}</p>
                        {sub.contactEmail && <p className="text-xs text-primary-400">{sub.contactEmail}</p>}
                        {sub.notes && (
                          <p className="text-xs text-amber-600 mt-0.5 italic truncate max-w-[180px]" title={sub.notes}>
                            {sub.notes}
                          </p>
                        )}
                      </td>
                      <td className="table-td">
                        <span className={PLAN_BADGE[sub.plan] || 'badge badge-neutral'}>{sub.plan}</span>
                      </td>
                      <td className="table-td text-primary-600 hidden sm:table-cell capitalize">
                        {sub.billingCycle === 'annual' ? 'Anual' : 'Mensual'}
                      </td>
                      <td className="table-td hidden md:table-cell">
                        <span className={STATUS_BADGE[sub.status] || STATUS_BADGE.active}>
                          {STATUS_LABELS[sub.status] || sub.status}
                        </span>
                      </td>
                      <td className="table-td hidden lg:table-cell">
                        <span className={nearExpiry ? 'text-red-600 font-semibold' : 'text-primary-500'}>
                          {new Date(sub.nextBillingDate).toLocaleDateString('es-AR')}
                          {nearExpiry && (
                            <span className="ml-1.5 text-xs font-semibold text-red-600">{daysUntil}d</span>
                          )}
                        </span>
                      </td>
                      <td className="table-td text-primary-500 hidden lg:table-cell">{sub.paymentMethod}</td>
                      <td className="table-td text-right">
                        <p className="font-bold text-gold">${price.toLocaleString('es-AR')}</p>
                        <p className="text-xs text-primary-400">{priceLabel}</p>
                      </td>
                      <td className="table-td text-right">
                        <button
                          onClick={() => openEdit(sub)}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredSubs.length === 0 && (
              <p className="text-center text-primary-400 py-10 text-sm">Sin suscripciones para los filtros seleccionados.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal de gestión ────────────────────────────────────────────── */}
      <Modal isOpen={!!editSub} onClose={() => setEditSub(null)} title={`Gestionar: ${editSub?.businessName}`}>
        {editSub && (
          <div className="space-y-5">

            {/* Plan */}
            <div>
              <label className="label">Plan de membresia</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(SUBSCRIPTION_PLANS).map(plan => (
                  <button
                    key={plan}
                    onClick={() => handleChange({ target: { name: 'plan', value: plan } })}
                    className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.plan === plan
                        ? PLAN_SELECTED[plan] || 'border-primary-500 bg-primary-100 text-primary-800'
                        : 'border-primary-200 text-primary-500 hover:border-primary-400'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
              {selectedPlanDef && (
                <div className="mt-2 bg-primary-50 rounded-xl px-4 py-3 space-y-1.5">
                  {selectedPlanDef.features.map(f => (
                    <p key={f} className="flex items-center gap-2 text-xs text-primary-600">
                      <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      {f}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Ciclo de facturación */}
            <div>
              <label className="label">Ciclo de facturacion</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'monthly', label: 'Mensual', price: selectedPlanDef?.monthlyPrice },
                  { value: 'annual',  label: 'Anual',   price: selectedPlanDef?.annualPrice },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleChange({ target: { name: 'billingCycle', value: opt.value } })}
                    className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.billingCycle === opt.value
                        ? 'border-primary-600 bg-primary-100 text-primary-800'
                        : 'border-primary-200 text-primary-500 hover:border-primary-300'
                    }`}
                  >
                    <p>{opt.label}</p>
                    {opt.price && <p className="text-xs font-bold mt-0.5">${opt.price.toLocaleString('es-AR')}</p>}
                  </button>
                ))}
              </div>
              {effectivePrice && (
                <p className="text-xs text-primary-500 mt-1.5">
                  Precio del plan:{' '}
                  <strong className="text-secondary">${effectivePrice.toLocaleString('es-AR')}</strong>
                  {form.billingCycle === 'annual' && selectedPlanDef && (
                    <span className="ml-2 text-emerald-600 font-semibold">
                      (aprox. ${Math.round(effectivePrice / 12).toLocaleString('es-AR')}/mes)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="label">Estado de la suscripcion</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => handleChange({ target: { name: 'status', value: val } })}
                    className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      form.status === val
                        ? val === 'active'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : val === 'suspended'
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-red-400 bg-red-50 text-red-700'
                        : 'border-primary-200 text-primary-500 hover:border-primary-300'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Próximo vencimiento + método de pago */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Proximo vencimiento</label>
                <input
                  type="date"
                  name="nextBillingDate"
                  value={form.nextBillingDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Metodo de pago</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="input"
                >
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Email de contacto */}
            <div>
              <label className="label">Email de contacto</label>
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="admin@negocio.com"
                className="input"
              />
            </div>

            {/* Notas internas */}
            <div>
              <label className="label">Notas internas</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Acuerdos especiales, observaciones, etc."
                className="input resize-none"
              />
            </div>

            {/* Resumen del plan elegido */}
            <div className="bg-primary-50 rounded-xl px-4 py-4 space-y-1.5">
              <p className="font-semibold text-secondary text-sm mb-2">Resumen</p>
              <p className="text-xs text-primary-600">Plan: <strong className="text-secondary">{form.plan}</strong></p>
              <p className="text-xs text-primary-600">Ciclo: <strong className="text-secondary">{form.billingCycle === 'annual' ? 'Anual' : 'Mensual'}</strong></p>
              <p className="text-xs text-primary-600">Monto: <strong className="text-secondary">${effectivePrice?.toLocaleString('es-AR')}</strong></p>
              <p className="text-xs text-primary-600">Estado: <strong className="text-secondary">{STATUS_LABELS[form.status]}</strong></p>
              <p className="text-xs text-primary-600">
                Vence:{' '}
                <strong className="text-secondary">
                  {form.nextBillingDate ? new Date(form.nextBillingDate + 'T12:00').toLocaleDateString('es-AR') : '—'}
                </strong>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setEditSub(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSave} className="btn-gold">Guardar cambios</button>
            </div>
          </div>
        )}
      </Modal>
    </SuperAdminLayout>
  );
};

export default SubscriptionsView;
