const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recorridosController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, ctrl.getRecorridos);
router.get('/:id/verificacion', auth, ctrl.getVerificacion);
router.get('/:id', auth, ctrl.getRecorrido);
router.post('/', auth, ctrl.createRecorrido);

module.exports = router;
