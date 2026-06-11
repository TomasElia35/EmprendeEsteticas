import { createContext, useContext, useState, useEffect } from 'react';
import { findUser, findUserById, ROLES } from '../data/mockUsers';

const AuthContext = createContext(null);

const SESSION_KEY = 'estetica_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage al recargar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = findUserById(parsed.id);
        if (found) setUser(found);
      }
    } catch (_) {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email, password) => {
    const found = findUser(email, password);
    if (!found) return { success: false, error: 'Credenciales incorrectas.' };
    setUser(found);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: found.id }));
    return { success: true, user: found };
  };

  // Registro de nuevos clientes (se guarda en sessionStorage como simulación)
  const register = ({ name, email, password, phone }) => {
    const exists = findUser(email, password);
    if (exists) return { success: false, error: 'El email ya está registrado.' };

    const newUser = {
      id: `u-client-${Date.now()}`,
      role: ROLES.CLIENT,
      name,
      email,
      password,
      phone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=a37c6d&color=fff&size=128`,
      favoriteBusinessId: null,
      favoriteProfessionalId: null,
    };

    // Guardar en localStorage para persistir en esta sesión de prototipo
    const stored = JSON.parse(localStorage.getItem('estetica_registered_clients') || '[]');
    stored.push(newUser);
    localStorage.setItem('estetica_registered_clients', JSON.stringify(stored));

    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: newUser.id, isRegistered: true }));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const isSuperAdmin = () => user?.role === ROLES.SUPERADMIN;
  const isAdmin = () => user?.role === ROLES.ADMIN;
  const isClient = () => user?.role === ROLES.CLIENT;
  const isLoggedIn = () => !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isSuperAdmin, isAdmin, isClient, isLoggedIn }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
