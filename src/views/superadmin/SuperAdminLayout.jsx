import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/ui/Icon';

const SUPER_LINKS = [
  { to: '/superadmin', label: 'Dashboard', exact: true, icon: 'chart' },
  { to: '/superadmin/emprendimientos', label: 'Emprendimientos', icon: 'building' },
  { to: '/superadmin/usuarios', label: 'Usuarios', icon: 'users' },
  { to: '/superadmin/suscripciones', label: 'Suscripciones', icon: 'credit-card' },
];

const SuperAdminLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static top-16 left-0 h-[calc(100vh-4rem)] w-56 bg-secondary text-white z-30
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/10">
          <p className="section-label text-white/50 mb-1">Modo</p>
          <div className="flex items-center gap-2">
            <Icon name="scissors" className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <p className="font-serif font-bold text-white text-base">Super Administrador</p>
          </div>
          <p className="text-xs text-white/60 mt-1 truncate">{user?.email}</p>
        </div>

        <nav className="p-3 space-y-1">
          {SUPER_LINKS.map(link => {
            const active = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to) && link.to !== '/superadmin';
            const isExact = link.exact && location.pathname === '/superadmin';
            const isActive = active || isExact;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border-l-2 ${
                  isActive
                    ? 'bg-white/20 text-white border-gold-500'
                    : 'border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon name={link.icon} className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gold-500' : ''}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-5 left-5 lg:hidden z-40 bg-secondary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
      >
        <Icon name="menu" className="w-5 h-5" />
      </button>

      <main className="flex-1 p-6 overflow-auto bg-primary-50 min-w-0">
        {children}
      </main>
    </div>
  );
};

export default SuperAdminLayout;
