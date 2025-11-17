import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

export interface Art {
  id: string;
  name: string;
  imageUrl: string;
  clientId: string;
  clientName: string;
  designerId: string;
  category: 'banner' | 'story' | 'feed' | 'menu' | 'poster';
  tags: string[];
  description: string;
  createdAt: Date;
  status: 'active' | 'draft' | 'archived';
}

export interface Variation {
  id: string;
  artId: string;
  imageUrl: string;
  clientId: string;
  product?: string;
  price?: string;
  text?: string;
  notes?: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  logo?: string;
  artsCount: number;
  variationsCount: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
}

export interface Designer {
  id: string;
  name: string;
  email: string;
  artsCount: number;
  clientsCount: number;
  lastAccess: Date;
}

interface DataContextType {
  arts: Art[];
  variations: Variation[];
  clients: Client[];
  designers: Designer[];
  refreshClients: () => Promise<void>;
  addClientFromApi: (client: any) => void;
  addArt: (art: Omit<Art, 'id' | 'createdAt'>) => void;
  addVariation: (variation: Omit<Variation, 'id' | 'createdAt'>) => void;
  getArtsByClient: (clientId: string) => Art[];
  getVariationsByArt: (artId: string) => Variation[];
  getArtById: (id: string) => Art | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Mock data (frontend only)
const initialArts: Art[] = [
  {
    id: 'a1',
    name: 'Black Friday - Legging Rosa',
    imageUrl: 'https://images.unsplash.com/photo-1755357971604-e1daef52d674?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9tb3Rpb25hbCUyMGJhbm5lciUyMGZpdG5lc3N8ZW58MXx8fHwxNzYzMzEzMjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    clientId: 'c1',
    clientName: 'Fitness Studio Pro',
    designerId: '1',
    category: 'banner',
    tags: ['promoção', 'black-friday', 'fitness'],
    description: 'Banner promocional para Black Friday com destaque para legging rosa',
    createdAt: new Date('2024-11-10'),
    status: 'active'
  },
  {
    id: 'a2',
    name: 'Story - Treino Intenso',
    imageUrl: 'https://images.unsplash.com/photo-1689852501130-e89d9e54aa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0YWdyYW0lMjBzdG9yeSUyMG1vY2t1cHxlbnwxfHx8fDE3NjMzMTMyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    clientId: 'c1',
    clientName: 'Fitness Studio Pro',
    designerId: '1',
    category: 'story',
    tags: ['motivação', 'treino', 'fitness'],
    description: 'Story motivacional para Instagram',
    createdAt: new Date('2024-11-08'),
    status: 'active'
  },
  {
    id: 'a3',
    name: 'Menu Executivo',
    imageUrl: 'https://images.unsplash.com/photo-1575394331472-128c15dd26c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwbWVudSUyMGRlc2lnbnxlbnwxfHx8fDE3NjMzMTMyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    clientId: 'c2',
    clientName: 'Restaurante Sabor & Arte',
    designerId: '1',
    category: 'menu',
    tags: ['cardápio', 'restaurante', 'executivo'],
    description: 'Cardápio executivo semanal',
    createdAt: new Date('2024-11-05'),
    status: 'active'
  },
  {
    id: 'a4',
    name: 'Promoção Natal - Top Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1760411537627-a850334d4cdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGJhbm5lciUyMHRlbXBsYXRlfGVufDF8fHx8MTc2MzIzMjQ5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    clientId: 'c1',
    clientName: 'Fitness Studio Pro',
    designerId: '1',
    category: 'feed',
    tags: ['natal', 'promoção', 'top'],
    description: 'Post para feed Instagram - promoção de Natal',
    createdAt: new Date('2024-11-12'),
    status: 'active'
  },
  {
    id: 'a5',
    name: 'Poster Motivacional',
    imageUrl: 'https://images.unsplash.com/photo-1762365189058-7be5b07e038b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBwb3N0ZXIlMjBkZXNpZ258ZW58MXx8fHwxNjMzMTMyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    clientId: 'c1',
    clientName: 'Fitness Studio Pro',
    designerId: '1',
    category: 'poster',
    tags: ['motivação', 'academia'],
    description: 'Poster para academia',
    createdAt: new Date('2024-11-01'),
    status: 'active'
  }
];

const initialVariations: Variation[] = [
  {
    id: 'v1',
    artId: 'a1',
    clientId: 'c1',
    imageUrl: 'https://images.unsplash.com/photo-1755357971604-e1daef52d674?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9tb3Rpb25hbCUyMGJhbm5lciUyMGZpdG5lc3N8ZW58MXx8fHwxNzYzMzEzMjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    product: 'Top Preto Compressão',
    price: 'R$ 79,90',
    text: 'Arrase no treino!',
    createdAt: new Date('2024-11-14')
  },
  {
    id: 'v2',
    artId: 'a1',
    clientId: 'c1',
    imageUrl: 'https://images.unsplash.com/photo-1755357971604-e1daef52d674?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9tb3Rpb25hbCUyMGJhbm5lciUyMGZpdG5lc3N8ZW58MXx8fHwxNzYzMzEzMjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    product: 'Conjunto Fitness Azul',
    price: 'R$ 149,90',
    text: 'Black Friday Imperdível!',
    createdAt: new Date('2024-11-15')
  }
];

const initialDesigners: Designer[] = [
  {
    id: '1',
    name: 'Ana Designer',
    email: 'designer@lualabs.com',
    artsCount: 5,
    clientsCount: 2,
    lastAccess: new Date('2024-11-16')
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const { addNotification } = useNotifications();
  const [arts, setArts] = useState<Art[]>(initialArts);
  const [variations, setVariations] = useState<Variation[]>(initialVariations);
  const [clients, setClients] = useState<Client[]>([]);
  const [designers] = useState<Designer[]>(initialDesigners);

  const previousClientIdsRef = useRef<Set<string>>(new Set());

  const normalizeClient = (client: any): Client => ({
    id: client._id || client.id,
    name: client.name,
    email: client.email,
    logo: client.logo,
    artsCount: client.artsCount || 0,
    variationsCount: client.variationsCount || 0,
    status: (client.status || 'active') as Client['status'],
    createdAt: new Date(client.createdAt || Date.now()),
  });

  const refreshClients = useCallback(async () => {
    if (!token || !user || (user.role !== 'manager' && user.role !== 'designer')) {
      setClients([]);
      previousClientIdsRef.current = new Set();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result?.success) {
        const normalizedClients: Client[] = (result.data.clients || []).map(normalizeClient);
        const existingIds = previousClientIdsRef.current;
        const newClients = normalizedClients.filter((client) => !existingIds.has(client.id));

        if (newClients.length > 0 && user.role === 'designer') {
          newClients.forEach((client) =>
            addNotification({
              title: 'Novo cliente disponível',
              description: `${client.name} foi cadastrado pelo gestor.`,
              category: 'client',
            }),
          );
        }

        previousClientIdsRef.current = new Set(normalizedClients.map((client) => client.id));
        setClients(normalizedClients);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes', error);
    }
  }, [addNotification, token, user]);

  const addClientFromApi = (client: any) => {
    const normalized = normalizeClient(client);
    previousClientIdsRef.current.add(normalized.id);
    setClients((current) => [normalized, ...current.filter((item) => item.id !== normalized.id)]);
  };

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  useEffect(() => {
    if (!user || user.role !== 'designer') return;

    const interval = setInterval(() => {
      refreshClients();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshClients, user]);

  const addArt = (art: Omit<Art, 'id' | 'createdAt'>) => {
    const newArt: Art = {
      ...art,
      id: `a${arts.length + 1}`,
      createdAt: new Date()
    };
    setArts([newArt, ...arts]);
  };

  const addVariation = (variation: Omit<Variation, 'id' | 'createdAt'>) => {
    const newVariation: Variation = {
      ...variation,
      id: `v${variations.length + 1}`,
      createdAt: new Date()
    };
    setVariations([newVariation, ...variations]);
  };

  const getArtsByClient = (clientId: string) => {
    return arts.filter(art => art.clientId === clientId);
  };

  const getVariationsByArt = (artId: string) => {
    return variations.filter(v => v.artId === artId);
  };

  const getArtById = (id: string) => {
    return arts.find(art => art.id === id);
  };

  return (
    <DataContext.Provider value={{
      arts,
      variations,
      clients,
      designers,
      refreshClients,
      addClientFromApi,
      addArt,
      addVariation,
      getArtsByClient,
      getVariationsByArt,
      getArtById
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
