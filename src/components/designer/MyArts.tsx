import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Search, Eye, Copy, Archive } from 'lucide-react';

export default function MyArts() {
  const { arts, clients } = useData();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Filter arts by designer
  const myArts = arts.filter(art => art.designerId === user?.id);

  // Apply filters
  const filteredArts = myArts.filter(art => {
    const matchesSearch = art.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || art.clientId === filterClient;
    const matchesCategory = filterCategory === 'all' || art.category === filterCategory;
    return matchesSearch && matchesClient && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Minhas Artes</h1>
          <p className="text-gray-600">Gerencie todas as artes criadas por você</p>
        </div>
        <Link to="/designer/send-art">
          <Button>+ Nova Arte</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="feed">Post Feed</SelectItem>
                <SelectItem value="menu">Cardápio</SelectItem>
                <SelectItem value="poster">Poster</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredArts.length} {filteredArts.length === 1 ? 'arte encontrada' : 'artes encontradas'}
        </p>
      </div>

      {/* Arts grid */}
      {filteredArts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>Nenhuma arte encontrada com os filtros selecionados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArts.map((art) => (
            <Card key={art.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img 
                  src={art.imageUrl} 
                  alt={art.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge>{art.category}</Badge>
                </div>
              </div>
              <CardContent className="pt-4">
                <h3 className="mb-1 truncate">{art.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{art.clientName}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {art.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {art.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{art.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/designer/art/${art.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  Criado em {art.createdAt.toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
