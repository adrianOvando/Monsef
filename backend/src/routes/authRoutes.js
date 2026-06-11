const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Public
router.post('/login', authController.loginValidation, authController.login);

// Authenticated
router.get('/me', authMiddleware, authController.me);

// Admin - usuarios management
router.get('/usuarios', authMiddleware, requireRole('admin'), authController.getUsuarios);
router.post('/usuarios', authMiddleware, requireRole('admin'), authController.createUsuarioValidation, authController.createUsuario);
router.put('/usuarios/:id', authMiddleware, requireRole('admin'), authController.updateUsuario);
router.put('/usuarios/:id/toggle', authMiddleware, requireRole('admin'), authController.toggleUsuarioActivo);

module.exports = router;
