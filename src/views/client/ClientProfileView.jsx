import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialBookings, initialSalons } from '../../data/mockData';
import { toast } from '../../components/ui/Toast';
import CancelRequestModal from '../../components/CancelRequestModal';

const STATUS_MAP = {
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
  cancel_requested: { label: 'Cancelación solicitada', color: 'bg-amber-100 text-amber-700' },
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
  const [cancelTarget, setCancelTarget] = useState(null); // booking a cancelar
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
      {/* Header */}
      <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6 flex flex-wrap items-center gap-4">
        <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl ring-4 ring-primary-100 shadow-md" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-secondary">{user.name}</h1>
          <p className="text-primary-600 text-sm">{user.email} · {user.phone || 'Sin teléfono'}</p>
        </div>
        <button
          id="edit-profile-btn"
          onClick={() => setShowEditProfile(!showEditProfile)}
          className="btn-secondary text-sm"
        >
          {showEditProfile ? 'Cancelar' : 'Editar perfil'}
        </button>
      </div>

      {/* Edit profile form */}
      {showEditProfile && (
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-6 animate-fade-in">
          <h2 className="font-bold text-secondary mb-4">Editar mis datos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-primary-600 mb-1">Nombre completo *</label>
              <input id="profile-name-input" type="text" value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-600 mb-1">Email *</label>
              <input id="profile-email-input" type="email" value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-600 mb-1">Teléfono</label>
              <input id="profile-phone-input" type="tel" value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="11 2345 6789" />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-600 mb-1">Nueva contraseña</label>
              <input id="profile-password-input" type="password" value={profileForm.password}
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Dejar vacío para no cambiar" />
            </div>
            {profileForm.password && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-primary-600 mb-1">Confirmar nueva contraseña</label>
                <input type="password" value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setShowEditProfile(false)} className="btn-secondary text-sm">Cancelar</button>
            <button id="save-profile-btn" onClick={handleSaveProfile} className="btn-primary text-sm">
              Guardar cambios
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-primary-50 p-1 rounded-xl w-fit">
        {[
          { id: 'upcoming', label: `Próximos (${upcoming.length})` },
          { id: 'past', label: `Historial (${past.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`client-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white shadow text-secondary' : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {displayList.length === 0 ? (
        <div className="text-center py-16 text-primary-500 bg-white rounded-2xl border border-primary-100">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium">No hay turnos en esta sección</p>
          <p className="text-sm mt-1">Explorá los salones para hacer tu primera reserva</p>
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
              <div key={booking.id} className="bg-white rounded-xl border border-primary-100 shadow-sm p-5 flex gap-4 items-start">
                {salon && (
                  <img src={salon.photo} alt={salon.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 hidden sm:block" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-secondary truncate">{salon?.name || 'Salón'}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-primary-700 font-medium text-sm mt-1">{service?.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-primary-500">
                    <span>📅 {booking.date} a las {booking.time}</span>
                    {prof && <span>👤 {prof.name}</span>}
                    {service && <span>💰 ${service.price.toLocaleString('es-AR')}</span>}
                    {hasDeposit && (
                      <span className="text-amber-600 font-medium">
                        🔒 Seña ${booking.deposit.amount.toLocaleString('es-AR')}
                        {booking.deposit.confirmedByAdmin ? ' ✓' : ' (pendiente confirmación)'}
                      </span>
                    )}
                  </div>
                  {booking.notes && (
                    <p className="text-xs text-primary-400 mt-2 italic">"{booking.notes}"</p>
                  )}
                  {booking.cancelRequest && booking.status !== 'cancelled' && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      ⏳ Solicitud enviada — el local resolverá a la brevedad
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
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border text-red-500 border-red-200 hover:border-red-300 hover:text-red-700 cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                    ) : hasDeposit ? (
                      // Con seña → flujo mediado
                      <button
                        id={`cancel-with-deposit-${booking.id}`}
                        onClick={() => setCancelTarget(booking)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border text-amber-600 border-amber-200 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-colors"
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
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border text-green-600 border-green-200 hover:bg-green-50 transition-colors"
                      >
                        💬 Contactar local
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
