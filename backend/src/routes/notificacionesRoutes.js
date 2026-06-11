const express = require('express');
const router = express.Router();
const notif = require('../controllers/notificacionesController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, notif.getNotificaciones);
router.put('/leer-todas', auth, notif.marcarTodasLeidas);
router.put('/:id/leer', auth, notif.marcarLeida);

module.exports = router;
