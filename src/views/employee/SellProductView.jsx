import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import EmployeeLayout from './EmployeeLayout';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

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

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="badge badge-danger">Sin stock</span>;
    if (stock <= 3) return <span className="badge badge-warning">Stock bajo</span>;
    return <span className="badge badge-success">En stock</span>;
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="text-2xl font-bold text-secondary tracking-tight">Vender Producto</h1>
            <p className="text-primary-500 text-sm mt-1">Stock de {salon?.name}</p>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-secondary text-sm leading-tight truncate">{p.name}</h3>
                  <span className="inline-block mt-1 text-xs text-primary-500 bg-primary-100 px-2 py-0.5 rounded-full">
                    {p.category}
                  </span>
                </div>
                <div className="ml-2 flex-shrink-0">
                  {getStockBadge(p.stock)}
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary-400 flex items-center gap-1">
                    <Icon name="tag" className="w-3.5 h-3.5" />
                    Precio venta
                  </span>
                  <span className="font-bold text-accent text-base">${p.salePrice.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary-400 flex items-center gap-1">
                    <Icon name="package" className="w-3.5 h-3.5" />
                    Stock disponible
                  </span>
                  <span className="font-semibold text-secondary">{p.stock} unidades</span>
                </div>
              </div>

              <button
                id={`sell-product-${p.id}`}
                onClick={() => { setSellModal(p); setSaleForm({ clientName: '', quantity: 1 }); }}
                disabled={p.stock === 0}
                className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                  p.stock === 0
                    ? 'bg-primary-100 text-primary-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {p.stock === 0 ? 'Sin stock' : 'Vender'}
              </button>
            </div>
          ))}
        </div>

        {/* Ventas del dia */}
        {sales.length > 0 && (
          <div className="card overflow-hidden">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Icon name="receipt" className="w-4 h-4 text-primary-500" />
                <h2 className="font-bold text-secondary">Ventas registradas hoy</h2>
              </div>
            </div>
            <ul className="divide-y divide-primary-100">
              {sales
                .filter((s) => s.date === new Date().toISOString().split('T')[0])
                .map((sale) => (
                  <li key={sale.id} className="px-6 py-3 flex items-center justify-between hover:bg-primary-50/60 transition-colors">
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
          <div className="relative bg-white rounded-3xl shadow-modal w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-secondary">Registrar venta</h2>
              <button onClick={() => setSellModal(null)} className="btn-ghost p-1 rounded-lg">
                <Icon name="x" className="w-5 h-5 text-primary-400" />
              </button>
            </div>
            <p className="text-sm text-primary-400 mb-5 flex items-center gap-1">
              <Icon name="package" className="w-4 h-4" />
              {sellModal.name} · <span className="text-accent font-semibold">${sellModal.salePrice.toLocaleString('es-AR')}</span> c/u
            </p>

            <div className="space-y-4">
              <div>
                <label className="label">Cliente *</label>
                <input
                  type="text"
                  value={saleForm.clientName}
                  onChange={(e) => setSaleForm({ ...saleForm, clientName: e.target.value })}
                  className="input"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="label">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  max={sellModal.stock}
                  value={saleForm.quantity}
                  onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                  className="input"
                />
              </div>
              <div className="bg-primary-50 rounded-xl p-3 flex justify-between items-center border border-primary-100">
                <span className="text-sm text-primary-600 font-medium">Total</span>
                <span className="font-bold text-secondary text-lg">
                  ${(sellModal.salePrice * (parseInt(saleForm.quantity) || 1)).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setSellModal(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button id="confirm-sale-btn" onClick={handleSell} className="flex-1 btn-primary">
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
