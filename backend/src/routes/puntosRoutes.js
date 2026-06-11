const express = require('express');
const router = express.Router();
const puntosController = require('../controllers/puntosController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Authenticated
router.get('/', authMiddleware, puntosController.getPuntos);
router.get('/:id', authMiddleware, puntosController.getPunto);

// Admin & Supervisor
router.post('/', authMiddleware, requireRole('admin', 'supervisor'), puntosController.createPunto);
router.put('/:id', authMiddleware, requireRole('admin', 'supervisor'), puntosController.updatePunto);

// Admin only
router.delete('/:id', authMiddleware, requireRole('admin'), puntosController.deletePunto);

module.exports = router;
