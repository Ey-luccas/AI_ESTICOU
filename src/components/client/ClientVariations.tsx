import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Download, Copy, ArrowRight } from 'lucide-react';

export default function ClientVariations() {
  const { variations, arts } = useData();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter variations by client
  const myVariations = variations.filter(v => v.clientId === user?.clientId);

  // Apply search filter
  const filteredVariations = myVariations.filter(variation => {
    const matchesSearch = 
      variation.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variation.text?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get art name for each variation
  const getArtName = (artId: string) => {
    const art = arts.find(a => a.id === artId);
    return art?.name || 'Arte removida';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Minhas Variações</h1>
        <p className="text-gray-600">Histórico de todas as artes geradas por IA</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por produto, texto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredVariations.length} {filteredVariations.length === 1 ? 'variação encontrada' : 'variações encontradas'}
        </p>
      </div>

      {/* Variations grid */}
      {filteredVariations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>Nenhuma variação encontrada</p>
            <Link to="/client/catalog">
              <Button className="mt-4">Criar primeira variação</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVariations.map((variation) => (
            <Card key={variation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img 
                  src={variation.imageUrl} 
                  alt={variation.product}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-purple-500">IA</Badge>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Baseado em:</p>
                    <Link 
                      to={`/client/art/${variation.artId}`}
                      className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                    >
                      {getArtName(variation.artId)}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {variation.product && (
                    <div>
                      <p className="text-xs text-gray-500">Produto</p>
                      <p className="text-sm">{variation.product}</p>
                    </div>
                  )}

                  {variation.price && (
                    <div>
                      <p className="text-xs text-gray-500">Preço</p>
                      <p className="text-sm">{variation.price}</p>
                    </div>
                  )}

                  {variation.text && (
                    <div>
                      <p className="text-xs text-gray-500">Texto</p>
                      <p className="text-sm truncate">"{variation.text}"</p>
                    </div>
                  )}

                  {variation.notes && (
                    <div>
                      <p className="text-xs text-gray-500">Observações</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{variation.notes}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Criado em {variation.createdAt.toLocaleDateString('pt-BR')} às {variation.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Baixar
                  </Button>
                  <Link to={`/client/art/${variation.artId}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full gap-2">
                      <Copy className="w-4 h-4" />
                      Clonar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
