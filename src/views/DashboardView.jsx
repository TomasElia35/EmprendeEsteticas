import React, { useState } from 'react';
import Icon from '../components/ui/Icon';

const DashboardView = ({ bookings, salons }) => {
  // Para el MVP, asumimos que el administrador está viendo el primer salón
  const defaultSalonId = salons[0].id;
  const [selectedSalonId, setSelectedSalonId] = useState(defaultSalonId);

  const salonBookings = bookings.filter(b => b.salonId === selectedSalonId);
  const selectedSalon = salons.find(s => s.id === selectedSalonId);

  // Helper para obtener el nombre del servicio
  const getServiceName = (serviceId) => {
    const service = selectedSalon?.services.find(s => s.id === serviceId);
    return service ? service.name : 'Servicio Desconocido';
  };

  // Helper para obtener el nombre del profesional
  const getProfessionalName = (profId) => {
    const prof = selectedSalon?.professionals.find(p => p.id === profId);
    return prof ? prof.name : 'Profesional Desconocido';
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="page-header mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Panel de Control</h1>
          <p className="text-primary-600 mt-1">Gestión de reservas diarias para tu negocio.</p>
        </div>

        <select
          value={selectedSalonId}
          onChange={(e) => setSelectedSalonId(Number(e.target.value))}
          className="input w-auto"
        >
          {salons.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="calendar" className="w-4 h-4 text-primary-500" />
            <span className="stat-label">Turnos de Hoy</span>
          </div>
          <span className="stat-value">{salonBookings.length}</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="users" className="w-4 h-4 text-primary-500" />
            <span className="stat-label">Profesionales Activos</span>
          </div>
          <span className="stat-value">{selectedSalon?.professionals.length || 0}</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="clock" className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-secondary">Agenda del Día</h2>
          </div>
          <span className="text-sm font-medium text-primary-600">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {salonBookings.length > 0 ? (
          <div className="table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-100">
                  <th className="table-th">Horario</th>
                  <th className="table-th">Cliente</th>
                  <th className="table-th">Servicio</th>
                  <th className="table-th">Profesional</th>
                  <th className="table-th text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {salonBookings.sort((a, b) => a.time.localeCompare(b.time)).map((booking) => (
                  <tr key={booking.id} className="hover:bg-primary-50/60 transition-colors">
                    <td className="table-td font-semibold text-secondary">{booking.time}</td>
                    <td className="table-td">
                      <div className="font-medium text-secondary">{booking.clientName}</div>
                      <div className="text-xs text-primary-500 mt-0.5">{booking.clientPhone}</div>
                    </td>
                    <td className="table-td text-primary-700">{getServiceName(booking.serviceId)}</td>
                    <td className="table-td text-primary-700">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-xs font-bold text-primary-700">
                          {getProfessionalName(booking.professionalId).charAt(0)}
                        </div>
                        <span>{getProfessionalName(booking.professionalId)}</span>
                      </div>
                    </td>
                    <td className="table-td text-center">
                      <span className="badge badge-success">Confirmado</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card-body py-16 text-center">
            <div className="flex justify-center mb-4">
              <Icon name="calendar" className="w-12 h-12 text-primary-300" />
            </div>
            <h3 className="text-base font-semibold text-secondary mb-1">No hay turnos para hoy</h3>
            <p className="text-primary-500 text-sm">Tu agenda está libre por el momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
