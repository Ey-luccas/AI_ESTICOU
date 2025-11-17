import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Key, Palette, Globe, Zap, Save } from 'lucide-react';

export default function ManagerSettings() {
  const [settings, setSettings] = useState({
    systemName: 'Lua Crescente',
    openaiKey: '••••••••••••••••••••••••••••',
    monthlyLimit: '50',
    enableNotifications: true,
    enableAutoBackup: true,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo'
  });

  const handleSave = () => {
    // Save settings
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Configurações do Sistema</h1>
        <p className="text-gray-600">Gerencie as configurações globais do Lua Crescente</p>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <CardTitle>Aparência do Sistema</CardTitle>
          </div>
          <CardDescription>
            Configure a identidade visual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="systemName">Nome do Sistema</Label>
            <Input
              id="systemName"
              value={settings.systemName}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
            />
            <p className="text-xs text-gray-500">Nome exibido no cabeçalho e login</p>
          </div>

          <div className="space-y-2">
            <Label>Logo do Sistema</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg"></div>
              <Button variant="outline" size="sm">Alterar logo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            <CardTitle>Configuração de API</CardTitle>
          </div>
          <CardDescription>
            Chaves de API para integração com IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openaiKey">Chave da API OpenAI</Label>
            <Input
              id="openaiKey"
              type="password"
              value={settings.openaiKey}
              onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Necessária para gerar variações de artes com IA
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Importante:</strong> Mantenha sua chave de API segura. Não compartilhe com terceiros.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <CardTitle>Limites de Uso</CardTitle>
          </div>
          <CardDescription>
            Configure limites de uso de IA por cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Variações IA por Cliente (mensal)</Label>
            <Input
              id="monthlyLimit"
              type="number"
              value={settings.monthlyLimit}
              onChange={(e) => setSettings({ ...settings, monthlyLimit: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Número máximo de variações que cada cliente pode gerar por mês
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Limite</Label>
                <p className="text-xs text-gray-500">
                  Notificar clientes quando atingirem 80% do limite
                </p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enableNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Automático</Label>
                <p className="text-xs text-gray-500">
                  Fazer backup diário das artes e variações
                </p>
              </div>
              <Switch
                checked={settings.enableAutoBackup}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enableAutoBackup: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <CardTitle>Configurações Regionais</CardTitle>
          </div>
          <CardDescription>
            Idioma e fuso horário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Input
                id="language"
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Input
                id="timezone"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
