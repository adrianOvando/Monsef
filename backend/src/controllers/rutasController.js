const pool = require('../config/db');

// GET /api/rutas
const getRutas = async (req, res) => {
  try {
    const { zona_id } = req.query;
    let query = `SELECT rp.id, rp.nombre, rp.descripcion, rp.frecuencia, rp.horario_estimado,
                        rp.distancia_km, rp.activa, rp.tipo, rp.created_at,
                        z.id AS zona_id, z.nombre AS zona_nombre,
                        COUNT(DISTINCT pr.id) AS total_puntos
                 FROM rutas_planificadas rp
                 JOIN zonas z ON z.id = rp.zona_id
                 LEFT JOIN puntos_ruta pr ON pr.ruta_id = rp.id`;
    const params = [];

    if (zona_id) {
      query += ' WHERE rp.zona_id = ?';
      params.push(zona_id);
    }

    query += ' GROUP BY rp.id ORDER BY z.nombre ASC, rp.nombre ASC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getRutas:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// GET /api/rutas/:id
const getRuta = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT rp.id, rp.nombre, rp.descripcion, rp.frecuencia, rp.horario_estimado,
              rp.distancia_km, rp.activa, rp.tipo, rp.created_at,
              z.id AS zona_id, z.nombre AS zona_nombre
       FROM rutas_planificadas rp
       JOIN zonas z ON z.id = rp.zona_id
       WHERE rp.id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    }

    const [puntos] = await pool.query(
      'SELECT id, lat, lng, orden, descripcion FROM puntos_ruta WHERE ruta_id = ? ORDER BY orden ASC',
      [id]
    );

    return res.status(200).json({ success: true, data: { ...rows[0], puntos_ruta: puntos } });
  } catch (error) {
    console.error('Error en getRuta:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// GET /api/rutas/:id/puntos
const getPuntosRuta = async (req, res) => {
  const { id } = req.params;
  try {
    const [ruta] = await pool.query('SELECT id FROM rutas_planificadas WHERE id = ? LIMIT 1', [id]);
    if (ruta.length === 0) {
      return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    }

    const [puntos] = await pool.query(
      'SELECT id, ruta_id, lat, lng, orden, descripcion FROM puntos_ruta WHERE ruta_id = ? ORDER BY orden ASC',
      [id]
    );

    return res.status(200).json({ success: true, data: puntos });
  } catch (error) {
    console.error('Error en getPuntosRuta:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// POST /api/rutas [admin]
const createRuta = async (req, res) => {
  const { nombre, descripcion, zona_id, frecuencia, horario_estimado, distancia_km, activa = 1, puntos_ruta = [] } = req.body;

  if (!nombre || !zona_id) {
    return res.status(400).json({ success: false, error: 'nombre y zona_id son requeridos' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO rutas_planificadas (nombre, descripcion, zona_id, frecuencia, horario_estimado, distancia_km, activa) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre.trim(), descripcion || null, zona_id, frecuencia || null, horario_estimado || null, distancia_km || null, activa ? 1 : 0]
    );
    const rutaId = result.insertId;

    if (puntos_ruta.length > 0) {
      const puntoValues = puntos_ruta.map((p, idx) => [
        rutaId, p.orden ?? idx + 1, parseFloat(p.lat ?? p.latitud), parseFloat(p.lng ?? p.longitud), p.descripcion || null
      ]);
      await conn.query('INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES ?', [puntoValues]);
    }

    await conn.commit();

    const [newRuta] = await conn.query(
      `SELECT rp.id, rp.nombre, rp.descripcion, rp.frecuencia, rp.horario_estimado, rp.distancia_km, rp.activa, rp.created_at,
              z.id AS zona_id, z.nombre AS zona_nombre
       FROM rutas_planificadas rp JOIN zonas z ON z.id = rp.zona_id WHERE rp.id = ?`,
      [rutaId]
    );

    const [puntos] = await conn.query(
      'SELECT id, lat, lng, orden, descripcion FROM puntos_ruta WHERE ruta_id = ? ORDER BY orden ASC',
      [rutaId]
    );

    return res.status(201).json({ success: true, data: { ...newRuta[0], puntos_ruta: puntos } });
  } catch (error) {
    await conn.rollback();
    console.error('Error en createRuta:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
};

// PUT /api/rutas/:id [admin]
const updateRuta = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, zona_id, frecuencia, horario_estimado, distancia_km, puntos_ruta } = req.body;

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT id FROM rutas_planificadas WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      conn.release();
      return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    }

    await conn.beginTransaction();

    const fields = [], values = [];
    if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre.trim()); }
    if (descripcion !== undefined) { fields.push('descripcion = ?'); values.push(descripcion); }
    if (zona_id !== undefined) { fields.push('zona_id = ?'); values.push(zona_id); }
    if (frecuencia !== undefined) { fields.push('frecuencia = ?'); values.push(frecuencia); }
    if (horario_estimado !== undefined) { fields.push('horario_estimado = ?'); values.push(horario_estimado); }
    if (distancia_km !== undefined) { fields.push('distancia_km = ?'); values.push(distancia_km); }

    if (fields.length > 0) {
      values.push(id);
      await conn.query(`UPDATE rutas_planificadas SET ${fields.join(', ')}, updated_at=NOW() WHERE id = ?`, values);
    }

    if (Array.isArray(puntos_ruta)) {
      await conn.query('DELETE FROM puntos_ruta WHERE ruta_id = ?', [id]);
      if (puntos_ruta.length > 0) {
        const puntoValues = puntos_ruta.map((p, idx) => [
          id, p.orden ?? idx + 1, parseFloat(p.lat ?? p.latitud), parseFloat(p.lng ?? p.longitud), p.descripcion || null
        ]);
        await conn.query('INSERT INTO puntos_ruta (ruta_id, orden, lat, lng, descripcion) VALUES ?', [puntoValues]);
      }
    }

    await conn.commit();

    const [updated] = await conn.query(
      `SELECT rp.id, rp.nombre, rp.descripcion, rp.frecuencia, rp.horario_estimado, rp.distancia_km, rp.activa, rp.created_at,
              z.id AS zona_id, z.nombre AS zona_nombre
       FROM rutas_planificadas rp JOIN zonas z ON z.id = rp.zona_id WHERE rp.id = ?`,
      [id]
    );

    const [puntos] = await conn.query(
      'SELECT id, lat, lng, orden, descripcion FROM puntos_ruta WHERE ruta_id = ? ORDER BY orden ASC',
      [id]
    );

    return res.status(200).json({ success: true, data: { ...updated[0], puntos_ruta: puntos } });
  } catch (error) {
    await conn.rollback();
    console.error('Error en updateRuta:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
};

// PUT /api/rutas/:id/toggle [admin]
const toggleRutaActiva = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, activa FROM rutas_planificadas WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    }
    const nuevoEstado = rows[0].activa ? 0 : 1;
    await pool.query('UPDATE rutas_planificadas SET activa = ?, updated_at=NOW() WHERE id = ?', [nuevoEstado, id]);
    return res.status(200).json({ success: true, data: { id: parseInt(id), activa: nuevoEstado === 1 } });
  } catch (error) {
    console.error('Error en toggleRutaActiva:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = { getRutas, getRuta, getPuntosRuta, createRuta, updateRuta, toggleRutaActiva };
