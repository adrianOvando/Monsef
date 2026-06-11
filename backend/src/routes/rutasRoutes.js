const express = require('express');
const router = express.Router();
const rutasController = require('../controllers/rutasController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Authenticated routes
router.get('/', authMiddleware, rutasController.getRutas);
router.get('/:id', authMiddleware, rutasController.getRuta);
router.get('/:id/puntos', authMiddleware, rutasController.getPuntosRuta);

// Admin only
router.post('/', authMiddleware, requireRole('admin'), rutasController.createRuta);
router.put('/:id', authMiddleware, requireRole('admin'), rutasController.updateRuta);
router.put('/:id/toggle', authMiddleware, requireRole('admin'), rutasController.toggleRutaActiva);

module.exports = router;
