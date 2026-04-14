const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// GET /api/usuarios
const getUsuarios = async (req, res) => {
  const { rol, activo, search } = req.query;
  let where = [];
  let params = [];

  if (rol) { where.push('rol = ?'); params.push(rol); }
  if (activo !== undefined) { where.push('activo = ?'); params.push(activo === 'true' ? 1 : 0); }
  if (search) {
    where.push('(nombre LIKE ? OR apellido_paterno LIKE ? OR email LIKE ? OR numero_control LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const [rows] = await pool.query(
      `SELECT id, uuid, nombre, apellido_paterno, apellido_materno, email, rol,
              numero_control, numero_empleado, carrera, semestre, activo, created_at
       FROM usuarios ${whereClause} ORDER BY apellido_paterno, nombre`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
};

// GET /api/usuarios/:id
const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT id, uuid, nombre, apellido_paterno, apellido_materno, email, rol,
              numero_control, numero_empleado, carrera, semestre, activo, created_at
       FROM usuarios WHERE id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener usuario' });
  }
};

// PUT /api/usuarios/:id
const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido_paterno, apellido_materno, carrera, semestre, activo, numero_control, numero_empleado } = req.body;

  // Solo admin puede editar otros usuarios; usuario puede editar su propio perfil (campos limitados)
  if (req.user.rol !== 'administrador' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ success: false, message: 'Sin permisos' });
  }

  try {
    await pool.query(
      `UPDATE usuarios SET
        nombre = COALESCE(?, nombre),
        apellido_paterno = COALESCE(?, apellido_paterno),
        apellido_materno = COALESCE(?, apellido_materno),
        carrera = COALESCE(?, carrera),
        semestre = COALESCE(?, semestre),
        numero_control = COALESCE(?, numero_control),
        numero_empleado = COALESCE(?, numero_empleado),
        activo = COALESCE(?, activo)
       WHERE id = ?`,
      [nombre, apellido_paterno, apellido_materno, carrera, semestre,
       numero_control, numero_empleado,
       req.user.rol === 'administrador' ? activo : undefined, id]
    );
    res.json({ success: true, message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
};

// DELETE /api/usuarios/:id (desactivar, no borrar)
const deactivateUsuario = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ success: false, message: 'No puedes desactivar tu propia cuenta' });
  }
  try {
    await pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);
    await pool.query(
      'INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?,?,?,?,?)',
      [req.user.id, 'DESACTIVAR_USUARIO', 'usuarios', id, req.ip]
    );
    res.json({ success: true, message: 'Usuario desactivado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al desactivar usuario' });
  }
};

// GET /api/usuarios/docentes  (para selects)
const getDocentes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, uuid, nombre, apellido_paterno, apellido_materno, email, numero_empleado
       FROM usuarios WHERE rol IN ('docente','administrador') AND activo = 1
       ORDER BY apellido_paterno, nombre`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener docentes' });
  }
};

// GET /api/usuarios/alumnos  (docente: solo sus alumnos)
const getAlumnos = async (req, res) => {
  try {
    let rows;
    if (req.user.rol === 'docente') {
      [rows] = await pool.query(
        `SELECT u.id, u.uuid, u.nombre, u.apellido_paterno, u.apellido_materno,
                u.email, u.numero_control, u.carrera, u.semestre
         FROM usuarios u
         JOIN asignaciones_tutor a ON a.alumno_id = u.id
         WHERE a.docente_id = ? AND a.activa = 1 AND u.activo = 1
         ORDER BY u.apellido_paterno, u.nombre`,
        [req.user.id]
      );
    } else {
      [rows] = await pool.query(
        `SELECT id, uuid, nombre, apellido_paterno, apellido_materno,
                email, numero_control, carrera, semestre
         FROM usuarios WHERE rol = 'alumno' AND activo = 1
         ORDER BY apellido_paterno, nombre`
      );
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener alumnos' });
  }
};

// ── ASIGNACIONES ──────────────────────────

// GET /api/asignaciones
const getAsignaciones = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*,
        CONCAT(d.nombre,' ',d.apellido_paterno) AS docente_nombre, d.email AS docente_email,
        CONCAT(al.nombre,' ',al.apellido_paterno) AS alumno_nombre, al.email AS alumno_email,
        al.numero_control, al.carrera
      FROM asignaciones_tutor a
      JOIN usuarios d ON d.id = a.docente_id
      JOIN usuarios al ON al.id = a.alumno_id
      ORDER BY a.periodo DESC, d.apellido_paterno
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener asignaciones' });
  }
};

// POST /api/asignaciones
const createAsignacion = async (req, res) => {
  const { docente_id, alumno_id, periodo } = req.body;
  if (!docente_id || !alumno_id || !periodo) {
    return res.status(400).json({ success: false, message: 'Docente, alumno y periodo son requeridos' });
  }
  try {
    await pool.query(
      `INSERT INTO asignaciones_tutor (docente_id, alumno_id, periodo, asignado_por) VALUES (?,?,?,?)`,
      [docente_id, alumno_id, periodo, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Asignación creada exitosamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Esta asignación ya existe' });
    }
    res.status(500).json({ success: false, message: 'Error al crear asignación' });
  }
};

// PUT /api/asignaciones/:id/toggle
const toggleAsignacion = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE asignaciones_tutor SET activa = NOT activa WHERE id = ?', [id]);
    res.json({ success: true, message: 'Asignación actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar asignación' });
  }
};

module.exports = {
  getUsuarios, getUsuarioById, updateUsuario, deactivateUsuario,
  getDocentes, getAlumnos, getAsignaciones, createAsignacion, toggleAsignacion
};
