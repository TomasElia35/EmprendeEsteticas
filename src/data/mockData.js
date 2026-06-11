export const initialSalons = [
  {
    id: 1,
    name: "L'Elegance Studio",
    address: "Av. Libertador 1234, CABA",
    rating: 4.8,
    reviews: 124,
    photo: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80",
    description: "Salón boutique especializado en estética integral y vanguardia.",
    categories: ["Peluquería", "Estética"],
    services: [
      { id: 101, category: "Peluquería", name: "Corte Clásico", duration: 45, price: 15000 },
      { id: 102, category: "Peluquería", name: "Coloración Completa", duration: 120, price: 45000 },
      { id: 103, category: "Estética", name: "Limpieza Facial Profunda", duration: 60, price: 25000 },
    ],
    professionals: [
      { id: 201, name: "María González", role: "Estilista Principal", avatar: "https://ui-avatars.com/api/?name=Maria+Gonzalez&background=a37c6d&color=fff" },
      { id: 202, name: "Lucas Torres", role: "Cosmiatra", avatar: "https://ui-avatars.com/api/?name=Lucas+Torres&background=a37c6d&color=fff" },
    ],
    availableSlots: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"]
  },
  {
    id: 2,
    name: "Gentleman's Club Barber",
    address: "Palermo Soho 456, CABA",
    rating: 4.9,
    reviews: 89,
    photo: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
    description: "Barbería clásica de nivel premium con servicio de spa para caballeros.",
    categories: ["Barbería"],
    services: [
      { id: 104, category: "Barbería", name: "Corte de Autor", duration: 45, price: 12000 },
      { id: 105, category: "Barbería", name: "Arreglo de Barba Tradicional", duration: 30, price: 8000 },
      { id: 106, category: "Barbería", name: "Ritual Completo (Corte + Barba)", duration: 75, price: 18000 },
    ],
    professionals: [
      { id: 203, name: "Diego Russo", role: "Maestro Barbero", avatar: "https://ui-avatars.com/api/?name=Diego+Russo&background=2c3e50&color=fff" },
      { id: 204, name: "Martín Silva", role: "Barbero Senior", avatar: "https://ui-avatars.com/api/?name=Martin+Silva&background=2c3e50&color=fff" }
    ],
    availableSlots: ["10:00", "12:00", "13:00", "16:00", "18:00", "19:30"]
  },
  {
    id: 3,
    name: "Aura Belleza & Spa",
    address: "Recoleta 789, CABA",
    rating: 4.7,
    reviews: 210,
    photo: "https://images.unsplash.com/photo-1521590832167-7bfc17484d20?auto=format&fit=crop&w=800&q=80",
    description: "Un oasis de tranquilidad en medio de la ciudad para renovar tu energía.",
    categories: ["Spa", "Uñas"],
    services: [
      { id: 107, category: "Spa", name: "Masaje Descontracturante", duration: 60, price: 22000 },
      { id: 108, category: "Uñas", name: "Manicuría Semipermanente", duration: 60, price: 15000 },
      { id: 109, category: "Uñas", name: "Esculpidas Acrílico", duration: 120, price: 30000 },
    ],
    professionals: [
      { id: 205, name: "Sofía Castro", role: "Nail Artist", avatar: "https://ui-avatars.com/api/?name=Sofia+Castro&background=a37c6d&color=fff" },
      { id: 206, name: "Laura Gómez", role: "Terapeuta Floral", avatar: "https://ui-avatars.com/api/?name=Laura+Gomez&background=a37c6d&color=fff" }
    ],
    availableSlots: ["09:30", "11:00", "15:00", "16:30", "18:00"]
  }
];

// Initial bookings simulating existing appointments
export const initialBookings = [
  {
    id: "b-001",
    salonId: 1,
    serviceId: 101,
    professionalId: 201,
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    clientName: "Juan Pérez",
    clientPhone: "1122334455",
    status: "confirmed"
  },
  {
    id: "b-002",
    salonId: 2,
    serviceId: 106,
    professionalId: 203,
    date: new Date().toISOString().split('T')[0],
    time: "12:00",
    clientName: "Esteban Quito",
    clientPhone: "1199887766",
    status: "confirmed"
  }
];
