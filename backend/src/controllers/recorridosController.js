const pool = require('../config/db');
const { calcularCumplimiento } = require('../utils/geocerca');

// GET /api/recorridos
const getRecorridos = async (req, res) => {
  try {
    const { ruta_id, fecha_desde, fecha_hasta, estado } = req.query;

    let query = `SELECT rc.id, rc.ruta_id, rc.fecha, rc.hora_inicio, rc.hora_fin,
                        rc.observaciones, rc.estado, rc.porcentaje_cumplimiento, rc.created_at,
                        rp.nombre AS ruta_nombre,
                        z.nombre AS zona_nombre,
                        u.nombre AS usuario_nombre
                 FROM recorridos rc
                 JOIN rutas_planificadas rp ON rp.id = rc.ruta_id
                 JOIN zonas z ON z.id = rp.zona_id
                 LEFT JOIN usuarios u ON u.id = rc.registrado_por
                 WHERE 1=1`;
    const params = [];

    if (ruta_id) { query += ' AND rc.ruta_id = ?'; params.push(ruta_id); }
    if (fecha_desde) { query += ' AND rc.fecha >= ?'; params.push(fecha_desde); }
    if (fecha_hasta) { query += ' AND rc.fecha <= ?'; params.push(fecha_hasta); }
    if (estado) { query += ' AND rc.estado = ?'; params.push(estado); }

    query += ' ORDER BY rc.fecha DESC, rc.hora_inicio DESC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getRecorridos:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// GET /api/recorridos/:id
const getRecorrido = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT rc.id, rc.ruta_id, rc.fecha, rc.hora_inicio, rc.hora_fin,
              rc.observaciones, rc.estado, rc.porcentaje_cumplimiento, rc.created_at,
              rp.nombre AS ruta_nombre,
              z.nombre AS zona_nombre,
              u.nombre AS usuario_nombre
       FROM recorridos rc
       JOIN rutas_planificadas rp ON rp.id = rc.ruta_id
       JOIN zonas z ON z.id = rp.zona_id
       LEFT JOIN usuarios u ON u.id = rc.registrado_por
       WHERE rc.id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Recorrido no encontrado' });
    }

    const [coordenadas] = await pool.query(
      `SELECT id, lat, lng, timestamp_registro, dentro_geocerca, orden
       FROM coordenadas_recorrido
       WHERE recorrido_id = ?
       ORDER BY orden ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: { ...rows[0], coordenadas },
    });
  } catch (error) {
    console.error('Error en getRecorrido:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// POST /api/recorridos
const createRecorrido = async (req, res) => {
  const {
    ruta_id, fecha, hora_inicio, hora_fin, observaciones, coordenadas = [],
  } = req.body;

  if (!ruta_id) return res.status(400).json({ success: false, error: 'ruta_id es requerido' });
  if (!fecha) return res.status(400).json({ success: false, error: 'fecha es requerida' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Find geocerca for ruta_id
    const [geocercaRows] = await conn.query(
      'SELECT id, poligono_json FROM geocercas WHERE ruta_id = ? AND activa = 1 LIMIT 1',
      [ruta_id]
    );

    let porcentajeCumplimiento = 0;
    let detalles = [];

    if (geocercaRows.length > 0 && coordenadas.length > 0) {
      const poligono =
        typeof geocercaRows[0].poligono_json === 'string'
          ? JSON.parse(geocercaRows[0].poligono_json)
          : geocercaRows[0].poligono_json;

      const resultado = calcularCumplimiento(coordenadas, poligono);
      porcentajeCumplimiento = resultado.porcentaje;
      detalles = resultado.detalles;
    }

    const estado = porcentajeCumplimiento >= 80 ? 'completado' : 'desviacion_detectada';
    const usuarioId = req.usuario ? req.usuario.id : null;

    // 5. Insert recorrido
    const [result] = await conn.query(
      `INSERT INTO recorridos (ruta_id, registrado_por, fecha, hora_inicio, hora_fin, observaciones, estado, porcentaje_cumplimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ruta_id, usuarioId, fecha, hora_inicio || null, hora_fin || null, observaciones || null, estado, porcentajeCumplimiento]
    );
    const recorridoId = result.insertId;

    // 6. Insert coordenadas_recorrido
    if (coordenadas.length > 0) {
      const coordValues = coordenadas.map((c, idx) => {
        const detalle = detalles[idx];
        const dentroGeocerca = detalle ? (detalle.dentro_geocerca ? 1 : 0) : 1;
        return [recorridoId, idx + 1, parseFloat(c.lat), parseFloat(c.lng), dentroGeocerca];
      });

      await conn.query(
        `INSERT INTO coordenadas_recorrido (recorrido_id, orden, lat, lng, dentro_geocerca) VALUES ?`,
        [coordValues]
      );
    }

    // 7. Create notification if below threshold
    if (porcentajeCumplimiento < 80 && usuarioId) {
      await conn.query(
        `INSERT INTO notificaciones (usuario_id, recorrido_id, tipo, titulo, mensaje, leida)
         VALUES (?, ?, 'desviacion_ruta', ?, ?, 0)`,
        [
          usuarioId,
          recorridoId,
          `Desviación detectada en recorrido del ${fecha}`,
          `El recorrido registrado el ${fecha} tuvo un cumplimiento del ${porcentajeCumplimiento.toFixed(1)}%, por debajo del umbral del 80%.`
        ]
      );
    }

    await conn.commit();

    // 8. Return full result
    const [recorrido] = await conn.query(
      `SELECT rc.id, rc.ruta_id, rc.fecha, rc.hora_inicio, rc.hora_fin,
              rc.observaciones, rc.estado, rc.porcentaje_cumplimiento, rc.created_at,
              rp.nombre AS ruta_nombre
       FROM recorridos rc
       JOIN rutas_planificadas rp ON rp.id = rc.ruta_id
       WHERE rc.id = ?`,
      [recorridoId]
    );

    const [coordsInserted] = await conn.query(
      `SELECT id, lat, lng, timestamp_registro, dentro_geocerca, orden
       FROM coordenadas_recorrido WHERE recorrido_id = ? ORDER BY orden ASC`,
      [recorridoId]
    );

    return res.status(201).json({
      success: true,
      data: { ...recorrido[0], coordenadas: coordsInserted, porcentaje: porcentajeCumplimiento, estado },
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error en createRecorrido:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
};

// GET /api/recorridos/:id/verificacion
const getVerificacion = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT rc.id, rc.ruta_id, rc.fecha, rc.estado, rc.porcentaje_cumplimiento,
              rp.nombre AS ruta_nombre
       FROM recorridos rc
       JOIN rutas_planificadas rp ON rp.id = rc.ruta_id
       WHERE rc.id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Recorrido no encontrado' });
    }

    const [coordenadas] = await pool.query(
      `SELECT id, lat, lng, timestamp_registro, dentro_geocerca, orden
       FROM coordenadas_recorrido WHERE recorrido_id = ? ORDER BY orden ASC`,
      [id]
    );

    const totalPuntos = coordenadas.length;
    const puntosDentro = coordenadas.filter((c) => c.dentro_geocerca).length;

    return res.status(200).json({
      success: true,
      data: {
        recorrido: rows[0],
        verificacion: {
          total_puntos: totalPuntos,
          puntos_dentro: puntosDentro,
          puntos_fuera: totalPuntos - puntosDentro,
          porcentaje_cumplimiento: rows[0].porcentaje_cumplimiento,
          estado: rows[0].estado,
          cumple_umbral: rows[0].porcentaje_cumplimiento >= 80,
        },
        coordenadas,
      },
    });
  } catch (error) {
    console.error('Error en getVerificacion:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = { getRecorridos, getRecorrido, createRecorrido, getVerificacion };
