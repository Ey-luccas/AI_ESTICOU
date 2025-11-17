import sharp from 'sharp';
import { deleteImage } from '../config/cloudinary.js';

// Extrai public_id do Cloudinary URL
export const extractPublicId = (imageUrl) => {
  if (!imageUrl) return null;

  try {
    // Exemplo: https://res.cloudinary.com/demo/image/upload/v1234567890/lualabs/arts/abc123.jpg
    // Extrai a parte após /upload/ e antes da extensão
    const uploadIndex = imageUrl.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const afterUpload = imageUrl.substring(uploadIndex + 8); // +8 para pular '/upload/'
    // Remove versão se existir (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Remove transformações se existirem (w_300,h_300,c_fill/)
    const withoutTransformations = withoutVersion.replace(/^[^/]+\//, '');
    // Remove extensão
    const publicId = withoutTransformations.replace(/\.[^.]+$/, '');
    return publicId;
  } catch (error) {
    console.error('Erro ao extrair public_id:', error);
    return null;
  }
};

// Processa e otimiza imagem (caso necessário processar antes do upload)
export const processImage = async (buffer, options = {}) => {
  const {
    width = 2000,
    height = 2000,
    quality = 90,
    format = 'jpeg',
  } = options;

  try {
    const processed = await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();

    return processed;
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    throw error;
  }
};

// Gera thumbnail
export const generateThumbnail = async (
  imageUrl,
  width = 300,
  height = 300,
) => {
  // Com Cloudinary, isso é feito via transformações na URL
  return imageUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
};

// Deleta imagem antiga ao atualizar
export const deleteOldImage = async (oldImageUrl) => {
  if (!oldImageUrl || !oldImageUrl.includes('cloudinary')) {
    return;
  }

  const publicId = extractPublicId(oldImageUrl);
  if (publicId) {
    await deleteImage(publicId);
  }
};
