import React, { useState } from 'react';
import SalonCard from '../components/SalonCard';
import Icon from '../components/ui/Icon';

const HomeView = ({ salons, onSelectSalon }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSalons = salons.filter(salon =>
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-700 text-white rounded-3xl py-20 px-6 flex flex-col items-center text-center shadow-modal">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Encuentra la excelencia en estética
        </h1>
        <p className="text-primary-300 text-lg md:text-xl max-w-2xl mb-10">
          Reserva turnos en los mejores salones y barberías de la ciudad con profesionales de primer nivel.
        </p>

        <div className="bg-white rounded-2xl flex items-center px-5 py-3 shadow-card gap-3 w-full max-w-lg">
          <Icon name="search" className="w-5 h-5 text-primary-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar por salón o categoría..."
            className="flex-1 bg-transparent text-secondary placeholder-primary-400 text-base focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-primary-400 hover:text-primary-600 transition-colors"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Salon grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <span className="section-label">Salones Destacados</span>
          <span className="text-sm text-primary-500 font-medium">
            {filteredSalons.length} {filteredSalons.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {filteredSalons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map(salon => (
              <SalonCard key={salon.id} salon={salon} onClick={onSelectSalon} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <Icon name="search" className="w-10 h-10 text-primary-300 mx-auto mb-4" />
            <p className="text-primary-600 text-base">No encontramos resultados para tu búsqueda.</p>
            <button
              className="btn-ghost mt-4 text-sm"
              onClick={() => setSearchTerm('')}
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeView;
