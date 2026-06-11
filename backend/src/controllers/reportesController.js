/**
 * MonitoreoRS Sucre — reportesController.js
 * Resumen KPIs y generación de PDFs con PDFKit
 */

const pool = require('../config/db');
const PDFDocument = require('pdfkit');

const COLOR_PRIMARY = '#1B5E20';
const COLOR_GRAY = '#616161';
const COLOR_DARK = '#212121';

// GET /api/reportes/resumen
const getResumen = async (req, res) => {
  try {
    const [[{ totalZonas }]] = await pool.query('SELECT COUNT(*) AS totalZonas FROM zonas WHERE activa=1');
    const [[{ totalRutas }]] = await pool.query('SELECT COUNT(*) AS totalRutas FROM rutas_planificadas WHERE activa=1');
    const [[{ totalPuntos }]] = await pool.query('SELECT COUNT(*) AS totalPuntos FROM puntos_criticos WHERE activo=1');
    const [[{ totalAlto }]] = await pool.query("SELECT COUNT(*) AS totalAlto FROM puntos_criticos WHERE activo=1 AND nivel_criticidad='alto'");
    const [[{ totalMes }]] = await pool.query(
      'SELECT COUNT(*) AS totalMes FROM recorridos WHERE MONTH(fecha)=MONTH(NOW()) AND YEAR(fecha)=YEAR(NOW())'
    );

    res.json({
      success: true,
      data: {
        totalZonas,
        totalRutas,
        totalPuntos,
        totalAlto,
        totalMes
      }
    });
  } catch (err) {
    console.error('Error getResumen:', err);
    res.status(500).json({ success: false, error: 'Error al obtener resumen' });
  }
};

// GET /api/reportes/ultimos
const getUltimosRecorridos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, rp.nombre AS ruta, r.fecha, r.hora_inicio, r.hora_fin,
             r.estado, r.porcentaje_cumplimiento, r.observaciones
      FROM recorridos r
      JOIN rutas_planificadas rp ON rp.id = r.ruta_id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener recorridos' });
  }
};

