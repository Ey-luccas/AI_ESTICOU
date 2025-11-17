import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do cliente é obrigatório'],
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    address: {
      street: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      zipCode: { type: String, default: null },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // User associado ao cliente (se houver)
    },
    // Contadores (serão atualizados via triggers/hooks)
    artsCount: {
      type: Number,
      default: 0,
    },
    variationsCount: {
      type: Number,
      default: 0,
    },
    // Configurações específicas do cliente
    settings: {
      monthlyAILimit: {
        type: Number,
        default: 50, // Limite de variações IA por mês
      },
      allowedCategories: [
        {
          type: String,
          enum: ['banner', 'story', 'feed', 'menu', 'poster'],
        },
      ],
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Índices para melhor performance
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });

// Virtual para calcular uso de IA no mês atual
clientSchema.virtual('currentMonthAIUsage').get(function () {
  // Isso será implementado na Parte 3 com o model de Variation
  return 0;
});

// Método para verificar se cliente atingiu limite de IA
clientSchema.methods.canGenerateAI = function () {
  return this.variationsCount < this.settings.monthlyAILimit;
};

const Client = mongoose.model('Client', clientSchema);

export default Client;
