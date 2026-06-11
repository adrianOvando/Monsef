const express = require('express');
const router = express.Router();
const zonasController = require('../controllers/zonasController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public (authenticated)
router.get('/', authMiddleware, zonasController.getZonas);
router.get('/:id', authMiddleware, zonasController.getZona);

// Admin only
router.post('/', authMiddleware, requireRole('admin'), zonasController.createZona);
router.put('/:id', authMiddleware, requireRole('admin'), zonasController.updateZona);
router.put('/:id/toggle', authMiddleware, requireRole('admin'), zonasController.toggleZonaActiva);

module.exports = router;
