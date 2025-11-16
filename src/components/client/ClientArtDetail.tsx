import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ArrowLeft, Download, Sparkles, Loader2, Check, X as XIcon } from 'lucide-react';

export default function ClientArtDetail() {
  const { id } = useParams<{ id: string }>();
  const { getArtById, getVariationsByArt, addVariation } = useData();
  const { user } = useAuth();
  
  const art = getArtById(id || '');
  const variations = getVariationsByArt(id || '');

  const [generating, setGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');

  const [formData, setFormData] = useState({
    currentProduct: '',
    newProduct: '',
    currentPrice: '',
    newPrice: '',
    currentText: '',
    newText: '',
    notes: ''
  });

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

  const handleGenerate = async () => {
    setGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real app, this would call OpenAI API
    setGeneratedImage(art.imageUrl);
    setGenerating(false);
    setShowResult(true);
  };

  const handleSave = () => {
    addVariation({
      artId: art.id,
      clientId: user?.clientId || '',
      imageUrl: generatedImage,
      product: formData.newProduct,
      price: formData.newPrice,
      text: formData.newText,
      notes: formData.notes
    });

    // Reset form
    setShowResult(false);
    setFormData({
      currentProduct: '',
      newProduct: '',
      currentPrice: '',
      newPrice: '',
      currentText: '',
      newText: '',
      notes: ''
    });
  };

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
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                {art.description && (
                  <p className="text-sm text-gray-600 mt-2">{art.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  📝 Esse é um modelo base para criar novas versões
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Generated result */}
          {showResult && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Nova Versão Gerada
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img 
                    src={generatedImage} 
                    alt="Variação gerada"
                    className="w-full h-auto rounded-lg border-2 border-green-200"
                  />
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <h4>Alterações aplicadas:</h4>
                    {formData.newProduct && (
                      <p className="text-sm">• Produto: {formData.currentProduct} → <span className="text-green-600">{formData.newProduct}</span></p>
                    )}
                    {formData.newPrice && (
                      <p className="text-sm">• Preço: {formData.currentPrice} → <span className="text-green-600">{formData.newPrice}</span></p>
                    )}
                    {formData.newText && (
                      <p className="text-sm">• Texto: "{formData.newText}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1 gap-2">
                      <Check className="w-4 h-4" />
                      Salvar no catálogo
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => setShowResult(false)}
                    >
                      <XIcon className="w-4 h-4" />
                      Descartar
                    </Button>
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
            <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentProduct">Produto atual</Label>
                  <Input
                    id="currentProduct"
                    placeholder="Ex: Legging rosa"
                    value={formData.currentProduct}
                    onChange={(e) => setFormData({ ...formData, currentProduct: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newProduct">Novo produto</Label>
                  <Input
                    id="newProduct"
                    placeholder="Ex: Top preto"
                    value={formData.newProduct}
                    onChange={(e) => setFormData({ ...formData, newProduct: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPrice">Novo preço</Label>
                  <Input
                    id="newPrice"
                    placeholder="R$ 79,90"
                    value={formData.newPrice}
                    onChange={(e) => setFormData({ ...formData, newPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentText">Texto principal atual</Label>
                <Input
                  id="currentText"
                  placeholder="Ex: Promoção de verão"
                  value={formData.currentText}
                  onChange={(e) => setFormData({ ...formData, currentText: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newText">Novo texto</Label>
                <Input
                  id="newText"
                  placeholder="Ex: Black Friday Imperdível"
                  value={formData.newText}
                  onChange={(e) => setFormData({ ...formData, newText: e.target.value })}
                />
                <Button type="button" variant="link" size="sm" className="h-auto p-0">
                  ✨ Gerar texto com IA
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ex: Quero algo mais chamativo, tornar o texto mais curto..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

              {generating && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    🤖 Nossa IA está trabalhando na sua arte...
                  </p>
                </div>
              )}
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
              <p className="text-sm mt-1">Use o formulário acima para criar sua primeira variação</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <p className="text-xs text-gray-500">{variation.price}</p>
                    <p className="text-xs text-gray-500">
                      {variation.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      Clonar
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
