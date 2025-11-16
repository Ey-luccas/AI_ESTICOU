import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Download, Edit, Sparkles, Calendar, Tag } from 'lucide-react';

export default function DesignerArtDetail() {
  const { id } = useParams<{ id: string }>();
  const { getArtById, getVariationsByArt } = useData();
  
  const art = getArtById(id || '');
  const variations = getVariationsByArt(id || '');

  if (!art) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Arte não encontrada</p>
        <Link to="/designer/my-arts">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/designer/my-arts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl mb-1">{art.name}</h1>
          <p className="text-gray-600">{art.clientName}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Edit className="w-4 h-4" />
          Editar
        </Button>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Baixar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview da Arte</CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={art.imageUrl} 
                alt={art.name}
                className="w-full h-auto rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Variations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Variações Geradas ({variations.length})</CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gerar variação de teste
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {variations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma variação gerada ainda</p>
                  <p className="text-sm mt-1">As variações criadas pelos clientes aparecerão aqui</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {variations.map((variation) => (
                    <div key={variation.id} className="space-y-2">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={variation.imageUrl}
                          alt="Variação"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm">
                        <p className="truncate">{variation.product}</p>
                        <p className="text-xs text-gray-500">
                          {variation.createdAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data de criação</p>
                  <p>{art.createdAt.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Categoria</p>
                  <Badge>{art.category}</Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {art.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {art.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Descrição</p>
                  <p className="text-sm">{art.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <Badge variant={art.status === 'active' ? 'default' : 'secondary'}>
                  {art.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Variações geradas</span>
                <span>{variations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Downloads</span>
                <span>-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Última modificação</span>
                <span className="text-sm">{art.createdAt.toLocaleDateString('pt-BR')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
