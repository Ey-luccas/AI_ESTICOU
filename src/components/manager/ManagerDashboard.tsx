import { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, UserCog, Image, Sparkles, TrendingUp, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';

export default function ManagerDashboard() {
  const { clients, designers, arts, variations } = useData();
  const [openModal, setOpenModal] = useState<
    'clients' | 'designers' | 'arts' | 'variations' | null
  >(null);

  const activeClients = clients.filter((c) => c.status === 'active').length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthVariations = variations.filter(
    (variation) =>
      variation.createdAt.getMonth() === currentMonth &&
      variation.createdAt.getFullYear() === currentYear,
  ).length;

  const artsThisMonthByClient = useMemo(
    () =>
      clients
        .map((client) => ({
          client,
          count: arts.filter(
            (art) =>
              art.clientId === client.id &&
              art.createdAt.getMonth() === currentMonth &&
              art.createdAt.getFullYear() === currentYear,
          ).length,
        }))
        .filter((entry) => entry.count > 0),
    [arts, clients, currentMonth, currentYear],
  );

  // Get top clients by variations
  const clientVariationCounts = useMemo(
    () =>
      clients
        .map((client) => ({
          ...client,
          variationCount: variations.filter((variation) => variation.clientId === client.id).length,
        }))
        .sort((first, second) => second.variationCount - first.variationCount)
        .slice(0, 5),
    [clients, variations],
  );

  const variationsByClient = useMemo(
    () =>
      clients.map((client) => ({
        client,
        count: variations.filter((variation) => variation.clientId === client.id).length,
      })),
    [clients, variations],
  );

  const maxVariationsPerClient = useMemo(
    () => Math.max(...variationsByClient.map((entry) => entry.count), 1),
    [variationsByClient],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Dashboard do Gestor</h1>
        <p className="text-gray-600">Visão geral do sistema Lua Crescente</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          onClick={() => setOpenModal('clients')}
          className="hover:shadow-lg transition cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Clientes Ativos</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeClients}</div>
            <p className="text-xs text-gray-500 mt-1">{clients.length} total</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
              <Bell className="w-3 h-3" />
              Ver clientes ativos
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setOpenModal('designers')}
          className="hover:shadow-lg transition cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Designers</CardTitle>
            <UserCog className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{designers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Ativos no sistema</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
              <Bell className="w-3 h-3" />
              Ver equipe
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setOpenModal('arts')}
          className="hover:shadow-lg transition cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total de Artes</CardTitle>
            <Image className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{arts.length}</div>
            <p className="text-xs text-gray-500 mt-1">No catálogo</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
              <Bell className="w-3 h-3" />
              Ver por cliente
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setOpenModal('variations')}
          className="hover:shadow-lg transition cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Variações IA</CardTitle>
            <Sparkles className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{thisMonthVariations}</div>
            <p className="text-xs text-gray-500 mt-1">
              {variations.length} total
            </p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
              <Bell className="w-3 h-3" />
              Abrir gráfico por cliente
            </div>
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

      {/* Focused modals for each card */}
      <Dialog
        open={openModal === 'clients'}
        onOpenChange={(isOpen) => setOpenModal(isOpen ? 'clients' : null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Clientes ativos</DialogTitle>
            <DialogDescription>
              Visão rápida dos clientes com conta habilitada e quantidade de artes.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-80 pr-3">
            <div className="space-y-3">
              {clients
                .filter((client) => client.status === 'active')
                .map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{client.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {client.artsCount} artes · {client.variationsCount} variações
                        </p>
                      </div>
                    </div>
                    <Badge>Ativo</Badge>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openModal === 'designers'}
        onOpenChange={(isOpen) => setOpenModal(isOpen ? 'designers' : null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Designers cadastrados</DialogTitle>
            <DialogDescription>
              Quem está ativo para receber demandas e produzir artes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {designers.map((designer) => (
              <div
                key={designer.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
                    {designer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{designer.name}</p>
                    <p className="text-xs text-gray-500 truncate">{designer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{designer.artsCount} artes</p>
                  <p className="text-xs text-gray-500">{designer.clientsCount} clientes</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openModal === 'arts'}
        onOpenChange={(isOpen) => setOpenModal(isOpen ? 'arts' : null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Artes do mês por cliente</DialogTitle>
            <DialogDescription>
              Contagem das artes criadas no mês corrente, agrupadas por cliente.
            </DialogDescription>
          </DialogHeader>
          {artsThisMonthByClient.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma arte registrada neste mês.</p>
          ) : (
            <div className="space-y-3">
              {artsThisMonthByClient.map(({ client, count }) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{client.name}</p>
                    <p className="text-xs text-gray-500 truncate">{client.artsCount} artes totais</p>
                  </div>
                  <Badge variant="secondary">{count} no mês</Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={openModal === 'variations'}
        onOpenChange={(isOpen) => setOpenModal(isOpen ? 'variations' : null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Variações de IA por cliente</DialogTitle>
            <DialogDescription>
              Distribuição das variações geradas por cada cliente para acompanhar o uso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {variationsByClient.map(({ client, count }) => {
              const percentage = (count / maxVariationsPerClient) * 100;
              return (
                <div key={client.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{client.name}</span>
                    <span className="text-gray-500">{count} variações</span>
                  </div>
                  <Progress value={percentage} />
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
