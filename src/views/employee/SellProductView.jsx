import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import EmployeeLayout from './EmployeeLayout';
import { toast } from '../../components/ui/Toast';

const SellProductView = () => {
  const { user } = useAuth();
  const salon = initialSalons.find((s) => s.id === user?.businessId);
  const [products, setProducts] = useState(salon?.products || []);
  const [sales, setSales] = useState(() => {
    return JSON.parse(localStorage.getItem(`estetica_sales_${user?.businessId}`) || '[]');
  });
  const [sellModal, setSellModal] = useState(null);
  const [saleForm, setSaleForm] = useState({ clientName: '', quantity: 1 });

  const handleSell = () => {
    if (!saleForm.clientName.trim()) {
      toast.error('Ingresá el nombre del cliente.');
      return;
    }
    const qty = parseInt(saleForm.quantity) || 1;
    if (qty <= 0) { toast.error('Cantidad inválida.'); return; }
    if (qty > sellModal.stock) { toast.error('Stock insuficiente.'); return; }

    const today = new Date().toISOString().split('T')[0];
    const sale = {
      id: `sale-${Date.now()}`,
      productId: sellModal.id,
      productName: sellModal.name,
      quantity: qty,
      unitPrice: sellModal.salePrice,
      totalPrice: sellModal.salePrice * qty,
      clientName: saleForm.clientName,
      date: today,
      soldAt: new Date().toISOString(),
    };

    const newSales = [...sales, sale];
    setSales(newSales);
    localStorage.setItem(`estetica_sales_${user?.businessId}`, JSON.stringify(newSales));

    // Reducir stock
    setProducts((prev) =>
      prev.map((p) => p.id === sellModal.id ? { ...p, stock: p.stock - qty } : p)
    );

    setSellModal(null);
    setSaleForm({ clientName: '', quantity: 1 });
    toast.success(`Venta registrada: ${qty}x ${sale.productName}`);
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Vender Producto</h1>
          <p className="text-primary-500 text-sm mt-1">Stock de {salon?.name}</p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-primary-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-secondary text-sm leading-tight">{p.name}</h3>
                  <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                    {p.category}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-400">Precio venta</span>
                  <span className="font-bold text-secondary">${p.salePrice.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-400">Stock</span>
                  <span className={`font-semibold ${p.stock <= 3 ? 'text-red-500' : 'text-green-600'}`}>
                    {p.stock} unidades
                  </span>
                </div>
              </div>

              <button
                id={`sell-product-${p.id}`}
                onClick={() => { setSellModal(p); setSaleForm({ clientName: '', quantity: 1 }); }}
                disabled={p.stock === 0}
                className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                  p.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {p.stock === 0 ? 'Sin stock' : 'Vender'}
              </button>
            </div>
          ))}
        </div>

        {/* Ventas del día */}
        {sales.length > 0 && (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-primary-50">
              <h2 className="font-bold text-secondary">Ventas registradas hoy</h2>
            </div>
            <ul className="divide-y divide-primary-50">
              {sales
                .filter((s) => s.date === new Date().toISOString().split('T')[0])
                .map((sale) => (
                  <li key={sale.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary text-sm">{sale.productName}</p>
                      <p className="text-xs text-primary-400">{sale.clientName} · {sale.quantity} unidad{sale.quantity !== 1 ? 'es' : ''}</p>
                    </div>
                    <span className="font-bold text-secondary">${sale.totalPrice.toLocaleString('es-AR')}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sell modal */}
      {sellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSellModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-secondary mb-1">Registrar venta</h2>
            <p className="text-sm text-primary-400 mb-5">{sellModal.name} · ${sellModal.salePrice.toLocaleString('es-AR')} c/u</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Cliente *</label>
                <input type="text" value={saleForm.clientName}
                  onChange={(e) => setSaleForm({ ...saleForm, clientName: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Nombre del cliente" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Cantidad</label>
                <input type="number" min="1" max={sellModal.stock} value={saleForm.quantity}
                  onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="bg-primary-50 rounded-xl p-3 flex justify-between">
                <span className="text-sm text-primary-600">Total</span>
                <span className="font-bold text-secondary">
                  ${(sellModal.salePrice * (parseInt(saleForm.quantity) || 1)).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setSellModal(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button id="confirm-sale-btn" onClick={handleSell} className="flex-1 btn-primary bg-indigo-600 hover:bg-indigo-700">
                Confirmar venta
              </button>
            </div>
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
};

export default SellProductView;
