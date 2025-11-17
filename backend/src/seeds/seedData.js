import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Designer from '../models/Designer.js';
import Art from '../models/Art.js';
import Variation from '../models/Variation.js';
import connectDB from '../config/database.js';

dotenv.config();

// Dados iniciais
const users = [
  {
    name: 'Ana Designer',
    email: 'designer@lualabs.com',
    password: 'demo123',
    role: 'designer',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Carlos Gestor',
    email: 'gestor@lualabs.com',
    password: 'demo123',
    role: 'manager',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    name: 'Fitness Studio Pro',
    email: 'cliente@fitness.com',
    password: 'demo123',
    role: 'client',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
];

const clients = [
  {
    name: 'Fitness Studio Pro',
    email: 'contato@fitnesspro.com',
    phone: '(11) 99999-9999',
    status: 'active',
    artsCount: 4,
    variationsCount: 12,
  },
  {
    name: 'Restaurante Sabor & Arte',
    email: 'contato@saborarte.com',
    phone: '(11) 88888-8888',
    status: 'active',
    artsCount: 1,
    variationsCount: 5,
  },
  {
    name: 'Loja Fashion Trends',
    email: 'contato@fashiontrends.com',
    phone: '(11) 77777-7777',
    status: 'active',
    artsCount: 0,
    variationsCount: 0,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Limpa banco
    console.log('🗑️  Limpando banco de dados...');
    await User.deleteMany();
    await Client.deleteMany();
    await Designer.deleteMany();
    await Art.deleteMany();
    await Variation.deleteMany();

    // Cria usuários
    console.log('👥 Criando usuários...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} usuários criados`);

    // Cria clientes
    console.log('🏢 Criando clientes...');
    const createdClients = await Client.insertMany(
      clients.map((client, index) => ({
        ...client,
        userId: index === 0 ? createdUsers[2]._id : null, // Associa o primeiro cliente ao user cliente
      })),
    );
    console.log(`✅ ${createdClients.length} clientes criados`);

    // Atualiza clientId no usuário cliente
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      clientId: createdClients[0]._id,
    });

    // Cria perfil de designer
    console.log('🎨 Criando perfil de designer...');
    const designer = await Designer.create({
      userId: createdUsers[0]._id,
      bio: 'Designer especializado em artes para redes sociais',
      specialties: ['banner', 'story', 'feed'],
      assignedClients: [createdClients[0]._id, createdClients[1]._id],
      stats: {
        artsCreated: 5,
        clientsServed: 2,
      },
    });
    console.log('✅ Perfil de designer criado');

    // Cria artes
    console.log('🎨 Criando artes...');
    const arts = [
      {
        name: 'Black Friday - Legging Rosa',
        description:
          'Banner promocional para Black Friday com destaque para legging rosa',
        imageUrl:
          'https://images.unsplash.com/photo-1755357971604-e1daef52d674?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1755357971604-e1daef52d674?w=300',
        category: 'banner',
        size: '1920x1080',
        dimensions: { width: 1920, height: 1080 },
        tags: ['promoção', 'black-friday', 'fitness'],
        status: 'active',
        clientId: createdClients[0]._id,
        designerId: designer._id,
        isTemplate: true,
      },
      {
        name: 'Story - Treino Intenso',
        description: 'Story motivacional para Instagram',
        imageUrl:
          'https://images.unsplash.com/photo-1689852501130-e89d9e54aa41?w=800',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1689852501130-e89d9e54aa41?w=300',
        category: 'story',
        size: '1080x1080',
        dimensions: { width: 1080, height: 1080 },
        tags: ['motivação', 'treino', 'fitness'],
        status: 'active',
        clientId: createdClients[0]._id,
        designerId: designer._id,
        isTemplate: true,
      },
    ];

    const createdArts = await Art.insertMany(arts);
    console.log(`✅ ${createdArts.length} artes criadas`);

    // Cria variações (apenas se tiver artes criadas)
    if (createdArts.length > 0) {
      console.log('🎨 Criando variações de exemplo...');
      const variations = [
        {
          parameters: {
            currentProduct: 'Legging Rosa',
            newProduct: 'Top Preto',
            currentPrice: 'R$ 99,90',
            newPrice: 'R$ 79,90',
            newText: 'Black Friday Imperdível',
          },
          generatedPrompt:
            'Create a promotional banner design featuring Top Preto...',
          status: 'completed',
          quality: 'standard',
          artId: createdArts[0]._id,
          clientId: createdClients[0]._id,
          imageUrl:
            'https://images.unsplash.com/photo-1755357971604-e1daef52d674?w=800',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1755357971604-e1daef52d674?w=300&h=300',
        },
      ];

      const createdVariations = await Variation.insertMany(variations);
      console.log(`✅ ${createdVariations.length} variações criadas`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📝 Credenciais de acesso:');
    console.log('Designer: designer@lualabs.com / demo123');
    console.log('Cliente: cliente@fitness.com / demo123');
    console.log('Gestor: gestor@lualabs.com / demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    process.exit(1);
  }
};

seedDatabase();
