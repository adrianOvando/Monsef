const express = require('express');
const router = express.Router();
const geocercasController = require('../controllers/geocercasController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Authenticated
router.get('/', authMiddleware, geocercasController.getGeocercas);
router.get('/ruta/:ruta_id', authMiddleware, geocercasController.getGeocercaByRuta);

// Admin only
router.post('/', authMiddleware, requireRole('admin'), geocercasController.createGeocerca);
router.put('/:id/toggle', authMiddleware, requireRole('admin'), geocercasController.toggleGeocercaActiva);

module.exports = router;
