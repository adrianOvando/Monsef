/**
 * MonitoreoRS Sucre — app.js
 * Express application principal
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ── Body Parser ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
const authRoutes           = require('./routes/authRoutes');
const zonasRoutes          = require('./routes/zonasRoutes');
const rutasRoutes          = require('./routes/rutasRoutes');
const puntosRoutes         = require('./routes/puntosRoutes');
const geocercasRoutes      = require('./routes/geocercasRoutes');
const recorridosRoutes     = require('./routes/recorridosRoutes');
const notificacionesRoutes = require('./routes/notificacionesRoutes');
const reportesRoutes       = require('./routes/reportesRoutes');
const horariosRoutes       = require('./routes/horariosRoutes');

app.use('/api/auth',           authRoutes);
app.use('/api/zonas',          zonasRoutes);
app.use('/api/rutas',          rutasRoutes);
app.use('/api/puntos-criticos', puntosRoutes);
app.use('/api/geocercas',      geocercasRoutes);
app.use('/api/recorridos',     recorridosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/reportes',       reportesRoutes);
app.use('/api/horarios',       horariosRoutes);
// Usuarios están montados dentro de authRoutes en /api/usuarios
const { getUsuarios, createUsuario, updateUsuario, toggleUsuarioActivo } = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');

app.get('/api/usuarios',            authMiddleware, requireRole('admin'), getUsuarios);
app.post('/api/usuarios',           authMiddleware, requireRole('admin'), createUsuario);
app.put('/api/usuarios/:id',        authMiddleware, requireRole('admin'), updateUsuario);
app.put('/api/usuarios/:id/toggle', authMiddleware, requireRole('admin'), toggleUsuarioActivo);
app.get('/api/roles', authMiddleware, async (req, res) => {
  const pool = require('./config/db');
  const [rows] = await pool.query('SELECT * FROM roles ORDER BY id');
  res.json({ success: true, data: rows });
});

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

module.exports = app;
