import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialSalons, initialBookings } from '../../data/mockData';
import AdminLayout from './AdminLayout';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const STATUS_COLORS = {
  confirmed: 'bg-green-100 border-green-300 text-green-800',
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  cancelled: 'bg-red-100 border-red-300 text-red-700 opacity-60',
};

const AgendaView = () => {
  const { user } = useAuth();
  const salon = initialSalons.find(s => s.id === user?.businessId);
  const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
  const allBookings = [...initialBookings, ...stored].filter(b => b.salonId === salon?.id);

  const today = new Date();
  const [selectedProfId, setSelectedProfId] = useState('all');
  const [viewDate, setViewDate] = useState(today.toISOString().split('T')[0]);

  const filteredBookings = allBookings.filter(b => {
    const matchDate = b.date === viewDate;
    const matchProf = selectedProfId === 'all' || b.professionalId === Number(selectedProfId);
    return matchDate && matchProf;
  });

  const getService = (sid) => salon?.services.find(s => s.id === sid);
  const getProf = (pid) => salon?.professionals.find(p => p.id === pid);

  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-secondary">Agenda</h1>
          <div className="flex gap-3">
            <input
              type="date"
              value={viewDate}
              onChange={e => setViewDate(e.target.value)}
              className="border border-primary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <select
              value={selectedProfId}
              onChange={e => setSelectedProfId(e.target.value)}
              className="border border-primary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="all">Todos los profesionales</option>
              {salon?.professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline view */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: '64px 1fr' }}>
            {/* Time column */}
            <div className="border-r border-primary-100">
              <div className="h-12 border-b border-primary-100" />
              {hours.map(h => (
                <div key={h} className="h-16 border-b border-primary-50 flex items-center justify-center">
                  <span className="text-xs text-primary-400 font-medium">{h}</span>
                </div>
              ))}
            </div>

            {/* Bookings column */}
            <div className="relative">
              <div className="h-12 border-b border-primary-100 flex items-center px-4">
                <span className="text-sm font-semibold text-secondary">
                  {new Date(viewDate + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="relative">
                {hours.map(h => (
                  <div key={h} className="h-16 border-b border-primary-50" />
                ))}

                {filteredBookings.map(booking => {
                  const svc = getService(booking.serviceId);
                  const prof = getProf(booking.professionalId);
                  const [hh, mm] = booking.time.split(':').map(Number);
                  const startHour = 9;
                  const topPx = ((hh - startHour) * 60 + mm) * (64 / 60);
                  const heightPx = ((svc?.duration || 60) / 60) * 64;
                  const statusColor = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;

                  return (
                    <div
                      key={booking.id}
                      className={`absolute left-2 right-2 rounded-lg border px-3 py-1.5 text-xs overflow-hidden ${statusColor}`}
                      style={{ top: `${topPx}px`, height: `${Math.max(heightPx, 32)}px` }}
                    >
                      <p className="font-bold truncate">{booking.time} — {booking.clientName}</p>
                      <p className="truncate">{svc?.name}</p>
                      {prof && <p className="truncate opacity-70">{prof.name}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* List view below */}
        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-primary-400 bg-white rounded-2xl border border-primary-100">
            Sin turnos para esta fecha
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AgendaView;
