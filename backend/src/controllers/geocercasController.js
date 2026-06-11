const pool = require('../config/db');

// GET /api/geocercas
const getGeocercas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT g.id, g.ruta_id, g.nombre, g.radio_metros, g.poligono_json, g.activa, g.created_at,
              rp.nombre AS ruta_nombre,
              z.nombre AS zona_nombre
       FROM geocercas g
       JOIN rutas_planificadas rp ON rp.id = g.ruta_id
       JOIN zonas z ON z.id = rp.zona_id
       ORDER BY rp.nombre ASC`
    );

    const data = rows.map((row) => ({
      ...row,
      poligono_json: typeof row.poligono_json === 'string' ? JSON.parse(row.poligono_json) : row.poligono_json,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error en getGeocercas:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// GET /api/geocercas/ruta/:ruta_id
const getGeocercaByRuta = async (req, res) => {
  const { ruta_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT g.id, g.ruta_id, g.nombre, g.radio_metros, g.poligono_json, g.activa, g.created_at,
              rp.nombre AS ruta_nombre
       FROM geocercas g
       JOIN rutas_planificadas rp ON rp.id = g.ruta_id
       WHERE g.ruta_id = ? AND g.activa = 1
       LIMIT 1`,
      [ruta_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Geocerca no encontrada para esta ruta' });
    }

    const geocerca = {
      ...rows[0],
      poligono_json: typeof rows[0].poligono_json === 'string' ? JSON.parse(rows[0].poligono_json) : rows[0].poligono_json,
    };

    return res.status(200).json({ success: true, data: geocerca });
  } catch (error) {
    console.error('Error en getGeocercaByRuta:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// POST /api/geocercas [admin]
const createGeocerca = async (req, res) => {
  const { ruta_id, nombre, radio_metros = 100, poligono_json } = req.body;

  if (!ruta_id) return res.status(400).json({ success: false, error: 'ruta_id es requerido' });
  if (!nombre) return res.status(400).json({ success: false, error: 'nombre es requerido' });

  let poligonoArr = poligono_json;
  if (typeof poligono_json === 'string') {
    try { poligonoArr = JSON.parse(poligono_json); } catch { return res.status(400).json({ success: false, error: 'poligono_json inválido' }); }
  }
  if (!Array.isArray(poligonoArr) || poligonoArr.length < 3) {
    return res.status(400).json({ success: false, error: 'poligono_json debe tener al menos 3 coordenadas' });
  }

  try {
    const poligonoStr = JSON.stringify(poligonoArr);
    const [result] = await pool.query(
      'INSERT INTO geocercas (ruta_id, nombre, radio_metros, poligono_json, activa) VALUES (?, ?, ?, ?, 1)',
      [ruta_id, nombre, radio_metros, poligonoStr]
    );

    const [newGeocerca] = await pool.query(
      `SELECT g.id, g.ruta_id, g.nombre, g.radio_metros, g.poligono_json, g.activa, g.created_at,
              rp.nombre AS ruta_nombre
       FROM geocercas g JOIN rutas_planificadas rp ON rp.id = g.ruta_id WHERE g.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: { ...newGeocerca[0], poligono_json: JSON.parse(newGeocerca[0].poligono_json) },
    });
  } catch (error) {
    console.error('Error en createGeocerca:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// PUT /api/geocercas/:id/toggle [admin]
const toggleGeocercaActiva = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, activa FROM geocercas WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Geocerca no encontrada' });
    const nuevoEstado = rows[0].activa ? 0 : 1;
    await pool.query('UPDATE geocercas SET activa = ? WHERE id = ?', [nuevoEstado, id]);
    return res.status(200).json({ success: true, data: { id: parseInt(id), activa: nuevoEstado === 1 } });
  } catch (error) {
    console.error('Error en toggleGeocercaActiva:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = { getGeocercas, getGeocercaByRuta, createGeocerca, toggleGeocercaActiva };
