const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

// ──────────────────────────────────────────────
// Validation rules (exported for route use)
// ──────────────────────────────────────────────
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

const createUsuarioValidation = [
  body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol_id').isInt({ min: 1 }).withMessage('rol_id debe ser un entero positivo'),
];

// ──────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, error: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.password_hash, u.activo,
              r.nombre AS rol, r.id AS rol_id
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ success: false, error: 'Usuario inactivo' });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      rol_id: usuario.rol_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    return res.status(200).json({
      success: true,
      data: {
        token,
        usuario: payload,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// GET /api/auth/me
// ──────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.activo, u.created_at,
              r.nombre AS rol, r.id AS rol_id
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?
       LIMIT 1`,
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en me:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// GET /api/usuarios  [admin]
// ──────────────────────────────────────────────
const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.activo, u.created_at,
              r.nombre AS rol, r.id AS rol_id
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       ORDER BY u.created_at DESC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// POST /api/usuarios  [admin]
// ──────────────────────────────────────────────
const createUsuario = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, error: errors.array()[0].msg });
  }

  const { nombre, email, password, rol_id } = req.body;

  try {
    // Check for duplicate email
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo) VALUES (?, ?, ?, ?, 1)',
      [nombre, email, hashedPassword, rol_id]
    );

    const [newUser] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.activo, u.created_at,
              r.nombre AS rol, r.id AS rol_id
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, data: newUser[0] });
  } catch (error) {
    console.error('Error en createUsuario:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// PUT /api/usuarios/:id  [admin]
// ──────────────────────────────────────────────
const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol_id } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Check email uniqueness if updating email
    if (email) {
      const [emailCheck] = await pool.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ? LIMIT 1',
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({ success: false, error: 'El email ya está en uso' });
      }
    }

    const fields = [];
    const values = [];

    if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (rol_id !== undefined) { fields.push('rol_id = ?'); values.push(rol_id); }
    if (password !== undefined) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push('password_hash = ?');
      values.push(hashed);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No se proporcionaron campos para actualizar' });
    }

    values.push(id);
    await pool.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.activo, u.created_at,
              r.nombre AS rol, r.id AS rol_id
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.id = ?`,
      [id]
    );

    return res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error en updateUsuario:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// ──────────────────────────────────────────────
// PUT /api/usuarios/:id/toggle  [admin]
// ──────────────────────────────────────────────
const toggleUsuarioActivo = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT id, activo FROM usuarios WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const nuevoEstado = rows[0].activo ? 0 : 1;
    await pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [nuevoEstado, id]);

    return res.status(200).json({
      success: true,
      data: { id: parseInt(id), activo: nuevoEstado === 1 },
    });
  } catch (error) {
    console.error('Error en toggleUsuarioActivo:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = {
  loginValidation,
  createUsuarioValidation,
  login,
  me,
  getUsuarios,
  createUsuario,
  updateUsuario,
  toggleUsuarioActivo,
};
