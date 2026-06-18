import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initialBookings } from '../../data/mockData';
import Icon from '../../components/ui/Icon';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Agenda', iconName: 'calendar', exact: true },
  { to: '/admin/servicios', label: 'Servicios', iconName: 'scissors' },
  { to: '/admin/personal', label: 'Personal', iconName: 'users' },
  { to: '/admin/productos', label: 'Productos', iconName: 'package' },
  { to: '/admin/reportes', label: 'Reportes', iconName: 'chart' },
  { to: '/admin/configuracion', label: 'Configuración', iconName: 'settings' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Contar solicitudes de cancelación pendientes
  const cancelCount = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
      const all = [...initialBookings, ...stored];
      return all.filter(
        (b) => b.salonId === user?.businessId && b.cancelRequest && b.status !== 'cancelled' && b.status !== 'completed'
      ).length;
    } catch { return 0; }
  })();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-primary-100 shadow-card z-30
        flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo / Salon name area */}
        <div className="px-6 py-6 border-b border-primary-100 flex-shrink-0">
          <p className="text-lg font-bold text-secondary tracking-tight truncate">
            {user?.businessName || 'Mi Salón'}
          </p>
          <p className="text-xs text-primary-400 font-medium mt-0.5 tracking-wide">
            Panel de Administración
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="section-label px-2 mb-3">Menú principal</p>
          {ADMIN_LINKS.map(link => {
            const active = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to) && link.to !== '/admin';
            const isAdminExact = link.exact && location.pathname === '/admin';
            const isActive = active || isAdminExact;
            const showBadge = link.to === '/admin' && cancelCount > 0;

            return (
              <Link
                key={link.to}
                to={link.to}
                id={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? 'nav-item-active' : ''} relative`}
              >
                <Icon name={link.iconName} className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{link.label}</span>
                {showBadge && (
                  <span className="badge badge-danger text-[10px] px-1.5 py-0.5 min-w-[1.25rem] text-center">
                    {cancelCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout */}
        <div className="px-4 py-4 border-t border-primary-100 flex-shrink-0">
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="nav-item w-full text-left text-primary-500 hover:text-accent"
          >
            <Icon name="log-out" className="w-4 h-4 flex-shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        id="btn-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-5 left-5 lg:hidden z-40 bg-primary-700 text-white w-12 h-12 rounded-full shadow-card flex items-center justify-center hover:bg-primary-800 transition-colors"
      >
        <Icon name="menu" className="w-5 h-5" />
      </button>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-8 overflow-auto min-w-0 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
