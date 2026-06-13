import React, { useState } from 'react';
import { initialSubscriptions } from '../../data/mockData';
import SuperAdminLayout from './SuperAdminLayout';

const PLAN_COLORS = {
  Pro: 'bg-indigo-100 text-indigo-700',
  Enterprise: 'bg-purple-100 text-purple-700',
  Starter: 'bg-primary-100 text-primary-700',
};

const SubscriptionsView = () => {
  const [subs] = useState(initialSubscriptions);

  const totalMRR = subs
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlyPrice, 0);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary">Suscripciones</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Suscripciones activas', value: subs.filter((s) => s.status === 'active').length, icon: '✅', color: 'bg-green-50 border-green-200' },
            { label: 'MRR (Ingresos mensuales)', value: `$${totalMRR.toLocaleString('es-AR')}`, icon: '💰', color: 'bg-indigo-50 border-indigo-200' },
            { label: 'Planes Enterprise', value: subs.filter((s) => s.plan === 'Enterprise').length, icon: '⭐', color: 'bg-purple-50 border-purple-200' },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border ${item.color} p-5`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-2xl font-bold text-secondary">{item.value}</p>
              <p className="text-sm text-primary-500">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-primary-100 text-primary-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Emprendimiento</th>
                <th className="text-left px-6 py-3">Plan</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Estado</th>
                <th className="text-left px-6 py-3 hidden lg:table-cell">Inicio</th>
                <th className="text-left px-6 py-3 hidden lg:table-cell">Próx. vencimiento</th>
                <th className="text-right px-6 py-3">Precio/mes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {subs.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-secondary">{sub.businessName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLAN_COLORS[sub.plan] || 'bg-gray-100 text-gray-600'}`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {sub.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-primary-500 hidden lg:table-cell">
                    {new Date(sub.startDate).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 text-primary-500 hidden lg:table-cell">
                    {new Date(sub.nextBillingDate).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-secondary">
                    ${sub.monthlyPrice.toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SubscriptionsView;
