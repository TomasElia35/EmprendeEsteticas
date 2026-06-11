// =============================================================================
// MOCK DATA — Datos expandidos con CRUD completo y roles
// =============================================================================

export const initialSalons = [
  {
    id: 1,
    adminId: 'u-admin-001',
    isActive: true,
    name: "L'Elegance Studio",
    address: "Av. Libertador 1234, CABA",
    phone: "1122334455",
    email: "contacto@elegance.com",
    instagram: "@elegance.studio",
    rating: 4.8,
    reviews: 124,
    photo: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80",
    description: "Salón boutique especializado en estética integral y vanguardia.",
    categories: ["Peluquería", "Estética"],
    openDays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    openHours: "09:00 - 20:00",
    monthlyStats: { bookings: 48, revenue: 920000, newClients: 12 },
    services: [
      { id: 101, category: "Peluquería", name: "Corte Clásico", duration: 45, price: 15000 },
      { id: 102, category: "Peluquería", name: "Coloración Completa", duration: 120, price: 45000 },
      { id: 103, category: "Estética", name: "Limpieza Facial Profunda", duration: 60, price: 25000 },
      { id: 110, category: "Peluquería", name: "Blow Dry & Styling", duration: 30, price: 10000 },
      { id: 111, category: "Estética", name: "Tratamiento Anti-edad", duration: 75, price: 35000 },
    ],
    professionals: [
      {
        id: 201,
        name: "María González",
        role: "Estilista Principal",
        commission: 40,
        specialties: ["Corte", "Color", "Estética"],
        avatar: "https://ui-avatars.com/api/?name=Maria+Gonzalez&background=a37c6d&color=fff",
        schedule: {
          Lun: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"],
          Mar: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"],
          Mié: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"],
          Jue: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"],
          Vie: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"],
          Sáb: ["09:00", "10:00", "11:30"],
        }
      },
      {
        id: 202,
        name: "Lucas Torres",
        role: "Cosmiatra",
        commission: 35,
        specialties: ["Limpieza Facial", "Tratamientos"],
        avatar: "https://ui-avatars.com/api/?name=Lucas+Torres&background=a37c6d&color=fff",
        schedule: {
          Lun: ["10:00", "11:30", "14:00", "15:30"],
          Mar: ["10:00", "11:30", "14:00", "15:30"],
          Jue: ["10:00", "11:30", "14:00", "15:30"],
          Vie: ["10:00", "11:30", "14:00", "15:30"],
        }
      },
    ],
    products: [
      { id: 301, name: "Shampoo Loreal Gold", stock: 12, costPrice: 5500, salePrice: 8500, category: "Cabello" },
      { id: 302, name: "Mascarilla Nutritiva 500ml", stock: 8, costPrice: 4200, salePrice: 7000, category: "Cabello" },
      { id: 303, name: "Sérum Anti-age 30ml", stock: 5, costPrice: 9000, salePrice: 15000, category: "Facial" },
    ],
    availableSlots: ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"]
  },

  {
    id: 2,
    adminId: 'u-admin-002',
    isActive: true,
    name: "Gentleman's Club Barber",
    address: "Palermo Soho 456, CABA",
    phone: "1133445566",
    email: "contacto@gentleman.com",
    instagram: "@gentlemanclub.ba",
    rating: 4.9,
    reviews: 89,
    photo: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
    description: "Barbería clásica de nivel premium con servicio de spa para caballeros.",
    categories: ["Barbería"],
    openDays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    openHours: "10:00 - 21:00",
    monthlyStats: { bookings: 62, revenue: 744000, newClients: 18 },
    services: [
      { id: 104, category: "Barbería", name: "Corte de Autor", duration: 45, price: 12000 },
      { id: 105, category: "Barbería", name: "Arreglo de Barba Tradicional", duration: 30, price: 8000 },
      { id: 106, category: "Barbería", name: "Ritual Completo (Corte + Barba)", duration: 75, price: 18000 },
      { id: 112, category: "Barbería", name: "Afeitado a Navaja", duration: 40, price: 10000 },
    ],
    professionals: [
      {
        id: 203,
        name: "Diego Russo",
        role: "Maestro Barbero",
        commission: 45,
        specialties: ["Corte clásico", "Barba", "Afeitado"],
        avatar: "https://ui-avatars.com/api/?name=Diego+Russo&background=2c3e50&color=fff",
        schedule: {
          Lun: ["10:00", "12:00", "13:00", "16:00", "18:00", "19:30"],
          Mar: ["10:00", "12:00", "13:00", "16:00", "18:00", "19:30"],
          Mié: ["10:00", "12:00", "13:00", "16:00"],
          Jue: ["10:00", "12:00", "13:00", "16:00", "18:00", "19:30"],
          Vie: ["10:00", "12:00", "13:00", "16:00", "18:00", "19:30"],
          Sáb: ["10:00", "12:00", "13:00"],
        }
      },
      {
        id: 204,
        name: "Martín Silva",
        role: "Barbero Senior",
        commission: 38,
        specialties: ["Fade", "Diseño"],
        avatar: "https://ui-avatars.com/api/?name=Martin+Silva&background=2c3e50&color=fff",
        schedule: {
          Mar: ["10:00", "12:00", "16:00", "18:00"],
          Mié: ["10:00", "12:00", "16:00", "18:00", "19:30"],
          Jue: ["10:00", "12:00", "16:00", "18:00"],
          Vie: ["10:00", "12:00", "16:00", "18:00", "19:30"],
          Sáb: ["10:00", "12:00", "14:00", "16:00"],
        }
      }
    ],
    products: [
      { id: 304, name: "Pomada Mate Mister Pompadour", stock: 20, costPrice: 3000, salePrice: 5500, category: "Cabello" },
      { id: 305, name: "Aceite de Barba Artesanal", stock: 15, costPrice: 2500, salePrice: 4500, category: "Barba" },
      { id: 306, name: "Crema de Afeitado Premium", stock: 10, costPrice: 3500, salePrice: 6000, category: "Barba" },
    ],
    availableSlots: ["10:00", "12:00", "13:00", "16:00", "18:00", "19:30"]
  },

  {
    id: 3,
    adminId: 'u-admin-003',
    isActive: true,
    name: "Aura Belleza & Spa",
    address: "Recoleta 789, CABA",
    phone: "1144556677",
    email: "contacto@auraspa.com",
    instagram: "@aura.spa.ba",
    rating: 4.7,
    reviews: 210,
    photo: "https://images.unsplash.com/photo-1521590832167-7bfc17484d20?auto=format&fit=crop&w=800&q=80",
    description: "Un oasis de tranquilidad en medio de la ciudad para renovar tu energía.",
    categories: ["Spa", "Uñas"],
    openDays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    openHours: "09:00 - 21:00",
    monthlyStats: { bookings: 75, revenue: 1125000, newClients: 22 },
    services: [
      { id: 107, category: "Spa", name: "Masaje Descontracturante", duration: 60, price: 22000 },
      { id: 108, category: "Uñas", name: "Manicuría Semipermanente", duration: 60, price: 15000 },
      { id: 109, category: "Uñas", name: "Esculpidas Acrílico", duration: 120, price: 30000 },
      { id: 113, category: "Spa", name: "Piedras Calientes", duration: 90, price: 35000 },
      { id: 114, category: "Uñas", name: "Pedicuría Spa", duration: 75, price: 18000 },
    ],
    professionals: [
      {
        id: 205,
        name: "Sofía Castro",
        role: "Nail Artist",
        commission: 40,
        specialties: ["Semipermanente", "Acrílico", "Nail Art"],
        avatar: "https://ui-avatars.com/api/?name=Sofia+Castro&background=a37c6d&color=fff",
        schedule: {
          Lun: ["09:30", "11:00", "15:00", "16:30"],
          Mar: ["09:30", "11:00", "15:00", "16:30", "18:00"],
          Mié: ["09:30", "11:00", "15:00", "16:30", "18:00"],
          Jue: ["09:30", "11:00", "15:00", "16:30"],
          Vie: ["09:30", "11:00", "15:00", "16:30", "18:00"],
          Sáb: ["09:30", "11:00", "15:00"],
          Dom: ["10:00", "12:00"],
        }
      },
      {
        id: 206,
        name: "Laura Gómez",
        role: "Terapeuta Floral",
        commission: 42,
        specialties: ["Masajes", "Spa", "Aromaterapia"],
        avatar: "https://ui-avatars.com/api/?name=Laura+Gomez&background=a37c6d&color=fff",
        schedule: {
          Lun: ["10:00", "12:00", "14:00", "16:00"],
          Mar: ["10:00", "12:00", "14:00", "16:00", "18:00"],
          Jue: ["10:00", "12:00", "14:00", "16:00"],
          Vie: ["10:00", "12:00", "14:00", "16:00", "18:00"],
          Sáb: ["10:00", "12:00", "14:00"],
          Dom: ["10:00", "12:00", "14:00"],
        }
      }
    ],
    products: [
      { id: 307, name: "Esmalte Semipermanente (c/u)", stock: 40, costPrice: 1200, salePrice: 2500, category: "Uñas" },
      { id: 308, name: "Aceite Hidratante Corporal 200ml", stock: 18, costPrice: 3500, salePrice: 6000, category: "Spa" },
      { id: 309, name: "Kit Manicuría Completo", stock: 7, costPrice: 5000, salePrice: 9000, category: "Uñas" },
    ],
    availableSlots: ["09:30", "11:00", "15:00", "16:30", "18:00"]
  }
];

