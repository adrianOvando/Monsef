const express = require('express');
const router = express.Router();
const rpt = require('../controllers/reportesController');
const auth = require('../middleware/authMiddleware');

router.get('/resumen', auth, rpt.getResumen);
router.get('/ultimos', auth, rpt.getUltimosRecorridos);
router.get('/pdf', auth, rpt.generarPDF);

module.exports = router;
