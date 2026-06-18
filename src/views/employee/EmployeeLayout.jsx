import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { initialBookings } from '../../data/mockData';
import Icon from '../../components/ui/Icon';

const navItems = [
  {
    to: '/empleado',
    label: 'Dashboard',
    iconName: 'chart',
    exact: true,
  },
  {
    to: '/empleado/agenda',
    label: 'Agenda',
    iconName: 'calendar',
  },
  {
    to: '/empleado/productos',
    label: 'Vender Producto',
    iconName: 'package',
  },
  {
    to: '/empleado/facturacion',
    label: 'Facturacion del Dia',
    iconName: 'receipt',
  },
];

const EmployeeLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
    logout();
    toast.info('Sesion cerrada.');
    navigate('/login');
  };

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-primary-100 flex flex-col shadow-sm flex-shrink-0 hidden md:flex">
        {/* Brand */}
        <div className="p-6 border-b border-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center flex-shrink-0">
              <Icon name="user" className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-secondary text-sm">Panel Empleado</p>
              <p className="text-xs text-primary-400 truncate max-w-[120px]">{user?.name}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item);
            const showBadge = item.to === '/empleado/agenda' && cancelCount > 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-item${active ? ' nav-item-active' : ''} relative`}
              >
                <span className="relative flex-shrink-0">
                  <Icon
                    name={item.iconName}
                    className={`w-5 h-5 ${active ? 'text-primary-700' : 'text-primary-400'}`}
                  />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {cancelCount}
                    </span>
                  )}
                </span>
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="ml-auto badge badge-danger text-[10px] px-1.5 py-0.5">
                    {cancelCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-primary-100">
          <button
            onClick={handleLogout}
            className="btn-ghost flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-primary-600 hover:text-accent hover:bg-primary-50 transition-colors"
          >
            <Icon name="log-out" className="w-4 h-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;
