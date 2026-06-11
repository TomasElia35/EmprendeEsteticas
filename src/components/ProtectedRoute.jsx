import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rutas según el rol requerido.
 * Si el usuario no está logueado, redirige a /login.
 * Si no tiene el rol correcto, redirige al dashboard de su rol.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirigir al home correcto según el rol actual
    if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
