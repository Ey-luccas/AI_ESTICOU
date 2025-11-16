import { useData } from '../../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, UserCog, FileImage, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
  const { clients, designers, arts, variations } = useData();

  const activeClients = clients.filter((c) => c.status === 'active').length;
  const thisMonthVariations = variations.filter((v) => {
    const isThisMonth = v.createdAt.getMonth() === new Date().getMonth();
    return isThisMonth;
  }).length;

  // Get top clients by variations
  const clientVariationCounts = clients
    .map((client) => ({
      ...client,
      variationCount: variations.filter((v) => v.clientId === client.id).length,
    }))
    .sort((a, b) => b.variationCount - a.variationCount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Dashboard do Gestor</h1>
        <p className="text-gray-600">Visão geral do sistema LuaLabs</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Clientes Ativos</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeClients}</div>
            <p className="text-xs text-gray-500 mt-1">{clients.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Designers</CardTitle>
            <UserCog className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{designers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Ativos no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total de Artes</CardTitle>
            <Images className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{arts.length}</div>
            <p className="text-xs text-gray-500 mt-1">No catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Variações IA</CardTitle>
            <Sparkles className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{thisMonthVariations}</div>
            <p className="text-xs text-gray-500 mt-1">
              {variations.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Variações IA por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Gráfico de uso ao longo do tempo</p>
                <p className="text-xs mt-1">(Implementação futura)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top clients */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes que Mais Usam IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientVariationCounts.map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{client.name}</p>
                    <p className="text-xs text-gray-500">
                      {client.artsCount} artes
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{client.variationCount}</p>
                    <p className="text-xs text-gray-500">variações</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent clients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimos Clientes</CardTitle>
              <Link to="/manager/clients">
                <Badge variant="secondary" className="cursor-pointer">
                  Ver todos
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.slice(0, 5).map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{client.name}</p>
                    <p className="text-xs text-gray-500">
                      {client.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge
                    variant={
                      client.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {client.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent arts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Últimas Artes Cadastradas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {arts.slice(0, 5).map((art) => (
                <div
                  key={art.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <img
                    src={art.imageUrl}
                    alt={art.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{art.name}</p>
                    <p className="text-xs text-gray-500">{art.clientName}</p>
                  </div>
                  <Badge variant="secondary">{art.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
