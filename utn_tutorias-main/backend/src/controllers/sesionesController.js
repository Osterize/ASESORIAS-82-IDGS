const { pool } = require('../config/database');

// Genera código aleatorio de 6 caracteres alfanumérico
const generarCodigo = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// ─────────────────────────────────────────
// GET /api/sesiones  (según rol filtra)
// ─────────────────────────────────────────
const getSesiones = async (req, res) => {
  const { estado, desde, hasta, alumno_id, docente_id } = req.query;
  const user = req.user;

  let where = [];
  let params = [];

  if (user.rol === 'alumno') {
    where.push('s.alumno_id = ?'); params.push(user.id);
  } else if (user.rol === 'docente') {
    where.push('s.docente_id = ?'); params.push(user.id);
  } else {
    // admin puede filtrar
    if (alumno_id) { where.push('s.alumno_id = ?'); params.push(alumno_id); }
    if (docente_id) { where.push('s.docente_id = ?'); params.push(docente_id); }
  }

  if (estado) { where.push('s.estado = ?'); params.push(estado); }
  if (desde) { where.push('s.fecha_programada >= ?'); params.push(desde); }
  if (hasta) { where.push('s.fecha_programada <= ?'); params.push(hasta); }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        CONCAT(a.nombre,' ',a.apellido_paterno) AS alumno_nombre,
        a.email AS alumno_email,
        a.numero_control,
        a.carrera,
        CONCAT(d.nombre,' ',d.apellido_paterno) AS docente_nombre,
        d.email AS docente_email,
        av.temas_vistos,
        av.nivel_comprension,
        av.calificacion_sesion
      FROM sesiones_tutoria s
      JOIN usuarios a ON a.id = s.alumno_id
      JOIN usuarios d ON d.id = s.docente_id
      LEFT JOIN avances_alumno av ON av.sesion_id = s.id
      ${whereClause}
      ORDER BY s.fecha_programada DESC, s.hora_inicio DESC
    `, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener sesiones' });
  }
};

// ─────────────────────────────────────────
// GET /api/sesiones/:id
// ─────────────────────────────────────────
const getSesionById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT s.*,
        CONCAT(a.nombre,' ',a.apellido_paterno,' ',IFNULL(a.apellido_materno,'')) AS alumno_nombre,
        a.email AS alumno_email, a.numero_control, a.carrera, a.semestre,
        CONCAT(d.nombre,' ',d.apellido_paterno) AS docente_nombre,
        d.email AS docente_email, d.numero_empleado,
        av.temas_vistos, av.nivel_comprension, av.compromisos,
        av.recursos_compartidos, av.proximos_temas, av.calificacion_sesion
      FROM sesiones_tutoria s
      JOIN usuarios a ON a.id = s.alumno_id
      JOIN usuarios d ON d.id = s.docente_id
      LEFT JOIN avances_alumno av ON av.sesion_id = s.id
      WHERE s.id = ?
    `, [id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });

    const sesion = rows[0];
    const user = req.user;
    if (user.rol === 'alumno' && sesion.alumno_id !== user.id)
      return res.status(403).json({ success: false, message: 'Sin acceso' });
    if (user.rol === 'docente' && sesion.docente_id !== user.id)
      return res.status(403).json({ success: false, message: 'Sin acceso' });

    // Ocultar código al alumno
    if (user.rol === 'alumno') {
      delete sesion.codigo_confirmacion;
      delete sesion.codigo_expira_at;
    }

    res.json({ success: true, data: sesion });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener sesión' });
  }
};

