import React, { useState } from 'react';
import SalonCard from '../components/SalonCard';

const HomeView = ({ salons, onSelectSalon }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSalons = salons.filter(salon => 
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="bg-primary-900 text-white rounded-2xl p-8 md:p-12 shadow-xl flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Encuentra la excelencia en estética</h1>
        <p className="text-primary-200 text-lg md:text-xl max-w-2xl mb-8">
          Reserva turnos en los mejores salones y barberías de la ciudad con profesionales de primer nivel.
        </p>
        
        <div className="w-full max-w-xl relative">
          <input 
            type="text" 
            placeholder="Buscar por salón o categoría..." 
            className="w-full px-6 py-4 rounded-full text-secondary focus:outline-none focus:ring-4 focus:ring-primary-500/50 shadow-lg text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-2 top-2 bottom-2 bg-primary-600 hover:bg-primary-700 text-white px-6 rounded-full font-medium transition-colors">
            Buscar
          </button>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-secondary">Salones Destacados</h2>
          <span className="text-primary-600 font-medium text-sm">{filteredSalons.length} resultados</span>
        </div>
        
        {filteredSalons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSalons.map(salon => (
              <SalonCard key={salon.id} salon={salon} onClick={onSelectSalon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-primary-200">
            <p className="text-primary-600 text-lg">No encontramos resultados para tu búsqueda.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeView;
