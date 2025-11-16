import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileImage, Users, Sparkles, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DesignerDashboard() {
  const { arts, variations } = useData();
  const { user } = useAuth();

  // Filter arts by this designer
  const myArts = arts.filter((art) => art.designerId === user?.id);
  const myClients = [...new Set(myArts.map((art) => art.clientId))];
  const recentArts = myArts.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Dashboard do Designer</h1>
        <p className="text-gray-600">Bem-vindo de volta, {user?.name}!</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total de Artes</CardTitle>
            <FileImage className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myArts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Artes criadas por você</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Clientes Atendidos</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myClients.length}</div>
            <p className="text-xs text-gray-500 mt-1">Clientes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Variações IA</CardTitle>
            <Sparkles className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{variations.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Geradas nos últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg mb-2">Enviar Nova Arte</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Faça upload de um novo modelo e conecte a um cliente
                </p>
                <Link to="/designer/send-art">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Arte
                  </Button>
                </Link>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg mb-2">Ver Catálogo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Organize e gerencie suas artes por cliente
                </p>
                <Link to="/designer/my-arts">
                  <Button variant="outline" className="gap-2">
                    <FileImage className="w-4 h-4" />
                    Minhas Artes
                  </Button>
                </Link>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <FileImage className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent arts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Últimas Artes Enviadas</CardTitle>
            <Link to="/designer/my-arts">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentArts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileImage className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma arte enviada ainda</p>
              <Link to="/designer/send-art">
                <Button className="mt-4">Enviar primeira arte</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentArts.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={art.imageUrl}
                    alt={art.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate">{art.name}</h4>
                    <p className="text-sm text-gray-600">{art.clientName}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{art.category}</Badge>
                      <Badge variant="outline">{art.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{art.createdAt.toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Link to={`/designer/art/${art.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
