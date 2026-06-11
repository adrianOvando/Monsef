/**
 * MonitoreoRS Sucre — notificacionesController.js
 */

const pool = require('../config/db');

// GET /api/notificaciones
const getNotificaciones = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { leida } = req.query;

  try {
    let query = `
      SELECT n.*, rp.nombre AS ruta_nombre
      FROM notificaciones n
      LEFT JOIN recorridos r ON r.id = n.recorrido_id
      LEFT JOIN rutas_planificadas rp ON rp.id = r.ruta_id
      WHERE (n.usuario_id = ? OR n.usuario_id IS NULL)
    `;
    const params = [usuarioId];

    if (leida !== undefined) {
      query += ' AND n.leida = ?';
      params.push(parseInt(leida));
    }

    query += ' ORDER BY n.created_at DESC LIMIT 50';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error getNotificaciones:', err);
    res.status(500).json({ success: false, error: 'Error al obtener notificaciones' });
  }
};

// PUT /api/notificaciones/:id/leer
const marcarLeida = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notificaciones SET leida = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al actualizar notificación' });
  }
};

// PUT /api/notificaciones/leer-todas
const marcarTodasLeidas = async (req, res) => {
  const usuarioId = req.usuario.id;
  try {
    await pool.query(
      'UPDATE notificaciones SET leida = 1 WHERE (usuario_id = ? OR usuario_id IS NULL) AND leida = 0',
      [usuarioId]
    );
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al actualizar notificaciones' });
  }
};

module.exports = { getNotificaciones, marcarLeida, marcarTodasLeidas };
