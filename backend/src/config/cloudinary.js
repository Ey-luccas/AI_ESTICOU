import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Verifica se Cloudinary está configurado
export const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configura Cloudinary apenas se as variáveis estiverem definidas
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configurado');
} else {
  console.warn(
    '⚠️  Cloudinary não configurado. Upload de imagens não funcionará.',
  );
}

// Configuração de storage para artes
let artStorage;
let logoStorage;

if (isCloudinaryConfigured()) {
  artStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'lualabs/arts',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' }, // Limita tamanho máximo (1920x1080)
        { quality: 'auto' }, // Otimização automática
      ],
    },
  });

  // Configuração de storage para logos/avatars
  logoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'lualabs/logos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
      ],
    },
  });
} else {
  // Fallback: storage em memória (apenas para desenvolvimento)
  artStorage = multer.memoryStorage();
  logoStorage = multer.memoryStorage();
}

// Middleware de upload
export const uploadArt = multer({
  storage: artStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadLogo = multer({
  storage: logoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// Função para deletar imagem
export const deleteImage = async (publicId) => {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary não configurado. Não é possível deletar imagem.');
    return { result: 'ok' };
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    throw error;
  }
};

// Função para obter URL otimizada
export const getOptimizedUrl = (publicId, options = {}) => {
  if (!isCloudinaryConfigured()) {
    return publicId; // Retorna o publicId como está se não houver Cloudinary
  }
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  });
};

export default cloudinary;
