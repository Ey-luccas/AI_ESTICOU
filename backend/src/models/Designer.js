import mongoose from 'mongoose';

const designerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID do usuário é obrigatório'],
      unique: true,
    },
    // Informações profissionais
    portfolio: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio não pode ter mais de 500 caracteres'],
      default: null,
    },
    specialties: [
      {
        type: String,
        enum: ['banner', 'story', 'feed', 'menu', 'poster', 'logo', 'branding'],
      },
    ],
    // Clientes atribuídos a este designer
    assignedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
    ],
    // Estatísticas
    stats: {
      artsCreated: {
        type: Number,
        default: 0,
      },
      clientsServed: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
    // Status
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lastAccessAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Índices
designerSchema.index({ userId: 1 });
designerSchema.index({ isAvailable: 1 });

// Atualiza lastAccessAt
designerSchema.methods.updateLastAccess = function () {
  this.lastAccessAt = new Date();
  return this.save();
};

// Adiciona cliente à lista de atribuídos
designerSchema.methods.assignClient = function (clientId) {
  if (!this.assignedClients.includes(clientId)) {
    this.assignedClients.push(clientId);
    this.stats.clientsServed = this.assignedClients.length;
    return this.save();
  }
  return this;
};

// Remove cliente da lista
designerSchema.methods.unassignClient = function (clientId) {
  this.assignedClients = this.assignedClients.filter(
    (id) => id.toString() !== clientId.toString(),
  );
  this.stats.clientsServed = this.assignedClients.length;
  return this.save();
};

const Designer = mongoose.model('Designer', designerSchema);

export default Designer;
