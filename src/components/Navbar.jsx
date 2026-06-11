import React from 'react';

const Navbar = ({ appMode, setAppMode }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-primary-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppMode('B2C')}>
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold text-xl">
            E
          </div>
          <span className="text-xl font-bold text-primary-900 tracking-tight">EstéticaHub</span>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setAppMode('B2C')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              appMode === 'B2C' 
                ? 'bg-primary-100 text-primary-800' 
                : 'text-primary-600 hover:bg-primary-50'
            }`}
          >
            Portal Clientes
          </button>
          <button 
            onClick={() => setAppMode('B2B')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              appMode === 'B2B' 
                ? 'bg-secondary text-white' 
                : 'text-primary-600 hover:bg-primary-50'
            }`}
          >
            Gestión Negocio
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
