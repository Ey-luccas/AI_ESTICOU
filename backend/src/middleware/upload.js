import { uploadArt, uploadLogo } from '../config/cloudinary.js';

// Middleware para upload de arte
export const handleArtUpload = (req, res, next) => {
  const upload = uploadArt.single('image');

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Arquivo muito grande. Tamanho máximo: 10MB',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Erro ao fazer upload da imagem',
        error: err.message,
      });
    }
    next();
  });
};

// Middleware para upload de logo
export const handleLogoUpload = (req, res, next) => {
  const upload = uploadLogo.single('logo');

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Arquivo muito grande. Tamanho máximo: 2MB',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Erro ao fazer upload do logo',
        error: err.message,
      });
    }
    next();
  });
};

// Middleware para validar se imagem foi enviada
export const requireImage = (req, res, next) => {
  if (!req.file && !req.body.imageUrl) {
    return res.status(400).json({
      success: false,
      message: 'Imagem é obrigatória',
    });
  }
  next();
};
