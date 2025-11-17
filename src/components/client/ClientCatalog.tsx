import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Search, Sparkles, Eye, Download, Loader2 } from 'lucide-react';

export default function ClientCatalog() {
  const { arts, loadingArts, refreshArts } = useData();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    refreshArts();
  }, [refreshArts]);

  // Filter arts by client - usando _id do MongoDB se disponível
  const myArts = arts.filter((art) => {
    const artClientId =
      typeof art.clientId === 'string' ? art.clientId : art.clientId;
    const userClientId = user?.clientId;
    return (
      artClientId === userClientId || artClientId === userClientId?.toString()
    );
  });

  // Apply filters
  const filteredArts = myArts.filter((art) => {
    const matchesSearch =
      art.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      filterCategory === 'all' || art.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Catálogo de Artes</h1>
        <p className="text-gray-600">
          Sua prateleira digital de modelos prontos
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou tag (Ex: Black Friday, Natal)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de arte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
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
          {filteredArts.length}{' '}
          {filteredArts.length === 1 ? 'arte encontrada' : 'artes encontradas'}
        </p>
      </div>

      {/* Arts grid */}
      {loadingArts ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
            <p className="text-gray-500">Carregando artes...</p>
          </CardContent>
        </Card>
      ) : filteredArts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>Nenhuma arte encontrada</p>
            <p className="text-sm mt-2">
              Entre em contato com seu designer para adicionar artes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArts.map((art) => (
            <Card
              key={art.id}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img
                  src={art.imageUrl}
                  alt={art.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2">
                  <Badge>{art.category}</Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2">
                    <Link to={`/client/art/${art.id}`} className="flex-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Criar variação
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate mb-1">{art.name}</h3>
                    <p className="text-xs text-gray-500">
                      Modelo feito pelo designer
                    </p>
                  </div>
                </div>

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
                  <Link to={`/client/art/${art.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