// Bookings iniciales de demostración
export const initialBookings = [
  {
    id: "b-001",
    salonId: 1,
    serviceId: 101,
    professionalId: 201,
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    clientName: "Ana García",
    clientPhone: "1155667788",
    clientEmail: "ana@test.com",
    clientId: "u-client-001",
    status: "confirmed",
    notes: "",
  },
  {
    id: "b-002",
    salonId: 2,
    serviceId: 106,
    professionalId: 203,
    date: new Date().toISOString().split('T')[0],
    time: "12:00",
    clientName: "Juan Pérez",
    clientPhone: "1166778899",
    clientEmail: "juan@test.com",
    clientId: "u-client-002",
    status: "confirmed",
    notes: "",
  },
  {
    id: "b-003",
    salonId: 1,
    serviceId: 103,
    professionalId: 202,
    date: new Date().toISOString().split('T')[0],
    time: "14:00",
    clientName: "Valentina Ruiz",
    clientPhone: "1177889900",
    clientEmail: "vale@test.com",
    clientId: null,
    status: "pending",
    notes: "Primera vez en el salón",
  },
  {
    id: "b-004",
    salonId: 3,
    serviceId: 108,
    professionalId: 205,
    date: new Date().toISOString().split('T')[0],
    time: "15:00",
    clientName: "Lucía Fernández",
    clientPhone: "1188990011",
    clientEmail: "lucia@test.com",
    clientId: null,
    status: "confirmed",
    notes: "",
  },
];
