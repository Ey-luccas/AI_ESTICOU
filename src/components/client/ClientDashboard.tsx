import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FolderKanban, Sparkles, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { arts, variations } = useData();
  const { user } = useAuth();

  // Filter by client
  const myArts = arts.filter((art) => art.clientId === user?.clientId);
  const myVariations = variations.filter((v) => v.clientId === user?.clientId);
  const recentArts = myArts.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Bem-vindo, {user?.name}!</h1>
        <p className="text-gray-600">
          Seu catálogo de artes e variações inteligentes
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Artes Disponíveis</CardTitle>
            <FolderKanban className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myArts.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Modelos prontos para usar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Modelos Base</CardTitle>
            <Sparkles className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myArts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Para replicar com IA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Variações Geradas</CardTitle>
            <History className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myVariations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Criadas por você</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg mb-2">Ver Catálogo Completo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore todas as suas artes disponíveis
                </p>
                <Link to="/client/catalog">
                  <Button className="gap-2">
                    <FolderKanban className="w-4 h-4" />
                    Acessar Catálogo
                  </Button>
                </Link>
              </div>
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg mb-2">Criar com IA</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Gere variações inteligentes das suas artes
                </p>
                <Link to="/client/catalog">
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Começar
                  </Button>
                </Link>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent arts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Artes Recentes</CardTitle>
            <Link to="/client/catalog">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentArts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma arte disponível ainda</p>
              <p className="text-sm mt-1">Entre em contato com seu designer</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentArts.map((art) => (
                <Link key={art.id} to={`/client/art/${art.id}`}>
                  <div className="group cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                      <img
                        src={art.imageUrl}
                        alt={art.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge className="gap-1">
                            <Sparkles className="w-3 h-3" />
                            Criar variação
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-sm truncate">{art.name}</h4>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {art.category}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
