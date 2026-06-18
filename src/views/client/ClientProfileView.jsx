import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialBookings, initialSalons } from '../../data/mockData';
import { toast } from '../../components/ui/Toast';
import CancelRequestModal from '../../components/CancelRequestModal';
import Icon from '../../components/ui/Icon';

const STATUS_MAP = {
  confirmed: { label: 'Confirmado', badge: 'badge-success' },
  pending: { label: 'Pendiente', badge: 'badge-warning' },
  cancelled: { label: 'Cancelado', badge: 'badge-danger' },
  completed: { label: 'Completado', badge: 'badge-info' },
  cancel_requested: { label: 'Cancelación solicitada', badge: 'badge-warning' },
};

// Cancelación directa: sin seña y más de 24hs
const canDirectCancel = (booking) => {
  if (booking.deposit?.paid) return false; // con seña → siempre mediado
  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const diffMs = bookingDateTime - new Date();
  return diffMs > 24 * 60 * 60 * 1000;
};

// ¿Puede pedir cancelación online (con o sin seña)?
const isCancellable = (booking) =>
  booking.status === 'confirmed' || booking.status === 'pending';

const ClientProfileView = () => {
  const { user, updateUser } = useAuth();

  const [bookings, setBookings] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    const all = [...initialBookings, ...stored];
    return all.filter((b) => b.clientEmail === user?.email || b.clientId === user?.id);
  });

  const [activeTab, setActiveTab] = useState('upcoming');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
  });

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(
    (b) => b.date >= today && b.status !== 'cancelled' && b.status !== 'completed'
  );
  const past = bookings.filter(
    (b) => b.date < today || b.status === 'cancelled' || b.status === 'completed'
  );
  const displayList = activeTab === 'upcoming' ? upcoming : past;

  const getSalon = (id) => initialSalons.find((s) => s.id === id);
  const getService = (salon, sid) => salon?.services.find((s) => s.id === sid);
  const getProfessional = (salon, pid) => salon?.professionals.find((p) => p.id === pid);

  // Persiste cambios en bookings propios (solo los del localStorage)
  const persistBookings = (updated) => {
    const allStored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    const otherStored = allStored.filter(
      (b) => b.clientEmail !== user?.email && b.clientId !== user?.id
    );
    const myUpdated = updated.filter(
      (b) => !initialBookings.find((ib) => ib.id === b.id)
    );
    localStorage.setItem('estetica_bookings', JSON.stringify([...otherStored, ...myUpdated]));
  };

  // Cancelación directa (sin seña, +24hs)
  const handleDirectCancel = (bookingId) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    );
    setBookings(updated);
    persistBookings(updated);
    toast.success('Turno cancelado.');
  };

  // El cliente envía solicitud de cancelación online
  const handleSendCancelRequest = (bookingId, reason) => {
    const updated = bookings.map((b) =>
      b.id === bookingId
        ? { ...b, cancelRequest: { requestedAt: new Date().toISOString(), reason } }
        : b
    );
    setBookings(updated);
    persistBookings(updated);
    setCancelTarget(null);
    toast.success('Solicitud enviada. El local se comunicará con vos.');
  };

  const handleSaveProfile = () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error('Nombre y email son obligatorios.');
      return;
    }
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    const updates = {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name)}&background=a37c6d&color=fff&size=128`,
    };
    if (profileForm.password) updates.password = profileForm.password;
    const result = updateUser(updates);
    if (result.success) {
      toast.success('Perfil actualizado.');
      setShowEditProfile(false);
      setProfileForm({ ...profileForm, password: '', confirmPassword: '' });
    }
  };

  const getBookingStatus = (booking) => {
    if (booking.cancelRequest && booking.status !== 'cancelled') return 'cancel_requested';
    return booking.status;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-primary-100 shadow-card p-6 flex flex-wrap items-center gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-16 h-16 rounded-full ring-4 ring-primary-100 shadow-md flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-secondary tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="badge badge-neutral">Cliente</span>
            <span className="text-primary-500 text-sm flex items-center gap-1">
              <Icon name="mail" className="w-3.5 h-3.5" />
              {user.email}
            </span>
            {user.phone && (
              <span className="text-primary-500 text-sm flex items-center gap-1">
                <Icon name="phone" className="w-3.5 h-3.5" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
        <button
          id="edit-profile-btn"
          onClick={() => setShowEditProfile(!showEditProfile)}
          className="btn-secondary text-sm"
        >
          <Icon name="edit" className="w-4 h-4" />
          {showEditProfile ? 'Cancelar' : 'Editar perfil'}
        </button>
      </div>

      {/* Edit profile form */}
      {showEditProfile && (
        <div className="bg-white rounded-2xl border border-primary-100 shadow-card p-6 animate-fade-in">
          <h2 className="font-bold text-secondary mb-4">Editar mis datos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre completo *</label>
              <input
                id="profile-name-input"
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                id="profile-email-input"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input
                id="profile-phone-input"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="input"
                placeholder="11 2345 6789"
              />
            </div>
            <div>
              <label className="label">Nueva contraseña</label>
              <input
                id="profile-password-input"
                type="password"
                value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                className="input"
                placeholder="Dejar vacío para no cambiar"
              />
            </div>
            {profileForm.password && (
              <div className="sm:col-span-2">
                <label className="label">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  className="input"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowEditProfile(false)} className="btn-secondary text-sm">
              Cancelar
            </button>
            <button id="save-profile-btn" onClick={handleSaveProfile} className="btn-primary text-sm">
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-primary-100 p-1 rounded-xl w-fit">
        {[
          { id: 'upcoming', label: `Próximos (${upcoming.length})` },
          { id: 'past', label: `Historial (${past.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`client-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow text-secondary'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {displayList.length === 0 ? (
        <div className="text-center py-16 text-primary-500 bg-white rounded-2xl border border-primary-100">
          <Icon name="calendar" className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-primary-700">No hay turnos en esta sección</p>
          <p className="text-sm mt-1 text-primary-400">Explorá los salones para hacer tu primera reserva</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((booking) => {
            const salon = getSalon(booking.salonId);
            const service = getService(salon, booking.serviceId);
            const prof = getProfessional(salon, booking.professionalId);
            const statusKey = getBookingStatus(booking);
            const statusInfo = STATUS_MAP[statusKey] || STATUS_MAP.pending;
            const canCancel = isCancellable(booking) && !booking.cancelRequest;
            const directCancel = canCancel && canDirectCancel(booking);
            const hasDeposit = !!booking.deposit?.paid;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-primary-100 shadow-card p-5 flex gap-4 items-start hover:bg-primary-50/60 transition-colors"
              >
                {salon && (
                  <img
                    src={salon.photo}
                    alt={salon.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 hidden sm:block"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-secondary truncate">{salon?.name || 'Salón'}</h3>
                    <span className={`badge ${statusInfo.badge} flex-shrink-0`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-primary-700 font-medium text-sm mt-1">{service?.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-primary-500">
                    <span className="flex items-center gap-1">
                      <Icon name="calendar" className="w-3.5 h-3.5" />
                      {booking.date} a las {booking.time}
                    </span>
                    {prof && (
                      <span className="flex items-center gap-1">
                        <Icon name="user" className="w-3.5 h-3.5" />
                        {prof.name}
                      </span>
                    )}
                    {service && (
                      <span className="flex items-center gap-1">
                        <Icon name="dollar" className="w-3.5 h-3.5" />
                        ${service.price.toLocaleString('es-AR')}
                      </span>
                    )}
                    {hasDeposit && (
                      <span className="flex items-center gap-1 text-accent font-medium">
                        <Icon name="lock" className="w-3.5 h-3.5" />
                        Seña ${booking.deposit.amount.toLocaleString('es-AR')}
                        {booking.deposit.confirmedByAdmin ? (
                          <Icon name="check-circle" className="w-3.5 h-3.5 text-primary-500" />
                        ) : (
                          <span className="text-primary-400">(pendiente confirmación)</span>
                        )}
                      </span>
                    )}
                  </div>
                  {booking.notes && (
                    <p className="text-xs text-primary-400 mt-2 italic">"{booking.notes}"</p>
                  )}
                  {booking.cancelRequest && booking.status !== 'cancelled' && (
                    <p className="text-xs text-accent mt-2 font-medium flex items-center gap-1">
                      <Icon name="clock" className="w-3.5 h-3.5" />
                      Solicitud enviada — el local resolverá a la brevedad
                    </p>
                  )}
                </div>

                {/* Botón de cancelación */}
                {canCancel && activeTab === 'upcoming' && (
                  <div className="flex-shrink-0">
                    {directCancel ? (
                      // Sin seña y +24hs → cancelación directa
                      <button
                        id={`cancel-booking-${booking.id}`}
                        onClick={() => handleDirectCancel(booking.id)}
                        className="btn-danger text-xs"
                      >
                        Cancelar
                      </button>
                    ) : hasDeposit ? (
                      // Con seña → flujo mediado
                      <button
                        id={`cancel-with-deposit-${booking.id}`}
                        onClick={() => setCancelTarget(booking)}
                        className="btn-secondary text-xs"
                      >
                        Cancelar turno
                      </button>
                    ) : (
                      // Sin seña y menos de 24hs → solo WhatsApp
                      <a
                        id={`cancel-whatsapp-only-${booking.id}`}
                        href={salon?.whatsapp ? `https://wa.me/${salon.whatsapp}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Solo podés cancelar contactando al local"
                        className="btn-secondary text-xs flex items-center gap-1"
                      >
                        <Icon name="phone" className="w-3.5 h-3.5" />
                        Contactar local
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de cancelación con seña */}
      {cancelTarget && (
        <CancelRequestModal
          booking={cancelTarget}
          salon={getSalon(cancelTarget.salonId)}
          service={getService(getSalon(cancelTarget.salonId), cancelTarget.serviceId)}
          onSendRequest={handleSendCancelRequest}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
};

export default ClientProfileView;
