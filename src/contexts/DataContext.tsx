import React, { createContext, useContext, useState } from 'react';

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
  logo?: string;
  artsCount: number;
  variationsCount: number;
  status: 'active' | 'inactive';
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
  addArt: (art: Omit<Art, 'id' | 'createdAt'>) => void;
  addVariation: (variation: Omit<Variation, 'id' | 'createdAt'>) => void;
  getArtsByClient: (clientId: string) => Art[];
  getVariationsByArt: (artId: string) => Variation[];
  getArtById: (id: string) => Art | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
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

const initialClients: Client[] = [
  {
    id: 'c1',
    name: 'Fitness Studio Pro',
    logo: 'https://i.pravatar.cc/150?img=2',
    artsCount: 4,
    variationsCount: 12,
    status: 'active',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'c2',
    name: 'Restaurante Sabor & Arte',
    logo: 'https://i.pravatar.cc/150?img=4',
    artsCount: 1,
    variationsCount: 5,
    status: 'active',
    createdAt: new Date('2024-02-20')
  },
  {
    id: 'c3',
    name: 'Loja Fashion Trends',
    logo: 'https://i.pravatar.cc/150?img=5',
    artsCount: 0,
    variationsCount: 0,
    status: 'active',
    createdAt: new Date('2024-03-10')
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
  const [arts, setArts] = useState<Art[]>(initialArts);
  const [variations, setVariations] = useState<Variation[]>(initialVariations);
  const [clients] = useState<Client[]>(initialClients);
  const [designers] = useState<Designer[]>(initialDesigners);

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
