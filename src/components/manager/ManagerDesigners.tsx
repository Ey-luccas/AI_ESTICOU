import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Search, Edit, Eye, Plus } from 'lucide-react';

export default function ManagerDesigners() {
  const { designers } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Apply search filter
  const filteredDesigners = designers.filter(designer => 
    designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    designer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gerenciar Designers</h1>
          <p className="text-gray-600">Lista de designers cadastrados no sistema</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Designer
        </Button>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designer</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Artes Criadas</TableHead>
                <TableHead>Clientes Atendidos</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
                  <TableRow key={designer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white">
                          {designer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p>{designer.name}</p>
                          <p className="text-xs text-gray-500">ID: {designer.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {designer.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{designer.artsCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{designer.clientsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {designer.lastAccess.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
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
