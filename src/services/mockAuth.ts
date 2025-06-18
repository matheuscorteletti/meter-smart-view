
// Mock authentication service for development/testing
export interface MockUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  buildingId?: number;
  unitId?: number;
}

const mockUsers: MockUser[] = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@demo.com',
    role: 'admin'
  },
  {
    id: 2,
    name: 'Usuário Demo',
    email: 'user@demo.com',
    role: 'user',
    buildingId: 1,
    unitId: 101
  },
  {
    id: 3,
    name: 'Visualizador Demo',
    email: 'viewer@demo.com',
    role: 'viewer',
    buildingId: 1
  }
];

export const mockLogin = async (email: string, password: string): Promise<{ token: string; user: MockUser }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = mockUsers.find(u => u.email === email);
  
  if (!user || password !== 'demo123') {
    throw new Error('Email ou senha incorretos');
  }
  
  // Generate a mock JWT token
  const mockToken = btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  
  return {
    token: mockToken,
    user
  };
};

export const mockGetProfile = async (token: string): Promise<MockUser> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp < Date.now()) {
      throw new Error('Token expirado');
    }
    
    const user = mockUsers.find(u => u.id === decoded.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return user;
  } catch (error) {
    throw new Error('Token inválido');
  }
};
