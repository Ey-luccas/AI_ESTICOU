import mongoose from 'mongoose';

const variationSchema = new mongoose.Schema(
  {
    // Relacionamentos
    artId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Art',
      required: [true, 'Arte base é obrigatória'],
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Cliente é obrigatório'],
    },
    // Imagem gerada
    imageUrl: {
      type: String,
      required: [true, 'URL da imagem é obrigatória'],
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    // Parâmetros da variação
    parameters: {
      currentProduct: String,
      newProduct: String,
      currentPrice: String,
      newPrice: String,
      currentText: String,
      newText: String,
      notes: String,
    },
    // Prompt usado para gerar a imagem
    generatedPrompt: {
      type: String,
      required: true,
    },
    // Modelo de IA usado
    aiModel: {
      type: String,
      default: 'dall-e-3',
    },
    // Status da geração
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    // Custo da geração (em créditos/tokens)
    cost: {
      type: Number,
      default: 1,
    },
    // Qualidade da imagem
    quality: {
      type: String,
      enum: ['standard', 'hd'],
      default: 'standard',
    },
    // Dimensões
    dimensions: {
      width: { type: Number, default: 1024 },
      height: { type: Number, default: 1024 },
    },
    // Metadados
    metadata: {
      generationTime: Number, // Tempo em segundos
      revisedPrompt: String, // Prompt revisado pela OpenAI
      format: String,
    },
    // Feedback do usuário
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: String,
    },
    // Se foi aprovada pelo cliente
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Índices
variationSchema.index({ artId: 1, clientId: 1 });
variationSchema.index({ clientId: 1, createdAt: -1 });
variationSchema.index({ status: 1 });

// Middleware para atualizar contadores
variationSchema.post('save', async function (doc) {
  if (this.isNew && doc.status === 'completed') {
    const Art = mongoose.model('Art');
    await Art.findByIdAndUpdate(doc.artId, {
      $inc: { variationsCount: 1 },
    });

    const Client = mongoose.model('Client');
    await Client.findByIdAndUpdate(doc.clientId, {
      $inc: { variationsCount: 1 },
    });
  }
});

// Método para aprovar variação
variationSchema.methods.approve = function () {
  this.isApproved = true;
  this.approvedAt = new Date();
  return this.save();
};

// Método para adicionar feedback
variationSchema.methods.addFeedback = function (rating, comment) {
  this.feedback = { rating, comment };
  return this.save();
};

const Variation = mongoose.model('Variation', variationSchema);

export default Variation;
