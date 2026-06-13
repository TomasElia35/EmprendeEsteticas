// =============================================================================
// MOCK USERS — Credenciales hardcodeadas para prototipado rápido
// =============================================================================

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  CLIENT: 'client',
};

export const mockUsers = [
  // ── SUPERADMIN ─────────────────────────────────────────────────────────────
  {
    id: 'u-super-001',
    role: ROLES.SUPERADMIN,
    name: 'Tomas Elia',
    email: 'super@estetica.app',
    password: 'super123',
    phone: '1100000000',
    avatar: 'https://ui-avatars.com/api/?name=Tomas+Elia&background=2c3e50&color=fff&size=128',
  },

  // ── ADMINS ─────────────────────────────────────────────────────────────────
  {
    id: 'u-admin-001',
    role: ROLES.ADMIN,
    name: 'Carolina Vidal',
    email: 'admin@elegance.com',
    password: 'admin123',
    phone: '1122334455',
    avatar: 'https://ui-avatars.com/api/?name=Carolina+Vidal&background=a37c6d&color=fff&size=128',
    businessId: 1,
  },
  {
    id: 'u-admin-002',
    role: ROLES.ADMIN,
    name: 'Roberto Suárez',
    email: 'admin@gentleman.com',
    password: 'admin123',
    phone: '1133445566',
    avatar: 'https://ui-avatars.com/api/?name=Roberto+Suarez&background=a37c6d&color=fff&size=128',
    businessId: 2,
  },
  {
    id: 'u-admin-003',
    role: ROLES.ADMIN,
    name: 'Patricia Méndez',
    email: 'admin@aura.com',
    password: 'admin123',
    phone: '1144556677',
    avatar: 'https://ui-avatars.com/api/?name=Patricia+Mendez&background=a37c6d&color=fff&size=128',
    businessId: 3,
  },

  // ── EMPLEADOS ──────────────────────────────────────────────────────────────
  {
    id: 'u-emp-001',
    role: ROLES.EMPLOYEE,
    name: 'Pedro López',
    email: 'pedro@elegance.com',
    password: 'emp123',
    phone: '1155001122',
    avatar: 'https://ui-avatars.com/api/?name=Pedro+Lopez&background=6366f1&color=fff&size=128',
    businessId: 1, // L'Elegance Studio
  },
  {
    id: 'u-emp-002',
    role: ROLES.EMPLOYEE,
    name: 'Camila Rivas',
    email: 'camila@gentleman.com',
    password: 'emp123',
    phone: '1155003344',
    avatar: 'https://ui-avatars.com/api/?name=Camila+Rivas&background=6366f1&color=fff&size=128',
    businessId: 2, // Gentleman's Club
  },

  // ── CLIENTES ───────────────────────────────────────────────────────────────
  {
    id: 'u-client-001',
    role: ROLES.CLIENT,
    name: 'Ana García',
    email: 'ana@test.com',
    password: 'cliente123',
    phone: '1155667788',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=a37c6d&color=fff&size=128',
    favoriteBusinessId: 1,
    favoriteProfessionalId: 201,
  },
  {
    id: 'u-client-002',
    role: ROLES.CLIENT,
    name: 'Juan Pérez',
    email: 'juan@test.com',
    password: 'cliente123',
    phone: '1166778899',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Perez&background=2c3e50&color=fff&size=128',
    favoriteBusinessId: 2,
    favoriteProfessionalId: 203,
  },
];

// Helper para buscar usuario por email/password (simula autenticación)
// También busca en clientes registrados dinámicamente (localStorage)
export const findUser = (email, password) => {
  const staticUser = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (staticUser) return staticUser;

  // Buscar en clientes registrados dinámicamente
  try {
    const stored = JSON.parse(localStorage.getItem('estetica_registered_clients') || '[]');
    return stored.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    ) || null;
  } catch {
    return null;
  }
};

// Helper para buscar usuario por ID
export const findUserById = (id) => {
  const staticUser = mockUsers.find((u) => u.id === id);
  if (staticUser) return staticUser;

  // Buscar en clientes registrados dinámicamente
  try {
    const stored = JSON.parse(localStorage.getItem('estetica_registered_clients') || '[]');
    return stored.find((u) => u.id === id) || null;
  } catch {
    return null;
  }
};
