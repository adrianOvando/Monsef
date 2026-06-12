const pool = require('../config/db');

// GET /api/horarios
const getHorarios = async (req, res) => {
  try {
    const query = `
      SELECT ht.id, ht.nombre_tramo, ht.zona_id, ht.descripcion_recorrido,
             ht.dias_recoleccion, ht.horario_manana, ht.horario_tarde,
             ht.observaciones, ht.activo, ht.created_at,
             z.nombre AS zona_nombre
      FROM horarios_tramos ht
      LEFT JOIN zonas z ON z.id = ht.zona_id
      ORDER BY ht.id ASC
    `;
    const [rows] = await pool.query(query);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getHorarios:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// PUT /api/horarios/:id (solo admin)
const updateHorario = async (req, res) => {
  const { id } = req.params;
  const { nombre_tramo, zona_id, descripcion_recorrido, dias_recoleccion, horario_manana, horario_tarde, observaciones, activo } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM horarios_tramos WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Tramo de horario no encontrado' });
    }

    const fields = [];
    const values = [];

    if (nombre_tramo !== undefined) { fields.push('nombre_tramo = ?'); values.push(nombre_tramo.trim()); }
    if (zona_id !== undefined) { fields.push('zona_id = ?'); values.push(zona_id); }
    if (descripcion_recorrido !== undefined) { fields.push('descripcion_recorrido = ?'); values.push(descripcion_recorrido); }
    if (dias_recoleccion !== undefined) { fields.push('dias_recoleccion = ?'); values.push(dias_recoleccion.trim()); }
    if (horario_manana !== undefined) { fields.push('horario_manana = ?'); values.push(horario_manana); }
    if (horario_tarde !== undefined) { fields.push('horario_tarde = ?'); values.push(horario_tarde); }
    if (observaciones !== undefined) { fields.push('observaciones = ?'); values.push(observaciones); }
    if (activo !== undefined) { fields.push('activo = ?'); values.push(activo ? 1 : 0); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No se proporcionaron campos para actualizar' });
    }

    values.push(id);
    await pool.query(`UPDATE horarios_tramos SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(`
      SELECT ht.id, ht.nombre_tramo, ht.zona_id, ht.descripcion_recorrido,
             ht.dias_recoleccion, ht.horario_manana, ht.horario_tarde,
             ht.observaciones, ht.activo, ht.created_at,
             z.nombre AS zona_nombre
      FROM horarios_tramos ht
      LEFT JOIN zonas z ON z.id = ht.zona_id
      WHERE ht.id = ?
    `, [id]);
    return res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error en updateHorario:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = {
  getHorarios,
  updateHorario
};
