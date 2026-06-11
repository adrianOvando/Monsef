const pool = require('../config/db');

// ──────────────────────────────────────────────
// GET /api/zonas
// Optional: ?activa=1
// ──────────────────────────────────────────────
const getZonas = async (req, res) => {
  try {
    const { activa } = req.query;
    let query = `SELECT z.id, z.nombre, z.descripcion, z.activa, z.lat_referencia, z.lng_referencia, z.created_at,
                        COUNT(DISTINCT rp.id) AS total_rutas,
                        COUNT(DISTINCT pc.id) AS total_puntos_criticos
                 FROM zonas z
                 LEFT JOIN rutas_planificadas rp ON rp.zona_id = z.id
                 LEFT JOIN puntos_criticos pc ON pc.zona_id = z.id`;
    const params = [];

    if (activa !== undefined) {
      query += ' WHERE z.activa = ?';
      params.push(activa === '1' || activa === 'true' ? 1 : 0);
    }

    query += ' GROUP BY z.id ORDER BY z.nombre ASC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getZonas:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// GET /api/zonas/:id
// ──────────────────────────────────────────────
const getZona = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT z.id, z.nombre, z.descripcion, z.activa, z.lat_referencia, z.lng_referencia, z.created_at,
              COUNT(DISTINCT rp.id) AS total_rutas,
              COUNT(DISTINCT pc.id) AS total_puntos_criticos
       FROM zonas z
       LEFT JOIN rutas_planificadas rp ON rp.zona_id = z.id
       LEFT JOIN puntos_criticos pc ON pc.zona_id = z.id
       WHERE z.id = ?
       GROUP BY z.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Zona no encontrada' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en getZona:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// POST /api/zonas  [admin]
// ──────────────────────────────────────────────
const createZona = async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ success: false, error: 'El nombre de la zona es requerido' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO zonas (nombre, descripcion, activa) VALUES (?, ?, 1)',
      [nombre.trim(), descripcion || null]
    );

    const [newZona] = await pool.query('SELECT * FROM zonas WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, data: newZona[0] });
  } catch (error) {
    console.error('Error en createZona:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// PUT /api/zonas/:id  [admin]
// ──────────────────────────────────────────────
const updateZona = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM zonas WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Zona no encontrada' });
    }

    const fields = [];
    const values = [];

    if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre.trim()); }
    if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No se proporcionaron campos para actualizar' });
    }

    values.push(id);
    await pool.query(`UPDATE zonas SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM zonas WHERE id = ?', [id]);
    return res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error en updateZona:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// PUT /api/zonas/:id/toggle  [admin]
// ──────────────────────────────────────────────
const toggleZonaActiva = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT id, activa FROM zonas WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Zona no encontrada' });
    }

    const nuevoEstado = rows[0].activa ? 0 : 1;
    await pool.query('UPDATE zonas SET activa = ? WHERE id = ?', [nuevoEstado, id]);

    return res.status(200).json({
      success: true,
      data: { id: parseInt(id), activa: nuevoEstado === 1 },
    });
  } catch (error) {
    console.error('Error en toggleZonaActiva:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = {
  getZonas,
  getZona,
  createZona,
  updateZona,
  toggleZonaActiva,
};
