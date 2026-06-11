import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initialSalons, initialBookings } from './data/mockData';

// Layout
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ui/Toast';

// Public views
import HomeView from './views/HomeView';
import SalonProfileView from './views/SalonProfileView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';

// Client views
import ClientProfileView from './views/client/ClientProfileView';

// Admin views
import AdminDashboard from './views/admin/AdminDashboard';
import AgendaView from './views/admin/AgendaView';
import ServicesView from './views/admin/ServicesView';
import ProfessionalsView from './views/admin/ProfessionalsView';
import ProductsView from './views/admin/ProductsView';
import ReportsView from './views/admin/ReportsView';

// SuperAdmin views
import SuperDashboard from './views/superadmin/SuperDashboard';
import BusinessesView from './views/superadmin/BusinessesView';
import UsersView from './views/superadmin/UsersView';

// App-level state wrapper (needed so HomeView/SalonProfile can share bookings)
function AppRoutes() {
  const [salons] = useState(initialSalons);
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedSalonId, setSelectedSalonId] = useState(null);

  const handleAddBooking = (newBooking) => {
    setBookings(prev => [...prev, newBooking]);
    // Persist to localStorage so ClientProfileView can read it
    const stored = JSON.parse(localStorage.getItem('estetica_bookings') || '[]');
    stored.push(newBooking);
    localStorage.setItem('estetica_bookings', JSON.stringify(stored));
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-50 font-sans text-secondary">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* ── PUBLIC ─────────────────────────────────────────── */}
          <Route
            path="/"
            element={
              <div className="container mx-auto px-4 py-8">
                {selectedSalonId ? (
                  <SalonProfileView
                    salon={salons.find(s => s.id === selectedSalonId)}
                    onBack={() => setSelectedSalonId(null)}
                    onBookingComplete={(b) => { handleAddBooking(b); setSelectedSalonId(null); }}
                  />
                ) : (
                  <HomeView salons={salons} onSelectSalon={setSelectedSalonId} />
                )}
              </div>
            }
          />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />

          {/* ── CLIENT ─────────────────────────────────────────── */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <div className="container mx-auto px-4 py-8">
                  <ClientProfileView />
                </div>
              </ProtectedRoute>
            }
          />

          {/* ── ADMIN ──────────────────────────────────────────── */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/agenda" element={<ProtectedRoute allowedRoles={['admin']}><AgendaView /></ProtectedRoute>} />
          <Route path="/admin/servicios" element={<ProtectedRoute allowedRoles={['admin']}><ServicesView /></ProtectedRoute>} />
          <Route path="/admin/personal" element={<ProtectedRoute allowedRoles={['admin']}><ProfessionalsView /></ProtectedRoute>} />
          <Route path="/admin/productos" element={<ProtectedRoute allowedRoles={['admin']}><ProductsView /></ProtectedRoute>} />
          <Route path="/admin/reportes" element={<ProtectedRoute allowedRoles={['admin']}><ReportsView /></ProtectedRoute>} />

          {/* ── SUPERADMIN ─────────────────────────────────────── */}
          <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperDashboard /></ProtectedRoute>} />
          <Route path="/superadmin/emprendimientos" element={<ProtectedRoute allowedRoles={['superadmin']}><BusinessesView /></ProtectedRoute>} />
          <Route path="/superadmin/usuarios" element={<ProtectedRoute allowedRoles={['superadmin']}><UsersView /></ProtectedRoute>} />

          {/* ── FALLBACK ───────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-primary-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-primary-600 text-sm">
          &copy; {new Date().getFullYear()} EstéticaHub &mdash; Elegancia y estilo en un solo lugar.
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
