import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';
import Icon from '../components/ui/Icon';

const ROLE_HINTS = [
  { label: 'SuperAdmin', email: 'super@estetica.app', password: 'super123', color: 'bg-secondary text-white' },
  { label: 'Admin (Elegance)', email: 'admin@elegance.com', password: 'admin123', color: 'bg-primary-700 text-white' },
  { label: 'Admin (Gentleman)', email: 'admin@gentleman.com', password: 'admin123', color: 'bg-primary-700 text-white' },
  { label: 'Admin (Aura)', email: 'admin@aura.com', password: 'admin123', color: 'bg-primary-700 text-white' },
  { label: 'Empleado (Elegance)', email: 'pedro@elegance.com', password: 'emp123', color: 'bg-primary-500 text-white' },
  { label: 'Empleado (Gentleman)', email: 'camila@gentleman.com', password: 'emp123', color: 'bg-primary-500 text-white' },
  { label: 'Cliente', email: 'ana@test.com', password: 'cliente123', color: 'bg-primary-400 text-white' },
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
    if (role === 'employee') return '/empleado';
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
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary rounded-2xl shadow-card mb-4">
            <Icon name="scissors" className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="page-title text-3xl">EstéticaHub</h1>
          <p className="text-sm text-primary-500 mt-1">Iniciá sesión para continuar</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-modal border border-primary-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 border-l-4 border-red-400 bg-red-50 rounded-xl px-4 py-3">
                <Icon name="alert" className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-primary-600">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-gold-600 hover:text-gold-700 font-medium">
              Registrate
            </Link>
          </div>
        </div>

        {/* Quick Access Hints */}
        <div className="mt-6 bg-white rounded-2xl border border-primary-100 shadow-card p-5">
          <p className="section-label mb-3">Acceso rápido (demo)</p>
          <div className="flex flex-wrap gap-2">
            {ROLE_HINTS.map((h) => (
              <button
                key={h.email}
                onClick={() => fillHint(h)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-opacity hover:opacity-80 ${h.color}`}
              >
                {h.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-primary-400 mt-3">Hacé clic en un rol para autocompletar las credenciales.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
