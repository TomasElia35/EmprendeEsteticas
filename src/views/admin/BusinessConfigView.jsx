import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import { toast } from '../../components/ui/Toast';

const BusinessConfigView = () => {
  const { user } = useAuth();
  const originalSalon = initialSalons.find((s) => s.id === user?.businessId);

  const [config, setConfig] = useState({
    name: originalSalon?.name || '',
    address: originalSalon?.address || '',
    phone: originalSalon?.phone || '',
    email: originalSalon?.email || '',
    instagram: originalSalon?.instagram || '',
    whatsapp: originalSalon?.whatsapp || '',
    description: originalSalon?.description || '',
    openHours: originalSalon?.openHours || '',
    themeColor: originalSalon?.themeColor || '#a37c6d',
  });

  const [promo, setPromo] = useState({
    active: originalSalon?.promotionModal?.active || false,
    title: originalSalon?.promotionModal?.title || '',
    description: originalSalon?.promotionModal?.description || '',
    imageUrl: originalSalon?.promotionModal?.imageUrl || '',
    cta: originalSalon?.promotionModal?.cta || 'Reservar ahora',
    expiresAt: originalSalon?.promotionModal?.expiresAt || '',
  });

  const [activeSection, setActiveSection] = useState('info');

  const handleSaveInfo = () => {
    toast.success('Información del local actualizada.');
  };

  const handleSavePromo = () => {
    if (promo.active && !promo.title.trim()) {
      toast.error('El modal activo debe tener un título.');
      return;
    }
    toast.success(promo.active ? 'Modal de promoción activado.' : 'Modal de promoción desactivado.');
  };

  const sections = [
    { id: 'info', label: 'Información general' },
    { id: 'appearance', label: 'Apariencia' },
    { id: 'promo', label: 'Modal de Promoción' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Configuración del Local</h1>
          <p className="text-primary-500 text-sm mt-1">Personalizá cómo te ven tus clientes</p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {sections.map((s) => (
            <button
              key={s.id}
              id={`config-tab-${s.id}`}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === s.id ? 'bg-white shadow text-secondary' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── INFO SECTION ─────────────────────────────────────────── */}
        {activeSection === 'info' && (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-secondary">Información General</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Nombre del local</label>
                <input type="text" value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Dirección</label>
                <input type="text" value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Teléfono</label>
                <input type="tel" value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Email de contacto</label>
                <input type="email" value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Instagram</label>
                <input type="text" value={config.instagram}
                  onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                  placeholder="@tusalon"
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">WhatsApp (código + número)</label>
                <input type="text" value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="5491122334455"
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-600 mb-1">Horario de atención</label>
                <input type="text" value={config.openHours}
                  onChange={(e) => setConfig({ ...config, openHours: e.target.value })}
                  placeholder="09:00 - 20:00"
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-primary-600 mb-1">Descripción</label>
                <textarea value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  rows={3}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
              </div>
            </div>
            <button id="save-info-btn" onClick={handleSaveInfo} className="btn-primary mt-2">
              Guardar cambios
            </button>
          </div>
        )}

        {/* ── APPEARANCE SECTION ───────────────────────────────────── */}
        {activeSection === 'appearance' && (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6 space-y-6">
            <h2 className="font-bold text-secondary">Apariencia</h2>

            {/* Photo */}
            <div>
              <label className="block text-xs font-medium text-primary-600 mb-2">Foto principal</label>
              <div className="rounded-xl overflow-hidden border border-primary-100 mb-3 h-48">
                <img
                  src={originalSalon?.photo}
                  alt="Foto del local"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="URL de la imagen principal..."
                  className="flex-1 border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400"
                />
                <button className="btn-secondary text-sm">Actualizar</button>
              </div>
            </div>

            {/* Theme color */}
            <div>
              <label className="block text-xs font-medium text-primary-600 mb-2">Color del tema</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={config.themeColor}
                  onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
                  className="w-12 h-12 rounded-xl border border-primary-200 cursor-pointer p-1"
                />
                <div>
                  <p className="text-sm font-medium text-secondary">{config.themeColor}</p>
                  <div
                    className="mt-1 h-6 w-32 rounded-lg"
                    style={{ backgroundColor: config.themeColor }}
                  />
                </div>
                <div className="text-xs text-primary-400 max-w-xs">
                  Este color se usa en botones y elementos destacados en la vista del cliente.
                </div>
              </div>
            </div>

            <button id="save-appearance-btn" onClick={() => toast.success('Apariencia actualizada.')} className="btn-primary">
              Guardar cambios
            </button>
          </div>
        )}

        {/* ── PROMO MODAL SECTION ──────────────────────────────────── */}
        {activeSection === 'promo' && (
          <div className="space-y-4">
            {/* Toggle card */}
            <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-secondary">Modal de Promoción</h2>
                  <p className="text-xs text-primary-400 mt-0.5">
                    Aparece automáticamente cuando un cliente visita tu perfil (una vez por sesión)
                  </p>
                </div>
                <button
                  id="promo-toggle-btn"
                  onClick={() => setPromo({ ...promo, active: !promo.active })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    promo.active ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    promo.active ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {promo.active && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-primary-100">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-primary-600 mb-1">Título *</label>
                    <input type="text" value={promo.title}
                      onChange={(e) => setPromo({ ...promo, title: e.target.value })}
                      placeholder="Ej: ¡20% OFF este mes!"
                      className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-primary-600 mb-1">Descripción</label>
                    <textarea value={promo.description}
                      onChange={(e) => setPromo({ ...promo, description: e.target.value })}
                      rows={3}
                      placeholder="Describí la promo en detalle..."
                      className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Texto del botón CTA</label>
                    <input type="text" value={promo.cta}
                      onChange={(e) => setPromo({ ...promo, cta: e.target.value })}
                      placeholder="Ej: Reservar ahora"
                      className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-primary-600 mb-1">Válido hasta</label>
                    <input type="date" value={promo.expiresAt}
                      onChange={(e) => setPromo({ ...promo, expiresAt: e.target.value })}
                      className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-primary-600 mb-1">Imagen (URL opcional)</label>
                    <input type="text" value={promo.imageUrl}
                      onChange={(e) => setPromo({ ...promo, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {promo.active && promo.title && (
              <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6">
                <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-4">Preview del modal</h3>
                <div className="max-w-xs mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-primary-100">
                  {promo.imageUrl ? (
                    <img src={promo.imageUrl} alt="" className="w-full h-32 object-cover" />
                  ) : (
                    <div className="h-20 bg-gradient-to-br from-primary-600 to-secondary flex items-center justify-center">
                      <span className="text-3xl">🎉</span>
                    </div>
                  )}
                  <div className="p-4">
                    <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">Promoción activa</span>
                    <p className="font-bold text-secondary text-sm">{promo.title}</p>
                    <p className="text-primary-500 text-xs mt-1">{promo.description}</p>
                    {promo.expiresAt && (
                      <p className="text-xs text-primary-400 mt-1">
                        Hasta: {new Date(promo.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                      </p>
                    )}
                    <button className="mt-3 w-full bg-primary-600 text-white text-xs font-semibold py-2 rounded-xl">
                      {promo.cta || 'Reservar ahora'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button id="save-promo-btn" onClick={handleSavePromo} className="btn-primary">
              {promo.active ? 'Activar y guardar' : 'Desactivar modal'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BusinessConfigView;
