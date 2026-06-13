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
    whatsapp: "541122334455",
    rating: 4.8,
    reviews: 124,
    photo: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80",
    gallery: [],
    description: "Salón boutique especializado en estética integral y vanguardia.",
    categories: ["Peluquería", "Estética"],
    openDays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    openHours: "09:00 - 20:00",
    themeColor: "#a37c6d",
    monthlyStats: { bookings: 48, revenue: 920000, newClients: 12 },
    // Configuración de seña para confirmación de turnos
    depositConfig: {
      required: true,
      amount: 5000,           // monto fijo en ARS
      alias: 'elegance.studio',
      mpLink: '',             // link de MercadoPago (opcional)
      policy: 'La devolución de la seña queda a criterio del negocio.',
      allowDirectCancelWithout: true, // cancelación directa sin seña con +24hs
    },
    // Modal de promoción que ve el cliente al entrar al perfil del local
    promotionModal: {
      active: true,
      title: "¡20% OFF en Coloración este mes! 🎨",
      description: "Reservá tu turno de coloración completa antes del 30/06 y obtené un 20% de descuento. Cupos limitados.",
      imageUrl: "",
      cta: "Reservar ahora",
      expiresAt: "2026-06-30",
    },
    services: [
      { id: 101, category: "Peluquería", name: "Corte Clásico", duration: 45, price: 15000, recommendedProductIds: [301, 302] },
      { id: 102, category: "Peluquería", name: "Coloración Completa", duration: 120, price: 45000, recommendedProductIds: [302] },
      { id: 103, category: "Estética", name: "Limpieza Facial Profunda", duration: 60, price: 25000, recommendedProductIds: [303] },
      { id: 110, category: "Peluquería", name: "Blow Dry & Styling", duration: 30, price: 10000, recommendedProductIds: [301] },
      { id: 111, category: "Estética", name: "Tratamiento Anti-edad", duration: 75, price: 35000, recommendedProductIds: [303] },
    ],
    professionals: [
      {
        id: 201,
        name: "María González",
        role: "Estilista Principal",
        commission: 40, // % base sobre el total del servicio
        serviceCommissions: {
          102: 45, // override: 45% por Coloración Completa
          111: 42, // override: 42% por Tratamiento Anti-edad
        },
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
        serviceCommissions: {
          103: 38, // override: 38% por Limpieza Facial
        },
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
    whatsapp: "541133445566",
    rating: 4.9,
    reviews: 89,
    photo: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
    gallery: [],
    description: "Barbería clásica de nivel premium con servicio de spa para caballeros.",
    categories: ["Barbería"],
    openDays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    openHours: "10:00 - 21:00",
    themeColor: "#2c3e50",
    monthlyStats: { bookings: 62, revenue: 744000, newClients: 18 },
    depositConfig: {
      required: false,
      amount: 0,
      alias: '',
      mpLink: '',
      policy: '',
      allowDirectCancelWithout: true,
    },
    promotionModal: {
      active: false,
      title: "",
      description: "",
      imageUrl: "",
      cta: "Ver más",
      expiresAt: "",
    },
    services: [
      { id: 104, category: "Barbería", name: "Corte de Autor", duration: 45, price: 12000, recommendedProductIds: [304] },
      { id: 105, category: "Barbería", name: "Arreglo de Barba Tradicional", duration: 30, price: 8000, recommendedProductIds: [305, 306] },
      { id: 106, category: "Barbería", name: "Ritual Completo (Corte + Barba)", duration: 75, price: 18000, recommendedProductIds: [304, 305] },
      { id: 112, category: "Barbería", name: "Afeitado a Navaja", duration: 40, price: 10000, recommendedProductIds: [306] },
    ],
    professionals: [
      {
        id: 203,
        name: "Diego Russo",
        role: "Maestro Barbero",
        commission: 45,
        serviceCommissions: {
          106: 48, // override: 48% por Ritual Completo
        },
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
        serviceCommissions: {},
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
    whatsapp: "541144556677",
    rating: 4.7,
    reviews: 210,
    photo: "https://images.unsplash.com/photo-1521590832167-7bfc17484d20?auto=format&fit=crop&w=800&q=80",
    gallery: [],
    description: "Un oasis de tranquilidad en medio de la ciudad para renovar tu energía.",
    categories: ["Spa", "Uñas"],
    openDays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    openHours: "09:00 - 21:00",
    themeColor: "#7c3aed",
    monthlyStats: { bookings: 75, revenue: 1125000, newClients: 22 },
    depositConfig: {
      required: true,
      amount: 8000,
      alias: 'aura.spa.ba',
      mpLink: '',
      policy: 'La seña no es reembolsable si se cancela con menos de 48hs de anticipación.',
      allowDirectCancelWithout: true,
    },
    promotionModal: {
      active: true,
      title: "¡Combo Spa de Lunes a Miércoles! 🌿",
      description: "Reservá masaje + pedicuría y llevate un 15% de descuento. Solo válido de lunes a miércoles.",
      imageUrl: "",
      cta: "Reservar combo",
      expiresAt: "2026-07-15",
    },
    services: [
      { id: 107, category: "Spa", name: "Masaje Descontracturante", duration: 60, price: 22000, recommendedProductIds: [308] },
      { id: 108, category: "Uñas", name: "Manicuría Semipermanente", duration: 60, price: 15000, recommendedProductIds: [307, 309] },
      { id: 109, category: "Uñas", name: "Esculpidas Acrílico", duration: 120, price: 30000, recommendedProductIds: [309] },
      { id: 113, category: "Spa", name: "Piedras Calientes", duration: 90, price: 35000, recommendedProductIds: [308] },
      { id: 114, category: "Uñas", name: "Pedicuría Spa", duration: 75, price: 18000, recommendedProductIds: [307] },
    ],
    professionals: [
      {
        id: 205,
        name: "Sofía Castro",
        role: "Nail Artist",
        commission: 40,
        serviceCommissions: {
          109: 43, // override: 43% por Esculpidas Acrílico
        },
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
        serviceCommissions: {
          113: 45, // override: 45% por Piedras Calientes
        },
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
// status: 'confirmed' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
// payment: null cuando no se cobró aún
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
    discount: null,
    notes: "",
    payment: null,
    // Seña pagada y pendiente de confirmar por el admin
    deposit: { amount: 5000, paid: true, confirmedByAdmin: false, refunded: null },
    cancelRequest: null,
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
    status: "completed",
    discount: { type: 'percent', value: 10 },
    notes: "",
    payment: {
      amount: 16200, // 18000 - 10%
      method: "efectivo",
      paidAt: new Date().toISOString(),
    },
    deposit: null,
    cancelRequest: null,
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
    status: "confirmed",
    discount: null,
    notes: "Primera vez en el salón",
    payment: null,
    deposit: { amount: 5000, paid: true, confirmedByAdmin: true, refunded: null },
    // Solicitud de cancelación pendiente de resolución
    cancelRequest: { requestedAt: new Date().toISOString(), reason: 'No voy a poder ir, me surgió algo.' },
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
    discount: null,
    notes: "",
    payment: null,
    deposit: null,
    cancelRequest: null,
  },
];

// Suscripciones mock para SuperAdmin
export const initialSubscriptions = [
  {
    id: 'sub-001',
    businessId: 1,
    businessName: "L'Elegance Studio",
    plan: 'Pro',
    status: 'active',
    startDate: '2026-01-01',
    nextBillingDate: '2026-07-01',
    monthlyPrice: 29900,
  },
  {
    id: 'sub-002',
    businessId: 2,
    businessName: "Gentleman's Club Barber",
    plan: 'Pro',
    status: 'active',
    startDate: '2026-02-15',
    nextBillingDate: '2026-07-15',
    monthlyPrice: 29900,
  },
  {
    id: 'sub-003',
    businessId: 3,
    businessName: "Aura Belleza & Spa",
    plan: 'Enterprise',
    status: 'active',
    startDate: '2025-11-01',
    nextBillingDate: '2026-07-01',
    monthlyPrice: 59900,
  },
];
