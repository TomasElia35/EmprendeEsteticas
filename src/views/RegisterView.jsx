import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';
import Icon from '../components/ui/Icon';

const RegisterView = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      if (result.success) {
        toast.success('Cuenta creada con exito. Bienvenida/o.');
        navigate('/', { replace: true });
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 600);
  };

  const fields = [
    { name: 'name', label: 'Nombre Completo', type: 'text', placeholder: 'Ana García', id: 'reg-name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com', id: 'reg-email' },
    { name: 'phone', label: 'Celular', type: 'tel', placeholder: '11 2345 6789', id: 'reg-phone' },
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 6 caracteres', id: 'reg-password' },
    { name: 'confirm', label: 'Confirmar Contraseña', type: 'password', placeholder: 'Repetí tu contraseña', id: 'reg-confirm' },
  ];

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary rounded-2xl shadow-card mb-4">
            <Icon name="scissors" className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="page-title text-3xl">Crear cuenta</h1>
          <p className="text-sm text-primary-500 mt-1">Registrate para reservar turnos</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-modal border border-primary-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="label" htmlFor={f.id}>{f.label}</label>
                <input
                  id={f.id}
                  type={f.type}
                  name={f.name}
                  required
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="input"
                />
              </div>
            ))}

            {error && (
              <div className="flex items-start gap-3 border-l-4 border-red-400 bg-red-50 rounded-xl px-4 py-3">
                <Icon name="alert" className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 text-base font-semibold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-primary-600">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-gold-600 hover:text-gold-700 font-medium">
              Ingresá acá
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;
