// Funções auxiliares reutilizáveis

export const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

export const buildSearchQuery = (fields, searchTerm) => {
  if (!searchTerm) return {};

  const searchRegex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map((field) => ({ [field]: searchRegex })),
  };
};

export const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const successResponse = (
  res,
  data,
  message = 'Sucesso',
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message, statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};
