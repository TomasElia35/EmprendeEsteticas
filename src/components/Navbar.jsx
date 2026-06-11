import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from './ui/Toast';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  client: 'Cliente',
};

const ROLE_COLORS = {
  superadmin: 'bg-secondary text-white',
  admin: 'bg-primary-700 text-white',
  client: 'bg-primary-100 text-primary-800',
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
    <nav className="bg-white shadow-sm border-b border-primary-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
            E
          </div>
          <span className="text-xl font-bold text-primary-900 tracking-tight">EstéticaHub</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn() ? (
            <>
              {/* Role badge */}
              <span className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>

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
              {user.role === 'client' && (
                <div className="hidden md:flex gap-1">
                  <NavLink to="/" active={location.pathname === '/'} label="Explorar" />
                  <NavLink to="/perfil" active={isActive('/perfil')} label="Mis Turnos" />
                </div>
              )}

              {/* User menu */}
              <div className="relative">
                <button
                  id="nav-user-menu"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-primary-50 transition-colors"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-primary-200" />
                  <span className="hidden sm:block text-sm font-medium text-secondary max-w-[120px] truncate">{user.name}</span>
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-primary-100 py-1 z-20">
                      <div className="px-4 py-3 border-b border-primary-100">
                        <p className="text-sm font-semibold text-secondary truncate">{user.name}</p>
                        <p className="text-xs text-primary-500 truncate">{user.email}</p>
                      </div>
                      {user.role === 'client' && (
                        <Link
                          to="/perfil"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                        >
                          Mi perfil
                        </Link>
                      )}
                      <button
                        id="nav-logout-btn"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
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
    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-primary-100 text-primary-800' : 'text-primary-600 hover:bg-primary-50'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;
