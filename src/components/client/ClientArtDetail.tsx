import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ArrowLeft, Download, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Art {
  _id: string;
  name: string;
  imageUrl: string;
  category: string;
  tags: string[];
  description?: string;
  clientId: {
    _id: string;
    name: string;
  };
}

interface Variation {
  _id: string;
  imageUrl: string;
  parameters: {
    newProduct?: string;
    newPrice?: string;
    newText?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export default function ClientArtDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [art, setArt] = useState<Art | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [variationId, setVariationId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [formData, setFormData] = useState({
    currentProduct: '',
    newProduct: '',
    currentPrice: '',
    newPrice: '',
    currentText: '',
    newText: '',
    notes: '',
  });

  // Carrega arte e variações
  useEffect(() => {
    if (!token || !id) return;

    const loadData = async () => {
      try {
        const [artResponse, variationsResponse] = await Promise.all([
          fetch(`${API_URL}/arts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/variations?artId=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (artResponse.ok) {
          const artData = await artResponse.json();
          setArt(artData.data.art);
        }

        if (variationsResponse.ok) {
          const variationsData = await variationsResponse.json();
          setVariations(variationsData.data.variations || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar arte');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, token]);

  // Verifica status da variação em processamento
  useEffect(() => {
    if (!variationId || !token) return;

    let intervalId: NodeJS.Timeout | null = null;

    const checkStatus = async () => {
      setCheckingStatus(true);
      try {
        const response = await fetch(
          `${API_URL}/variations/${variationId}/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const status = data.data.status;

          if (status === 'completed') {
            toast.success('✨ Variação gerada com sucesso!');
            setVariationId(null);
            // Recarrega variações
            const variationsResponse = await fetch(
              `${API_URL}/variations?artId=${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (variationsResponse.ok) {
              const variationsData = await variationsResponse.json();
              setVariations(variationsData.data.variations || []);
            }
            refreshNotifications();
            if (intervalId) clearInterval(intervalId);
          } else if (status === 'failed') {
            toast.error('Erro ao gerar variação. Tente novamente.');
            setVariationId(null);
            if (intervalId) clearInterval(intervalId);
          } else {
            // Ainda processando, continua verificando
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    // Verifica imediatamente
    checkStatus();

    // Configura verificação periódica
    intervalId = setInterval(checkStatus, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [variationId, token, id, refreshNotifications]);

  const handleGenerate = async () => {
    if (!token || !art) return;

    setGenerating(true);
    toast.info('Iniciando geração da variação...');

    try {
      const response = await fetch(`${API_URL}/variations/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          artId: art._id,
          currentProduct: formData.currentProduct,
          newProduct: formData.newProduct,
          currentPrice: formData.currentPrice,
          newPrice: formData.newPrice,
          currentText: formData.currentText,
          newText: formData.newText,
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (response.ok && result?.success) {
        setVariationId(result.data.variation._id);
        toast.success(
          'Variação em processamento! Você será notificado quando estiver pronta.',
        );

        // Reset form
        setFormData({
          currentProduct: '',
          newProduct: '',
          currentPrice: '',
          newPrice: '',
          currentText: '',
          newText: '',
          notes: '',
        });
      } else {
        toast.error(result?.message || 'Erro ao gerar variação');
      }
    } catch (error) {
      console.error('Erro ao gerar variação:', error);
      toast.error('Erro ao gerar variação. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!art) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Arte não encontrada</p>
        <Link to="/client/catalog">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/client/catalog">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl mb-1">{art.name}</h1>
          <p className="text-gray-600">Modelo base para criar novas versões</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Baixar original
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Arte Original</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={art.imageUrl}
                alt={art.name}
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>{art.category}</Badge>
                  {art.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {art.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {art.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  📝 Esse é um modelo base para criar novas versões
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status de processamento */}
          {(generating || checkingStatus || variationId) && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  Processando Variação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      🤖 Nossa IA está trabalhando na sua arte...
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full animate-pulse"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Isso pode levar de 10 a 30 segundos. Você será notificado
                      quando estiver pronta!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right side - IA Form */}
        <Card className="h-fit sticky top-6">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Criar Nova Versão com IA
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Preencha os campos para gerar uma nova variação automaticamente
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentProduct">Produto atual</Label>
                  <Input
                    id="currentProduct"
                    placeholder="Ex: Legging rosa"
                    value={formData.currentProduct}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentProduct: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newProduct">Novo produto</Label>
                  <Input
                    id="newProduct"
                    placeholder="Ex: Top preto"
                    value={formData.newProduct}
                    onChange={(e) =>
                      setFormData({ ...formData, newProduct: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPrice">Preço atual</Label>
                  <Input
                    id="currentPrice"
                    placeholder="R$ 99,90"
                    value={formData.currentPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPrice: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPrice">Novo preço</Label>
                  <Input
                    id="newPrice"
                    placeholder="R$ 79,90"
                    value={formData.newPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, newPrice: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentText">Texto principal atual</Label>
                <Input
                  id="currentText"
                  placeholder="Ex: Promoção de verão"
                  value={formData.currentText}
                  onChange={(e) =>
                    setFormData({ ...formData, currentText: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newText">Novo texto</Label>
                <Input
                  id="newText"
                  placeholder="Ex: Black Friday Imperdível"
                  value={formData.newText}
                  onChange={(e) =>
                    setFormData({ ...formData, newText: e.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                >
                  ✨ Gerar texto com IA
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ex: Quero algo mais chamativo, tornar o texto mais curto..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={generating}
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando nova versão...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar nova versão
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Variations history */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Variações ({variations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {variations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma variação criada ainda</p>
              <p className="text-sm mt-1">
                Use o formulário acima para criar sua primeira variação
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {variations
                .filter((v) => v.status === 'completed')
                .map((variation) => (
                  <div key={variation._id} className="space-y-2">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={variation.imageUrl}
                        alt="Variação"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-sm">
                      <p className="truncate">
                        {variation.parameters?.newProduct || 'Variação'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {variation.parameters?.newPrice}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(variation.createdAt).toLocaleDateString(
                          'pt-BR',
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          window.open(variation.imageUrl, '_blank')
                        }
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