// GET /api/reportes/pdf?tipo=1&desde=YYYY-MM-DD&hasta=YYYY-MM-DD
const generarPDF = async (req, res) => {
  const { tipo = '1', desde, hasta } = req.query;
  const fechaDesde = desde || '2026-01-01';
  const fechaHasta = hasta || new Date().toISOString().split('T')[0];
  const fechaGen = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });

  const tipoNombres = {
    '1': 'Resumen de Cobertura por Zona',
    '2': 'Puntos Críticos por Zona',
    '3': 'Historial de Recorridos',
    '4': 'Notificaciones y Alertas'
  };

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="reporte-tipo${tipo}-${fechaDesde}-${fechaHasta}.pdf"`);
  doc.pipe(res);

  // ── Encabezado ──────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 80).fill(COLOR_PRIMARY);
  doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
    .text('MonitoreoRS Sucre', 50, 20, { align: 'left' });
  doc.fontSize(11).font('Helvetica')
    .text('Sistema de Monitoreo y Visualización de Rutas', 50, 44);
  doc.fontSize(10).text(`Generado: ${fechaGen}`, 50, 60);
  doc.moveDown(3);

  // ── Título del reporte ───────────────────────────────────
  doc.fillColor(COLOR_DARK).fontSize(16).font('Helvetica-Bold')
    .text(tipoNombres[tipo] || 'Reporte', { align: 'center' });
  doc.fontSize(11).font('Helvetica').fillColor(COLOR_GRAY)
    .text(`Período: ${fechaDesde} al ${fechaHasta}`, { align: 'center' });
  doc.moveDown(1.5);

  // ── Contenido según tipo ─────────────────────────────────
  try {
    if (tipo === '1') {
      await reporteCoberturaPorZona(doc, fechaDesde, fechaHasta);
    } else if (tipo === '2') {
      await reportePuntosCriticos(doc, fechaDesde, fechaHasta);
    } else if (tipo === '3') {
      await reporteHistorialRecorridos(doc, fechaDesde, fechaHasta);
    } else if (tipo === '4') {
      await reporteNotificaciones(doc, fechaDesde, fechaHasta);
    }
  } catch (err) {
    console.error('Error generando PDF contenido:', err);
    doc.fillColor('red').text('Error al generar contenido del reporte.');
  }

  // ── Pie de página ────────────────────────────────────────
  const pageBottom = doc.page.height - 40;
  doc.fontSize(9).fillColor(COLOR_GRAY).font('Helvetica')
    .text(
      'Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca — Ingeniería en Sistemas',
      50, pageBottom, { align: 'center', width: doc.page.width - 100 }
    );

  doc.end();
};

// ── Helpers de contenido PDF ──────────────────────────────

async function reporteCoberturaPorZona(doc, desde, hasta) {
  const [zonas] = await pool.query('SELECT id, nombre FROM zonas WHERE activa=1 ORDER BY id');
  
  drawTableHeader(doc, ['Zona', 'Rutas', 'Recorridos', 'Prom. Cumplimiento']);
  let y = doc.y;

  for (const zona of zonas) {
    const [[{ rutas }]] = await pool.query('SELECT COUNT(*) AS rutas FROM rutas_planificadas WHERE zona_id=? AND activa=1', [zona.id]);
    const [[{ recorridos, prom }]] = await pool.query(
      `SELECT COUNT(*) AS recorridos, IFNULL(AVG(r.porcentaje_cumplimiento),0) AS prom
       FROM recorridos r JOIN rutas_planificadas rp ON rp.id=r.ruta_id
       WHERE rp.zona_id=? AND r.fecha BETWEEN ? AND ?`,
      [zona.id, desde, hasta]
    );
    drawTableRow(doc, [zona.nombre, rutas, recorridos, `${parseFloat(prom).toFixed(1)}%`], y);
    y += 22;
  }
}

async function reportePuntosCriticos(doc, desde, hasta) {
  const [puntos] = await pool.query(`
    SELECT pc.nombre, z.nombre AS zona, pc.tipo, pc.nivel_criticidad, pc.fecha_registro
    FROM puntos_criticos pc JOIN zonas z ON z.id=pc.zona_id
    WHERE pc.activo=1 ORDER BY pc.nivel_criticidad DESC, z.nombre
  `);

  drawTableHeader(doc, ['Nombre', 'Zona', 'Tipo', 'Nivel', 'Fecha']);
  let y = doc.y;

  for (const p of puntos) {
    const tipo = { acumulacion: 'Acumulación', contenedor_desbordado: 'Contenedor', calle_sin_cobertura: 'Sin cobertura', otro: 'Otro' }[p.tipo] || p.tipo;
    drawTableRow(doc, [truncate(p.nombre, 22), truncate(p.zona, 16), tipo, p.nivel_criticidad, p.fecha_registro?.toISOString?.().split('T')[0] || p.fecha_registro || '—'], y);
    y += 22;
    if (y > doc.page.height - 80) { doc.addPage(); y = 80; }
  }
}

async function reporteHistorialRecorridos(doc, desde, hasta) {
  const [recorridos] = await pool.query(`
    SELECT rp.nombre AS ruta, r.fecha, r.hora_inicio, r.hora_fin, r.estado, r.porcentaje_cumplimiento
    FROM recorridos r JOIN rutas_planificadas rp ON rp.id=r.ruta_id
    WHERE r.fecha BETWEEN ? AND ?
    ORDER BY r.fecha DESC
  `, [desde, hasta]);

  drawTableHeader(doc, ['Ruta', 'Fecha', 'H.Inicio', 'H.Fin', 'Estado', 'Cumpl.%']);
  let y = doc.y;

  for (const r of recorridos) {
    drawTableRow(doc, [
      truncate(r.ruta, 20), 
      r.fecha?.toISOString?.().split('T')[0] || r.fecha || '—',
      r.hora_inicio || '—',
      r.hora_fin || '—',
      r.estado,
      `${r.porcentaje_cumplimiento}%`
    ], y);
    y += 22;
    if (y > doc.page.height - 80) { doc.addPage(); y = 80; }
  }
}

async function reporteNotificaciones(doc, desde, hasta) {
  const [notifs] = await pool.query(`
    SELECT n.tipo, n.titulo, n.mensaje, n.leida, n.created_at
    FROM notificaciones n
    WHERE DATE(n.created_at) BETWEEN ? AND ?
    ORDER BY n.created_at DESC
  `, [desde, hasta]);

  drawTableHeader(doc, ['Tipo', 'Título', 'Leída', 'Fecha']);
  let y = doc.y;

  for (const n of notifs) {
    drawTableRow(doc, [
      n.tipo,
      truncate(n.titulo, 30),
      n.leida ? 'Sí' : 'No',
      n.created_at?.toISOString?.().split('T')[0] || '—'
    ], y);
    y += 22;
    if (y > doc.page.height - 80) { doc.addPage(); y = 80; }
  }
}

function drawTableHeader(doc, cols) {
  const colW = (doc.page.width - 100) / cols.length;
  const x0 = 50;
  const y = doc.y;
  const h = 24;

  doc.rect(x0, y, doc.page.width - 100, h).fill(COLOR_PRIMARY);
  cols.forEach((col, i) => {
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
      .text(col, x0 + i * colW + 4, y + 7, { width: colW - 8, ellipsis: true });
  });
  doc.y = y + h;
}

function drawTableRow(doc, cells, y) {
  const colW = (doc.page.width - 100) / cells.length;
  const x0 = 50;
  const h = 22;

  doc.rect(x0, y, doc.page.width - 100, h).stroke('#EEEEEE');
  cells.forEach((cell, i) => {
    doc.fillColor(COLOR_GRAY).fontSize(9).font('Helvetica')
      .text(String(cell ?? '—'), x0 + i * colW + 4, y + 6, { width: colW - 8, ellipsis: true });
  });
}

function truncate(str, max) {
  if (!str) return '—';
  return str.length > max ? str.substring(0, max - 1) + '…' : str;
}

module.exports = { getResumen, getUltimosRecorridos, generarPDF };
