import User from '../models/User.js';

export const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lualabs.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Administrador';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    return;
  }

  await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'manager',
  });

  console.log('✅ Administrador padrão criado');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Senha: ${adminPassword}`);
};
