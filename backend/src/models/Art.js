import mongoose from 'mongoose';

const artSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome da arte é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome não pode ter mais de 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Descrição não pode ter mais de 500 caracteres'],
      default: null,
    },
    imageUrl: {
      type: String,
      required: [true, 'URL da imagem é obrigatória'],
    },
    imagePublicId: {
      type: String, // ID da imagem no Cloudinary para facilitar deleção
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    // Relacionamentos
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Cliente é obrigatório'],
    },
    designerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Designer',
      required: [true, 'Designer é obrigatório'],
    },
    // Categorização
    category: {
      type: String,
      enum: ['banner', 'story', 'feed', 'menu', 'poster', 'logo', 'outros'],
      required: [true, 'Categoria é obrigatória'],
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    // Status
    status: {
      type: String,
      enum: ['active', 'draft', 'archived', 'deleted'],
      default: 'active',
    },
    // Dimensões originais
    dimensions: {
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    // Tamanho padrão da arte
    size: {
      type: String,
      enum: ['1080x1080', '1350x1080', '1920x1080'],
      default: '1080x1080',
    },
    // Tamanho do arquivo em bytes
    fileSize: {
      type: Number,
      default: null,
    },
    // Metadados
    metadata: {
      colorPalette: [String], // Cores predominantes
      format: String, // jpg, png, svg, etc
      hasTransparency: Boolean,
    },
    // Contador de variações geradas a partir desta arte
    variationsCount: {
      type: Number,
      default: 0,
    },
    // Estatísticas
    stats: {
      views: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
    },
    // Se é modelo base (para variações de IA)
    isTemplate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Índices para melhor performance
artSchema.index({ clientId: 1, status: 1 });
artSchema.index({ designerId: 1, status: 1 });
artSchema.index({ category: 1 });
artSchema.index({ tags: 1 });
artSchema.index({ createdAt: -1 });
artSchema.index({ name: 'text', description: 'text' }); // Índice de texto para busca

// Virtual para nome do cliente
artSchema.virtual('clientName', {
  ref: 'Client',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true,
});

// Middleware para atualizar contador no Designer
artSchema.post('save', async function (doc) {
  if (this.isNew) {
    const Designer = mongoose.model('Designer');
    await Designer.findByIdAndUpdate(doc.designerId, {
      $inc: { 'stats.artsCreated': 1 },
    });

    const Client = mongoose.model('Client');
    await Client.findByIdAndUpdate(doc.clientId, {
      $inc: { artsCount: 1 },
    });
  }
});

// Método para incrementar views
artSchema.methods.incrementViews = function () {
  this.stats.views += 1;
  return this.save();
};

// Método para incrementar downloads
artSchema.methods.incrementDownloads = function () {
  this.stats.downloads += 1;
  return this.save();
};

const Art = mongoose.model('Art', artSchema);

export default Art;
