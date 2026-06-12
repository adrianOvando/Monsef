const express = require('express');
const router = express.Router();
const { getHorarios, updateHorario } = require('../controllers/horariosController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getHorarios);
router.put('/:id', authMiddleware, requireRole('admin'), updateHorario);

module.exports = router;
