/**
 * MonitoreoRS Sucre — authMiddleware.js
 * Verifica el JWT Bearer token en cada request protegido
 */

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación no proporcionado'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'La sesión ha expirado. Por favor inicie sesión nuevamente.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
}

module.exports = authMiddleware;
