import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/Toast';

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
        toast.success('¡Cuenta creada con éxito! Bienvenida/o.');
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-3xl">E</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary">Crear cuenta</h1>
          <p className="text-primary-600 mt-1">Registrate para reservar turnos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-primary-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">{f.label}</label>
                <input
                  id={f.id}
                  type={f.type}
                  name={f.name}
                  required
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full border border-primary-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
                />
              </div>
            ))}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-semibold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-primary-600">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-semibold text-primary-800 hover:underline">
              Ingresá acá
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;
