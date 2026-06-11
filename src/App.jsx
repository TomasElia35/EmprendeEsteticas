import { useState } from 'react';
import { initialSalons, initialBookings } from './data/mockData';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import SalonProfileView from './views/SalonProfileView';
import DashboardView from './views/DashboardView';

function App() {
  // Global State
  const [salons] = useState(initialSalons);
  const [bookings, setBookings] = useState(initialBookings);
  
  // App Navigation State
  const [appMode, setAppMode] = useState('B2C'); // 'B2C' or 'B2B'
  const [currentView, setCurrentView] = useState('home'); // 'home', 'salonProfile'
  const [selectedSalonId, setSelectedSalonId] = useState(null);

  // Handlers
  const handleSelectSalon = (id) => {
    setSelectedSalonId(id);
    setCurrentView('salonProfile');
  };

  const handleBackToHome = () => {
    setSelectedSalonId(null);
    setCurrentView('home');
  };

  const handleAddBooking = (newBooking) => {
    setBookings((prev) => [...prev, newBooking]);
    // Optional: Show success message here
  };

  const toggleAppMode = (mode) => {
    setAppMode(mode);
    setCurrentView('home');
    setSelectedSalonId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-50 font-sans text-secondary">
      <Navbar appMode={appMode} setAppMode={toggleAppMode} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {appMode === 'B2C' && (
          <>
            {currentView === 'home' && (
              <HomeView salons={salons} onSelectSalon={handleSelectSalon} />
            )}
            {currentView === 'salonProfile' && selectedSalonId && (
              <SalonProfileView 
                salon={salons.find(s => s.id === selectedSalonId)} 
                onBack={handleBackToHome}
                onBookingComplete={handleAddBooking}
              />
            )}
          </>
        )}

        {appMode === 'B2B' && (
          <DashboardView bookings={bookings} salons={salons} />
        )}
      </main>
      
      <footer className="bg-white border-t border-primary-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-primary-600 text-sm">
          &copy; {new Date().getFullYear()} Booksy Clone. Elegancia y estilo en un solo lugar.
        </div>
      </footer>
    </div>
  );
}

export default App;
