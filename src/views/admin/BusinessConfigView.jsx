import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import { toast } from '../../components/ui/Toast';
import Icon from '../../components/ui/Icon';

const ToggleSwitch = ({ id, checked, onChange }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex w-12 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
      checked ? 'bg-primary-600' : 'bg-primary-200'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
);

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

  const [depositConfig, setDepositConfig] = useState({
    required: originalSalon?.depositConfig?.required || false,
    amount: originalSalon?.depositConfig?.amount || 0,
    alias: originalSalon?.depositConfig?.alias || '',
    mpLink: originalSalon?.depositConfig?.mpLink || '',
    policy: originalSalon?.depositConfig?.policy || '',
    allowDirectCancelWithout: originalSalon?.depositConfig?.allowDirectCancelWithout ?? true,
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

  const handleSaveDepositConfig = () => {
    if (depositConfig.required && !depositConfig.amount) {
      toast.error('Ingresá el monto de la seña.');
      return;
    }
    toast.success('Política de turnos guardada correctamente.');
  };

  const sections = [
    { id: 'info', label: 'Información general' },
    { id: 'appearance', label: 'Apariencia' },
    { id: 'promo', label: 'Modal de Promoción' },
    { id: 'policy', label: 'Política de turnos' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Configuración del Local</h1>
          <p className="text-primary-500 text-sm mt-1">Personalizá cómo te ven tus clientes</p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 bg-primary-100 p-1 rounded-xl w-fit flex-wrap">
          {sections.map((s) => (
            <button
              key={s.id}
              id={`config-tab-${s.id}`}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-white shadow text-secondary'
                  : 'text-primary-600 hover:text-secondary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── INFO SECTION ─────────────────────────────────────────── */}
        {activeSection === 'info' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Icon name="building" className="w-4 h-4 text-primary-500" />
                <h2 className="font-bold text-secondary">Información General</h2>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre del local</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Dirección</label>
                  <input
                    type="text"
                    value={config.address}
                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input
                    type="tel"
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email de contacto</label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Instagram</label>
                  <input
                    type="text"
                    value={config.instagram}
                    onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                    placeholder="@tusalon"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">WhatsApp (código + número)</label>
                  <input
                    type="text"
                    value={config.whatsapp}
                    onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                    placeholder="5491122334455"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Horario de atención</label>
                  <input
                    type="text"
                    value={config.openHours}
                    onChange={(e) => setConfig({ ...config, openHours: e.target.value })}
                    placeholder="09:00 - 20:00"
                    className="input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Descripción</label>
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    rows={3}
                    className="input resize-none"
                  />
                </div>
              </div>
              <button id="save-info-btn" onClick={handleSaveInfo} className="btn-primary mt-2">
                Guardar cambios
              </button>
            </div>
          </div>
        )}

        {/* ── APPEARANCE SECTION ───────────────────────────────────── */}
        {activeSection === 'appearance' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Icon name="sparkles" className="w-4 h-4 text-primary-500" />
                <h2 className="font-bold text-secondary">Apariencia</h2>
              </div>
            </div>
            <div className="card-body space-y-6">
              {/* Photo */}
              <div>
                <label className="label">Foto principal</label>
                <div className="rounded-xl overflow-hidden border border-primary-200 mb-3 h-48">
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
                    className="input flex-1"
                  />
                  <button className="btn-secondary text-sm">Actualizar</button>
                </div>
              </div>

              {/* Theme color */}
              <div>
                <label className="label">Color del tema</label>
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
                  <p className="text-xs text-primary-400 max-w-xs">
                    Este color se usa en botones y elementos destacados en la vista del cliente.
                  </p>
                </div>
              </div>

              <button
                id="save-appearance-btn"
                onClick={() => toast.success('Apariencia actualizada.')}
                className="btn-primary"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        )}

        {/* ── PROMO MODAL SECTION ──────────────────────────────────── */}
        {activeSection === 'promo' && (
          <div className="space-y-4">
            {/* Toggle card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon name="tag" className="w-4 h-4 text-primary-500" />
                      <h2 className="font-bold text-secondary">Modal de Promoción</h2>
                    </div>
                    <p className="text-xs text-primary-400 mt-0.5">
                      Aparece automáticamente cuando un cliente visita tu perfil (una vez por sesión)
                    </p>
                  </div>
                  <ToggleSwitch
                    id="promo-toggle-btn"
                    checked={promo.active}
                    onChange={() => setPromo({ ...promo, active: !promo.active })}
                  />
                </div>
              </div>

              {promo.active && (
                <div className="card-body">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-primary-100">
                    <div className="sm:col-span-2">
                      <label className="label">Título *</label>
                      <input
                        type="text"
                        value={promo.title}
                        onChange={(e) => setPromo({ ...promo, title: e.target.value })}
                        placeholder="Ej: 20% OFF este mes!"
                        className="input"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Descripción</label>
                      <textarea
                        value={promo.description}
                        onChange={(e) => setPromo({ ...promo, description: e.target.value })}
                        rows={3}
                        placeholder="Describí la promo en detalle..."
                        className="input resize-none"
                      />
                    </div>
                    <div>
                      <label className="label">Texto del botón CTA</label>
                      <input
                        type="text"
                        value={promo.cta}
                        onChange={(e) => setPromo({ ...promo, cta: e.target.value })}
                        placeholder="Ej: Reservar ahora"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Válido hasta</label>
                      <input
                        type="date"
                        value={promo.expiresAt}
                        onChange={(e) => setPromo({ ...promo, expiresAt: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Imagen (URL opcional)</label>
                      <input
                        type="text"
                        value={promo.imageUrl}
                        onChange={(e) => setPromo({ ...promo, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {promo.active && promo.title && (
              <div className="card">
                <div className="card-header">
                  <span className="section-label">Preview del modal</span>
                </div>
                <div className="card-body">
                  <div className="max-w-xs mx-auto bg-white rounded-3xl shadow-modal overflow-hidden border border-primary-100">
                    {promo.imageUrl ? (
                      <img src={promo.imageUrl} alt="" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="h-20 bg-gradient-to-br from-primary-600 to-secondary flex items-center justify-center">
                        <Icon name="sparkles" className="w-8 h-8 text-primary-200" />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="badge badge-accent mb-2 inline-block">Promoción activa</span>
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
              </div>
            )}

            <button id="save-promo-btn" onClick={handleSavePromo} className="btn-primary">
              {promo.active ? 'Activar y guardar' : 'Desactivar modal'}
            </button>
          </div>
        )}

        {/* ── POLICY SECTION ───────────────────────────────────── */}
        {activeSection === 'policy' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Icon name="receipt" className="w-4 h-4 text-primary-500" />
                <div>
                  <h2 className="font-bold text-secondary">Política de Turnos y Señas</h2>
                  <p className="text-xs text-primary-400 mt-0.5">
                    Configurá si requerís un depósito para confirmar reservas y cómo manejar las cancelaciones.
                  </p>
                </div>
              </div>
            </div>
            <div className="card-body space-y-6">
              {/* Toggle seña requerida */}
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div>
                  <p className="font-semibold text-secondary text-sm">Requerir seña para confirmar turnos</p>
                  <p className="text-xs text-primary-400 mt-0.5">
                    Si está activo, el cliente debe declarar que transferirá la seña al reservar.
                  </p>
                </div>
                <ToggleSwitch
                  id="deposit-required-toggle"
                  checked={depositConfig.required}
                  onChange={() => setDepositConfig({ ...depositConfig, required: !depositConfig.required })}
                />
              </div>

              {depositConfig.required && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="label">Monto de la seña ($)</label>
                    <input
                      id="deposit-amount-input"
                      type="number"
                      min="0"
                      value={depositConfig.amount}
                      onChange={(e) => setDepositConfig({ ...depositConfig, amount: parseFloat(e.target.value) || 0 })}
                      className="input"
                      placeholder="Ej: 5000"
                    />
                  </div>
                  <div>
                    <label className="label">Alias de transferencia</label>
                    <input
                      id="deposit-alias-input"
                      type="text"
                      value={depositConfig.alias}
                      onChange={(e) => setDepositConfig({ ...depositConfig, alias: e.target.value })}
                      className="input"
                      placeholder="Ej: misalon.cba"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Link de MercadoPago (opcional)</label>
                    <input
                      id="deposit-mp-input"
                      type="url"
                      value={depositConfig.mpLink}
                      onChange={(e) => setDepositConfig({ ...depositConfig, mpLink: e.target.value })}
                      className="input"
                      placeholder="https://mpago.la/..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Política de cancelación con seña</label>
                    <textarea
                      id="deposit-policy-input"
                      value={depositConfig.policy}
                      onChange={(e) => setDepositConfig({ ...depositConfig, policy: e.target.value })}
                      rows={2}
                      className="input resize-none"
                      placeholder="Ej: La seña no es reembolsable si se cancela con menos de 24hs..."
                    />
                    <p className="text-xs text-primary-400 mt-1">Este texto se muestra al cliente al momento de reservar.</p>
                  </div>
                </div>
              )}

              {/* Toggle cancelación directa sin seña */}
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div>
                  <p className="font-semibold text-secondary text-sm">Permitir cancelación directa sin seña (con +24hs)</p>
                  <p className="text-xs text-primary-400 mt-0.5">
                    Si está activo, los turnos sin seña pueden cancelarse automáticamente con más de 24hs de anticipación.
                  </p>
                </div>
                <ToggleSwitch
                  id="allow-direct-cancel-toggle"
                  checked={depositConfig.allowDirectCancelWithout}
                  onChange={() => setDepositConfig({ ...depositConfig, allowDirectCancelWithout: !depositConfig.allowDirectCancelWithout })}
                />
              </div>

              {/* Info box */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-xs text-primary-700">
                <div className="flex items-center gap-1.5 font-semibold mb-2">
                  <Icon name="info" className="w-4 h-4 text-primary-500" />
                  <span>Como funciona el flujo</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-primary-600">
                  <li>Con seña: el cliente debe contactar al local por WhatsApp para cancelar. También puede solicitar la cancelación desde la app y vos decidís si devolver o no la seña.</li>
                  <li>Sin seña (con +24hs): el cliente cancela directamente si está habilitado arriba.</li>
                  <li>Las solicitudes de cancelación aparecen en tu Agenda con un badge de notificación rojo.</li>
                </ul>
              </div>

              <button id="save-policy-btn" onClick={handleSaveDepositConfig} className="btn-primary">
                Guardar política de turnos
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BusinessConfigView;