// ─────────────────────────────────────────
// POST /api/sesiones  (docente o admin crea)
// ─────────────────────────────────────────
const createSesion = async (req, res) => {
  const { alumno_id, docente_id, fecha_programada, hora_inicio, hora_fin,
          modalidad, lugar_enlace, temas_propuestos } = req.body;

  if (!alumno_id || !fecha_programada || !hora_inicio || !hora_fin) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  const docenteId = req.user.rol === 'docente' ? req.user.id : docente_id;
  if (!docenteId) {
    return res.status(400).json({ success: false, message: 'Se requiere docente_id' });
  }

  try {
    // Verificar que el alumno existe
    const [alumno] = await pool.query(
      'SELECT id, email, nombre FROM usuarios WHERE id = ? AND rol = "alumno" AND activo = 1',
      [alumno_id]
    );
    if (!alumno.length) return res.status(404).json({ success: false, message: 'Alumno no encontrado' });

    // Verificar que la asignación existe (alumno asignado a este docente)
    if (req.user.rol === 'docente') {
      const [asig] = await pool.query(
        'SELECT id FROM asignaciones_tutor WHERE docente_id = ? AND alumno_id = ? AND activa = 1',
        [docenteId, alumno_id]
      );
      if (!asig.length) {
        return res.status(403).json({ success: false, message: 'Este alumno no está asignado a ti' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO sesiones_tutoria 
       (docente_id, alumno_id, fecha_programada, hora_inicio, hora_fin, modalidad, lugar_enlace, temas_propuestos, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'programada')`,
      [docenteId, alumno_id, fecha_programada, hora_inicio, hora_fin,
       modalidad || 'presencial', lugar_enlace || null, temas_propuestos || null]
    );

    await pool.query(
      'INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, ip_address) VALUES (?,?,?,?,?)',
      [req.user.id, 'CREAR_SESION', 'sesiones_tutoria', result.insertId, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Sesión creada exitosamente',
      sesionId: result.insertId,
      alumnoEmail: alumno[0].email,
      alumnoNombre: alumno[0].nombre
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear sesión' });
  }
};

// ─────────────────────────────────────────
// PUT /api/sesiones/:id  (editar por docente/admin)
// ─────────────────────────────────────────
const updateSesion = async (req, res) => {
  const { id } = req.params;
  const { fecha_programada, hora_inicio, hora_fin, modalidad, lugar_enlace,
          temas_propuestos, observaciones_docente, estado } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM sesiones_tutoria WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });

    const sesion = rows[0];
    if (req.user.rol === 'docente' && sesion.docente_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Sin acceso' });

    await pool.query(
      `UPDATE sesiones_tutoria SET
        fecha_programada = COALESCE(?, fecha_programada),
        hora_inicio = COALESCE(?, hora_inicio),
        hora_fin = COALESCE(?, hora_fin),
        modalidad = COALESCE(?, modalidad),
        lugar_enlace = COALESCE(?, lugar_enlace),
        temas_propuestos = COALESCE(?, temas_propuestos),
        observaciones_docente = COALESCE(?, observaciones_docente),
        estado = COALESCE(?, estado)
       WHERE id = ?`,
      [fecha_programada, hora_inicio, hora_fin, modalidad, lugar_enlace,
       temas_propuestos, observaciones_docente, estado, id]
    );

    res.json({ success: true, message: 'Sesión actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar sesión' });
  }
};

// ─────────────────────────────────────────
// POST /api/sesiones/:id/generar-codigo
// Docente genera código → frontend envía email via EmailJS
// ─────────────────────────────────────────
const generarCodigo_ = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT s.*, u.email AS alumno_email, u.nombre AS alumno_nombre FROM sesiones_tutoria s JOIN usuarios u ON u.id = s.alumno_id WHERE s.id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });

    const sesion = rows[0];
    if (req.user.rol === 'docente' && sesion.docente_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Sin acceso' });

    if (!['programada', 'pendiente_confirmacion'].includes(sesion.estado))
      return res.status(400).json({ success: false, message: 'Esta sesión no puede generar código en su estado actual' });

    const codigo = generarCodigo();
    const expira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await pool.query(
      `UPDATE sesiones_tutoria SET 
        codigo_confirmacion = ?, codigo_expira_at = ?, codigo_usado = 0,
        estado = 'pendiente_confirmacion'
       WHERE id = ?`,
      [codigo, expira, id]
    );

    res.json({
      success: true,
      message: 'Código generado. Envíalo por email al alumno.',
      codigo,
      alumnoEmail: sesion.alumno_email,
      alumnoNombre: sesion.alumno_nombre,
      expira: expira.toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al generar código' });
  }
};

// ─────────────────────────────────────────
// POST /api/sesiones/:id/confirmar-alumno
// Alumno ingresa el código para confirmar asistencia
// ─────────────────────────────────────────
const confirmarAlumno = async (req, res) => {
  const { id } = req.params;
  const { codigo, observaciones_alumno } = req.body;

  if (!codigo) return res.status(400).json({ success: false, message: 'Código requerido' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM sesiones_tutoria WHERE id = ? AND alumno_id = ?',
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });

    const sesion = rows[0];
    if (sesion.codigo_usado) return res.status(400).json({ success: false, message: 'Este código ya fue utilizado' });
    if (!sesion.codigo_confirmacion) return res.status(400).json({ success: false, message: 'No hay código pendiente para esta sesión' });
    if (new Date() > new Date(sesion.codigo_expira_at)) return res.status(400).json({ success: false, message: 'El código ha expirado' });
    if (sesion.codigo_confirmacion !== codigo.toUpperCase().trim()) return res.status(400).json({ success: false, message: 'Código incorrecto' });

    await pool.query(
      `UPDATE sesiones_tutoria SET 
        confirmada_por_alumno = 1, codigo_usado = 1,
        observaciones_alumno = COALESCE(?, observaciones_alumno),
        estado = IF(confirmada_por_docente = 1, 'confirmada', 'pendiente_confirmacion'),
        fecha_confirmacion = IF(confirmada_por_docente = 1, NOW(), fecha_confirmacion)
       WHERE id = ?`,
      [observaciones_alumno || null, id]
    );

    res.json({ success: true, message: '¡Tutoría confirmada exitosamente!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al confirmar sesión' });
  }
};

// ─────────────────────────────────────────
// POST /api/sesiones/:id/confirmar-docente
// ─────────────────────────────────────────
const confirmarDocente = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sesiones_tutoria WHERE id = ? AND docente_id = ?',
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });

    await pool.query(
      `UPDATE sesiones_tutoria SET 
        confirmada_por_docente = 1,
        estado = IF(confirmada_por_alumno = 1, 'confirmada', estado),
        fecha_confirmacion = IF(confirmada_por_alumno = 1, NOW(), fecha_confirmacion)
       WHERE id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Confirmación del docente registrada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al confirmar sesión' });
  }
};

// ─────────────────────────────────────────
// POST /api/sesiones/:id/completar
// Docente completa la sesión y registra avances
// ─────────────────────────────────────────
const completarSesion = async (req, res) => {
  const { id } = req.params;
  const { temas_vistos, nivel_comprension, compromisos, recursos_compartidos, proximos_temas, calificacion_sesion } = req.body;

  if (!temas_vistos) return res.status(400).json({ success: false, message: 'Temas vistos requeridos' });

  try {
    const [rows] = await pool.query('SELECT * FROM sesiones_tutoria WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });

    const sesion = rows[0];
    if (req.user.rol === 'docente' && sesion.docente_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Sin acceso' });

    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      await conn.query(
        `UPDATE sesiones_tutoria SET estado = 'completada' WHERE id = ?`, [id]
      );
      await conn.query(
        `INSERT INTO avances_alumno 
          (sesion_id, alumno_id, docente_id, temas_vistos, nivel_comprension, compromisos, recursos_compartidos, proximos_temas, calificacion_sesion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          temas_vistos=VALUES(temas_vistos), nivel_comprension=VALUES(nivel_comprension),
          compromisos=VALUES(compromisos), recursos_compartidos=VALUES(recursos_compartidos),
          proximos_temas=VALUES(proximos_temas), calificacion_sesion=VALUES(calificacion_sesion)`,
        [id, sesion.alumno_id, sesion.docente_id, temas_vistos,
         nivel_comprension || 'medio', compromisos || null, recursos_compartidos || null,
         proximos_temas || null, calificacion_sesion || null]
      );
      await conn.commit();
      res.json({ success: true, message: 'Sesión completada y avances registrados' });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al completar sesión' });
  }
};

// ─────────────────────────────────────────
// GET /api/sesiones/estadisticas
// ─────────────────────────────────────────
const getEstadisticas = async (req, res) => {
  const user = req.user;
  try {
    let filtro = '';
    let params = [];
    if (user.rol === 'docente') { filtro = 'WHERE s.docente_id = ?'; params.push(user.id); }
    if (user.rol === 'alumno') { filtro = 'WHERE s.alumno_id = ?'; params.push(user.id); }

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(estado = 'programada') AS programadas,
        SUM(estado = 'pendiente_confirmacion') AS pendientes,
        SUM(estado = 'confirmada') AS confirmadas,
        SUM(estado = 'completada') AS completadas,
        SUM(estado = 'cancelada') AS canceladas,
        SUM(estado = 'no_presentado') AS no_presentados
      FROM sesiones_tutoria s ${filtro}
    `, params);

    res.json({ success: true, data: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getSesiones, getSesionById, createSesion, updateSesion,
  generarCodigo: generarCodigo_, confirmarAlumno, confirmarDocente,
  completarSesion, getEstadisticas
};
