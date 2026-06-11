import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';

const ROLE_HINTS = [
  { label: 'SuperAdmin', email: 'super@estetica.app', password: 'super123', color: 'bg-secondary text-white' },
  { label: 'Admin (Elegance)', email: 'admin@elegance.com', password: 'admin123', color: 'bg-primary-700 text-white' },
  { label: 'Admin (Gentleman)', email: 'admin@gentleman.com', password: 'admin123', color: 'bg-primary-700 text-white' },
  { label: 'Admin (Aura)', email: 'admin@aura.com', password: 'admin123', color: 'bg-primary-700 text-white' },
  { label: 'Cliente', email: 'ana@test.com', password: 'cliente123', color: 'bg-primary-500 text-white' },
];

const LoginView = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getRedirect = (role) => {
    if (from) return from;
    if (role === 'superadmin') return '/superadmin';
    if (role === 'admin') return '/admin';
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(form.email, form.password);
      if (result.success) {
        toast.success(`Bienvenido, ${result.user.name}!`);
        navigate(getRedirect(result.user.role), { replace: true });
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 600);
  };

  const fillHint = (hint) => {
    setForm({ email: hint.email, password: hint.password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-3xl">E</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary">EstéticaHub</h1>
          <p className="text-primary-600 mt-1">Iniciá sesión para continuar</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-primary-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-primary-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1.5">Contraseña</label>
              <input
                id="login-password"
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-primary-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-primary-600">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="font-semibold text-primary-800 hover:underline">
              Registrate
            </Link>
          </div>
        </div>

        {/* Quick Access Hints */}
        <div className="mt-8 bg-white/80 rounded-2xl border border-primary-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-3">Acceso rápido (demo)</p>
          <div className="flex flex-wrap gap-2">
            {ROLE_HINTS.map((h) => (
              <button
                key={h.email}
                onClick={() => fillHint(h)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80 ${h.color}`}
              >
                {h.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-primary-400 mt-2">Hacé clic en un rol para autocompletar las credenciales.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
