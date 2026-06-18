import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from './ui/Toast';
import Icon from './ui/Icon';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  employee: 'Empleado',
  client: 'Cliente',
};

const ROLE_BADGE_CLASSES = {
  superadmin: 'badge badge-neutral',
  admin: 'badge badge-accent',
  employee: 'badge badge-info',
  client: 'badge badge-success',
};

const Navbar = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('Sesión cerrada.');
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white border-b border-primary-100 shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center shadow-sm">
            <Icon name="sparkles" className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-secondary tracking-tight">EstéticaHub</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn() ? (
            <>
              {/* Navigation links by role */}
              {user.role === 'superadmin' && (
                <div className="hidden md:flex gap-1">
                  <NavLink to="/superadmin" active={isActive('/superadmin')} label="Dashboard" />
                </div>
              )}
              {user.role === 'admin' && (
                <div className="hidden md:flex gap-1">
                  <NavLink to="/admin" active={isActive('/admin')} label="Dashboard" />
                </div>
              )}
              {user.role === 'employee' && (
                <div className="hidden md:flex gap-1">
                  <NavLink to="/empleado" active={isActive('/empleado')} label="Mi Panel" />
                </div>
              )}
              {user.role === 'client' && (
                <div className="hidden md:flex gap-1">
                  <NavLink to="/" active={location.pathname === '/'} label="Explorar" />
                  <NavLink to="/perfil" active={isActive('/perfil')} label="Mis Turnos" />
                </div>
              )}

              {/* Role badge */}
              <span className={`hidden sm:inline-flex ${ROLE_BADGE_CLASSES[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>

              {/* User menu */}
              <div className="relative">
                <button
                  id="nav-user-menu"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full ring-2 ring-primary-200 object-cover"
                  />
                  <span className="hidden sm:block text-sm font-medium text-secondary max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <Icon name="chevron-down" className="w-3.5 h-3.5 text-primary-400" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-primary-100 py-1 z-20 animate-fade-in">
                      <div className="px-4 py-3 border-b border-primary-100">
                        <p className="text-sm font-semibold text-secondary truncate">{user.name}</p>
                        <p className="text-xs text-primary-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      {user.role === 'client' && (
                        <Link
                          to="/perfil"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-600 hover:text-secondary hover:bg-primary-50 transition-colors"
                        >
                          <Icon name="user" className="w-4 h-4 text-primary-400" />
                          Mi perfil
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/configuracion"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-600 hover:text-secondary hover:bg-primary-50 transition-colors"
                        >
                          <Icon name="settings" className="w-4 h-4 text-primary-400" />
                          Configurar mi local
                        </Link>
                      )}

                      <div className="border-t border-primary-100 mt-1 pt-1">
                        <button
                          id="nav-logout-btn"
                          onClick={handleLogout}
                          className="btn-ghost w-full flex items-center gap-2.5 px-4 py-2.5 text-sm justify-start text-primary-600 hover:text-secondary"
                        >
                          <Icon name="log-out" className="w-4 h-4 text-primary-400" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-sm py-2 px-4">Ingresar</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, active, label }) => (
  <Link
    to={to}
    className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
      active
        ? 'bg-primary-100 text-primary-800'
        : 'text-primary-600 hover:text-secondary hover:bg-primary-50'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;
