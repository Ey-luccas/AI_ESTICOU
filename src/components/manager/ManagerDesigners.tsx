import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Search, Plus } from 'lucide-react';

interface DesignerRow {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ManagerDesigners() {
  const { token } = useAuth();
  const [designers, setDesigners] = useState<DesignerRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesigners = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/designers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result?.success) {
          setDesigners(result.data.designers || []);
        }
      } catch (error) {
        console.error('Erro ao carregar designers', error);
      }
    };

    fetchDesigners();
  }, [token]);

  // Apply search filter
  const filteredDesigners = designers.filter((designer) =>
    designer.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    designer.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateDesigner = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setFeedback(null);

    try {
      const response = await fetch(`${API_URL}/designers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          },
          specialties: [],
          assignedClients: [],
        }),
      });

      const result = await response.json();

      if (response.ok && result?.success) {
        setDesigners([result.data.designer, ...designers]);
        setFormData({ name: '', email: '', password: '' });
        setIsDialogOpen(false);
        setFeedback('Designer criado com sucesso e já pode acessar o sistema.');
      } else {
        setFeedback(result?.message || 'Não foi possível criar o designer.');
      }
    } catch (error) {
      console.error('Erro ao criar designer', error);
      setFeedback('Erro ao criar designer.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gerenciar Designers</h1>
          <p className="text-gray-600">Lista de designers cadastrados no sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Designer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Designer</DialogTitle>
              <DialogDescription>Crie o usuário e já libere o acesso</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateDesigner}>
              <div className="space-y-2">
                <Label htmlFor="designerName">Nome</Label>
                <Input
                  id="designerName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designerEmail">E-mail</Label>
                <Input
                  id="designerEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designerPassword">Senha inicial</Label>
                <Input
                  id="designerPassword"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Cadastrar</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar designer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardContent className="pt-6">
          {feedback && (
            <div className="mb-4 text-sm text-purple-700 bg-purple-50 border border-purple-100 rounded-md p-3">
              {feedback}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designer</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDesigners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhum designer encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredDesigners.map((designer) => (
                  <TableRow key={designer._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white">
                          {designer.userId?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p>{designer.userId?.name}</p>
                          <p className="text-xs text-gray-500">ID: {designer.userId?._id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {designer.userId?.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={designer.userId?.isActive ? 'default' : 'secondary'}>
                        {designer.userId?.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(designer.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right text-xs text-gray-500">
                      Conta pronta
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
