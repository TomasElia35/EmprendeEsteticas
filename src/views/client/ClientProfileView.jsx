import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialBookings, initialSalons } from '../../data/mockData';

const STATUS_MAP = {
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
};

const ClientProfileView = () => {
  const { user } = useAuth();

  // Filtrar turnos de este cliente
  const [bookings, setBookings] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    const all = [...initialBookings, ...stored];
    return all.filter(b => b.clientEmail === user?.email || b.clientId === user?.id);
  });

  const [activeTab, setActiveTab] = useState('upcoming');
  const today = new Date().toISOString().split('T')[0];

  const upcoming = bookings.filter(b => b.date >= today && b.status !== 'cancelled');
  const past = bookings.filter(b => b.date < today || b.status === 'cancelled' || b.status === 'completed');

  const getSalon = (id) => initialSalons.find(s => s.id === id);
  const getService = (salon, sid) => salon?.services.find(s => s.id === sid);
  const getProfessional = (salon, pid) => salon?.professionals.find(p => p.id === pid);

  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  const displayList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl ring-4 ring-primary-100 shadow-md" />
        <div>
          <h1 className="text-2xl font-bold text-secondary">{user.name}</h1>
          <p className="text-primary-600 text-sm">{user.email} · {user.phone}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-primary-50 p-1 rounded-xl w-fit">
        {[
          { id: 'upcoming', label: `Próximos (${upcoming.length})` },
          { id: 'past', label: `Historial (${past.length})` },
        ].map(tab => (
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
        <div className="text-center py-16 text-primary-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium">No hay turnos en esta sección</p>
          <p className="text-sm mt-1">Explorá los salones para hacer tu primera reserva</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map(booking => {
            const salon = getSalon(booking.salonId);
            const service = getService(salon, booking.serviceId);
            const prof = getProfessional(salon, booking.professionalId);
            const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.pending;
            const isCancellable = booking.status === 'confirmed' || booking.status === 'pending';

            return (
              <div key={booking.id} className="bg-white rounded-xl border border-primary-100 shadow-sm p-5 flex gap-4 items-start">
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
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-primary-700 font-medium text-sm mt-1">{service?.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-primary-500">
                    <span>📅 {booking.date} a las {booking.time}</span>
                    {prof && <span>👤 {prof.name}</span>}
                    {service && <span>💰 ${service.price.toLocaleString()}</span>}
                  </div>
                  {booking.notes && (
                    <p className="text-xs text-primary-400 mt-2 italic">"{booking.notes}"</p>
                  )}
                </div>
                {isCancellable && activeTab === 'upcoming' && (
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="flex-shrink-0 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientProfileView;
