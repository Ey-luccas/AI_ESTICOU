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
  _id?: string;
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
  loadingArts: boolean;
  loadingVariations: boolean;
  refreshClients: () => Promise<void>;
  refreshArts: () => Promise<void>;
  refreshVariations: () => Promise<void>;
  addClientFromApi: (client: any) => void;
  addArt: (art: Omit<Art, 'id' | 'createdAt'>) => void;
  addVariation: (variation: Omit<Variation, 'id' | 'createdAt'>) => void;
  getArtsByClient: (clientId: string) => Art[];
  getVariationsByArt: (artId: string) => Variation[];
  getArtById: (id: string) => Art | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Dados mock removidos - agora busca do backend via API
const initialDesigners: Designer[] = [
  {
    id: '1',
    name: 'Ana Designer',
    email: 'designer@lualabs.com',
    artsCount: 5,
    clientsCount: 2,
    lastAccess: new Date('2024-11-16'),
  },
];

// Função para normalizar arte do backend
const normalizeArt = (art: any): Art => ({
  id: art._id || art.id,
  name: art.name,
  imageUrl: art.imageUrl || art.thumbnailUrl || '',
  clientId: typeof art.clientId === 'object' ? art.clientId._id : art.clientId,
  clientName:
    typeof art.clientId === 'object' ? art.clientId.name : art.clientName || '',
  designerId:
    typeof art.designerId === 'object' ? art.designerId._id : art.designerId,
  category: art.category,
  tags: art.tags || [],
  description: art.description || '',
  createdAt: new Date(art.createdAt || Date.now()),
  status: art.status || 'active',
});

// Função para normalizar variação do backend
const normalizeVariation = (variation: any): Variation => ({
  id: variation._id || variation.id,
  artId:
    typeof variation.artId === 'object' ? variation.artId._id : variation.artId,
  clientId:
    typeof variation.clientId === 'object'
      ? variation.clientId._id
      : variation.clientId,
  imageUrl: variation.imageUrl || '',
  product: variation.parameters?.newProduct,
  price: variation.parameters?.newPrice,
  text: variation.parameters?.newText,
  notes: variation.parameters?.notes,
  createdAt: new Date(variation.createdAt || Date.now()),
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const { addNotification } = useNotifications();
  const [arts, setArts] = useState<Art[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [designers] = useState<Designer[]>(initialDesigners);
  const [loadingArts, setLoadingArts] = useState(false);
  const [loadingVariations, setLoadingVariations] = useState(false);

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
    if (
      !token ||
      !user ||
      (user.role !== 'manager' && user.role !== 'designer')
    ) {
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
        const normalizedClients: Client[] = (result.data.clients || []).map(
          normalizeClient,
        );
        const existingIds = previousClientIdsRef.current;
        const newClients = normalizedClients.filter(
          (client) => !existingIds.has(client.id),
        );

        if (newClients.length > 0 && user.role === 'designer') {
          newClients.forEach((client) =>
            addNotification({
              title: 'Novo cliente disponível',
              description: `${client.name} foi cadastrado pelo gestor.`,
              category: 'client',
            }),
          );
        }

        previousClientIdsRef.current = new Set(
          normalizedClients.map((client) => client.id),
        );
        setClients(normalizedClients);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes', error);
    }
  }, [addNotification, token, user]);

  const addClientFromApi = (client: any) => {
    const normalized = normalizeClient(client);
    previousClientIdsRef.current.add(normalized.id);
    setClients((current) => [
      normalized,
      ...current.filter((item) => item.id !== normalized.id),
    ]);
  };

  // Busca artes do backend
  const refreshArts = useCallback(async () => {
    if (!token || !user) {
      setArts([]);
      return;
    }

    setLoadingArts(true);
    try {
      const response = await fetch(`${API_URL}/arts?status=active&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result?.success) {
        const normalizedArts: Art[] = (result.data.arts || []).map(
          normalizeArt,
        );
        setArts(normalizedArts);
      }
    } catch (error) {
      console.error('Erro ao carregar artes:', error);
    } finally {
      setLoadingArts(false);
    }
  }, [token, user]);

  // Busca variações do backend
  const refreshVariations = useCallback(async () => {
    if (!token || !user) {
      setVariations([]);
      return;
    }

    setLoadingVariations(true);
    try {
      const response = await fetch(`${API_URL}/variations?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result?.success) {
        const normalizedVariations: Variation[] = (
          result.data.variations || []
        ).map(normalizeVariation);
        setVariations(normalizedVariations);
      }
    } catch (error) {
      console.error('Erro ao carregar variações:', error);
    } finally {
      setLoadingVariations(false);
    }
  }, [token, user]);

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  useEffect(() => {
    refreshArts();
  }, [refreshArts]);

  useEffect(() => {
    refreshVariations();
  }, [refreshVariations]);

  useEffect(() => {
    if (!user || user.role !== 'designer') return;

    const interval = setInterval(() => {
      refreshClients();
      refreshArts();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshClients, refreshArts, user]);

  const addArt = (_art: Omit<Art, 'id' | 'createdAt'>) => {
    // Recarrega artes do backend após adicionar
    refreshArts();
  };

  const addVariation = (_variation: Omit<Variation, 'id' | 'createdAt'>) => {
    // Recarrega variações do backend após adicionar
    refreshVariations();
  };

  const getArtsByClient = (clientId: string) => {
    return arts.filter((art) => art.clientId === clientId);
  };

  const getVariationsByArt = (artId: string) => {
    return variations.filter((v) => v.artId === artId);
  };

  const getArtById = (id: string) => {
    return arts.find((art) => art.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        arts,
        variations,
        clients,
        designers,
        loadingArts,
        loadingVariations,
        refreshClients,
        refreshArts,
        refreshVariations,
        addClientFromApi,
        addArt,
        addVariation,
        getArtsByClient,
        getVariationsByArt,
        getArtById,
      }}
    >
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
