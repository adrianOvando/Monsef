const pool = require('../config/db');

// GET /api/puntos-criticos
const getPuntos = async (req, res) => {
  try {
    const { zona_id, tipo, nivel_criticidad } = req.query;

    let query = `SELECT pc.id, pc.nombre, pc.descripcion, pc.lat, pc.lng,
                        pc.tipo, pc.nivel_criticidad, pc.activo, pc.created_at, pc.fecha_registro,
                        z.id AS zona_id, z.nombre AS zona_nombre
                 FROM puntos_criticos pc
                 JOIN zonas z ON z.id = pc.zona_id
                 WHERE 1=1`;
    const params = [];

    if (zona_id) { query += ' AND pc.zona_id = ?'; params.push(zona_id); }
    if (tipo) { query += ' AND pc.tipo = ?'; params.push(tipo); }
    if (nivel_criticidad) { query += ' AND pc.nivel_criticidad = ?'; params.push(nivel_criticidad); }

    query += ' ORDER BY FIELD(pc.nivel_criticidad,"alto","medio","bajo"), pc.nombre ASC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getPuntos:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// GET /api/puntos-criticos/:id
const getPunto = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT pc.id, pc.nombre, pc.descripcion, pc.lat, pc.lng,
              pc.tipo, pc.nivel_criticidad, pc.activo, pc.created_at, pc.fecha_registro,
              z.id AS zona_id, z.nombre AS zona_nombre
       FROM puntos_criticos pc
       JOIN zonas z ON z.id = pc.zona_id
       WHERE pc.id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Punto crítico no encontrado' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en getPunto:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// POST /api/puntos-criticos [admin, supervisor]
const createPunto = async (req, res) => {
  const { nombre, descripcion, lat, lng, tipo, nivel_criticidad, zona_id, fecha_registro } = req.body;

  if (!nombre?.trim()) return res.status(400).json({ success: false, error: 'nombre es requerido' });
  if (lat === undefined || lng === undefined) return res.status(400).json({ success: false, error: 'lat y lng son requeridos' });
  if (!zona_id) return res.status(400).json({ success: false, error: 'zona_id es requerido' });

  try {
    const [result] = await pool.query(
      `INSERT INTO puntos_criticos (nombre, descripcion, lat, lng, tipo, nivel_criticidad, zona_id, activo, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [nombre.trim(), descripcion || null, lat, lng, tipo || 'otro', nivel_criticidad || 'medio', zona_id, fecha_registro || null]
    );

    const [newPunto] = await pool.query(
      `SELECT pc.id, pc.nombre, pc.descripcion, pc.lat, pc.lng, pc.tipo, pc.nivel_criticidad, pc.activo, pc.created_at, pc.fecha_registro, z.id AS zona_id, z.nombre AS zona_nombre
       FROM puntos_criticos pc JOIN zonas z ON z.id = pc.zona_id WHERE pc.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, data: newPunto[0] });
  } catch (error) {
    console.error('Error en createPunto:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// PUT /api/puntos-criticos/:id [admin, supervisor]
const updatePunto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, lat, lng, tipo, nivel_criticidad, zona_id, activo, fecha_registro } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM puntos_criticos WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Punto no encontrado' });

    const fields = [], values = [];
    if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre.trim()); }
    if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion); }
    if (lat !== undefined) { fields.push('lat = ?'); values.push(lat); }
    if (lng !== undefined) { fields.push('lng = ?'); values.push(lng); }
    if (tipo !== undefined) { fields.push('tipo = ?'); values.push(tipo); }
    if (nivel_criticidad !== undefined) { fields.push('nivel_criticidad = ?'); values.push(nivel_criticidad); }
    if (zona_id !== undefined) { fields.push('zona_id = ?'); values.push(zona_id); }
    if (activo !== undefined) { fields.push('activo = ?'); values.push(activo ? 1 : 0); }
    if (fecha_registro !== undefined) { fields.push('fecha_registro = ?'); values.push(fecha_registro); }

    if (fields.length === 0) return res.status(400).json({ success: false, error: 'Sin campos para actualizar' });

    values.push(id);
    await pool.query(`UPDATE puntos_criticos SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(
      `SELECT pc.id, pc.nombre, pc.descripcion, pc.lat, pc.lng, pc.tipo, pc.nivel_criticidad, pc.activo, pc.created_at, pc.fecha_registro, z.id AS zona_id, z.nombre AS zona_nombre
       FROM puntos_criticos pc JOIN zonas z ON z.id = pc.zona_id WHERE pc.id = ?`,
      [id]
    );

    return res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error en updatePunto:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// DELETE /api/puntos-criticos/:id [admin]
const deletePunto = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query('SELECT id FROM puntos_criticos WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Punto no encontrado' });
    await pool.query('DELETE FROM puntos_criticos WHERE id = ?', [id]);
    return res.status(200).json({ success: true, data: { message: 'Punto eliminado' } });
  } catch (error) {
    console.error('Error en deletePunto:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = { getPuntos, getPunto, createPunto, updatePunto, deletePunto };
