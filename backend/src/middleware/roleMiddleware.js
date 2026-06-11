/**
 * MonitoreoRS Sucre — roleMiddleware.js
 * Factory que retorna middleware para verificar roles de usuario
 */

/**
 * @param {...string} roles - Roles permitidos (ej: 'admin', 'supervisor')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = { requireRole };
