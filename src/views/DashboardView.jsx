import React, { useState } from 'react';

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">Panel de Control</h1>
          <p className="text-primary-600">Gestión de reservas diarias para tu negocio.</p>
        </div>
        
        <select 
          value={selectedSalonId} 
          onChange={(e) => setSelectedSalonId(Number(e.target.value))}
          className="bg-white border border-primary-300 text-secondary rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
        >
          {salons.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-primary-100 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-medium text-primary-500 uppercase tracking-wider mb-1">Turnos de Hoy</span>
          <span className="text-4xl font-bold text-secondary">{salonBookings.length}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-primary-100 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-medium text-primary-500 uppercase tracking-wider mb-1">Profesionales Activos</span>
          <span className="text-4xl font-bold text-secondary">{selectedSalon?.professionals.length || 0}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-primary-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-primary-100 bg-primary-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-secondary">Agenda del Día</h2>
          <span className="text-sm font-medium text-primary-600">{new Date().toLocaleDateString()}</span>
        </div>
        
        {salonBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-primary-500 text-xs uppercase tracking-wider border-b border-primary-100">
                  <th className="p-4 font-medium">Horario</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Servicio</th>
                  <th className="p-4 font-medium">Profesional</th>
                  <th className="p-4 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {salonBookings.sort((a, b) => a.time.localeCompare(b.time)).map((booking) => (
                  <tr key={booking.id} className="hover:bg-primary-50/50 transition-colors">
                    <td className="p-4 font-semibold text-secondary">{booking.time}</td>
                    <td className="p-4">
                      <div className="font-medium text-secondary">{booking.clientName}</div>
                      <div className="text-xs text-primary-500">{booking.clientPhone}</div>
                    </td>
                    <td className="p-4 text-primary-700">{getServiceName(booking.serviceId)}</td>
                    <td className="p-4 text-primary-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-xs font-bold text-primary-700">
                          {getProfessionalName(booking.professionalId).charAt(0)}
                        </div>
                        {getProfessionalName(booking.professionalId)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Confirmado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-primary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h3 className="text-lg font-medium text-secondary mb-1">No hay turnos para hoy</h3>
            <p className="text-primary-500">Tu agenda está libre por el momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
