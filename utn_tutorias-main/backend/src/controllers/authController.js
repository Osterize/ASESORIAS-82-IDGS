const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, uuid: user.uuid, rol: user.rol, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, uuid, nombre, apellido_paterno, apellido_materno, email, 
              password_hash, rol, numero_control, numero_empleado, carrera, semestre, activo
       FROM usuarios WHERE email = ? LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];
    if (!user.activo) {
      return res.status(403).json({ success: false, message: 'Cuenta desactivada. Contacta al administrador.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    // Audit log
    await pool.query(
      'INSERT INTO audit_log (usuario_id, accion, ip_address) VALUES (?, ?, ?)',
      [user.id, 'LOGIN', req.ip]
    );

    const token = generateToken(user);
    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/auth/register (solo admin puede registrar)
const register = async (req, res) => {
  const {
    nombre, apellido_paterno, apellido_materno, email, password,
    rol, numero_control, numero_empleado, carrera, semestre
  } = req.body;

  const requiredFields = [nombre, apellido_paterno, email, password, rol];
  if (requiredFields.some(f => !f)) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  const rolesValidos = ['alumno', 'docente', 'administrador'];
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ success: false, message: 'Rol inválido' });
  }

  try {
    const [exists] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase()]);
    if (exists.length) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 12);
    const uuid = uuidv4();

    const [result] = await pool.query(
      `INSERT INTO usuarios 
       (uuid, nombre, apellido_paterno, apellido_materno, email, password_hash, rol, numero_control, numero_empleado, carrera, semestre)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid, nombre.trim(), apellido_paterno.trim(), apellido_materno?.trim() || null,
       email.toLowerCase().trim(), hash, rol,
       numero_control || null, numero_empleado || null, carrera || null, semestre || null]
    );

    await pool.query(
      'INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id || null, 'REGISTRO_USUARIO', 'usuarios', result.insertId, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: result.insertId
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, uuid, nombre, apellido_paterno, apellido_materno, email, 
              rol, numero_control, numero_empleado, carrera, semestre, created_at
       FROM usuarios WHERE id = ?`,
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener datos del usuario' });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Contraseñas requeridas' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres' });
  }

  try {
    const [rows] = await pool.query('SELECT password_hash FROM usuarios WHERE id = ?', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [hash, req.user.id]);

    await pool.query(
      'INSERT INTO audit_log (usuario_id, accion, ip_address) VALUES (?, ?, ?)',
      [req.user.id, 'CAMBIO_PASSWORD', req.ip]
    );

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al cambiar contraseña' });
  }
};

module.exports = { login, register, getMe, changePassword };
