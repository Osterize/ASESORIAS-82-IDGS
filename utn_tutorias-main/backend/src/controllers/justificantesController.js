const { pool } = require('../config/database');

// GET /api/justificantes
const getJustificantes = async (req, res) => {
  const user = req.user;
  let where = [];
  let params = [];

  if (user.rol === 'alumno') { where.push('j.usuario_id = ?'); params.push(user.id); }
  else if (user.rol === 'docente') {
    where.push('(s.docente_id = ? OR j.usuario_id = ?)'); params.push(user.id, user.id);
  }

  if (req.query.estado) { where.push('j.estado = ?'); params.push(req.query.estado); }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

  try {
    const [rows] = await pool.query(`
      SELECT j.*,
        CONCAT(u.nombre,' ',u.apellido_paterno) AS solicitante_nombre, u.email AS solicitante_email,
        s.fecha_programada, s.hora_inicio,
        CONCAT(d.nombre,' ',d.apellido_paterno) AS docente_nombre,
        CONCAT(a.nombre,' ',a.apellido_paterno) AS alumno_nombre
      FROM justificantes j
      JOIN usuarios u ON u.id = j.usuario_id
      JOIN sesiones_tutoria s ON s.id = j.sesion_id
      JOIN usuarios d ON d.id = s.docente_id
      JOIN usuarios a ON a.id = s.alumno_id
      ${whereClause}
      ORDER BY j.created_at DESC
    `, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener justificantes' });
  }
};

// POST /api/justificantes
const createJustificante = async (req, res) => {
  const { sesion_id, tipo, motivo } = req.body;
  if (!sesion_id || !tipo || !motivo) {
    return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
  }

  try {
    // Verificar que la sesión pertenece al usuario
    const [rows] = await pool.query(
      'SELECT * FROM sesiones_tutoria WHERE id = ?', [sesion_id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Sesión no encontrada' });

    const sesion = rows[0];
    const user = req.user;
    if (user.rol === 'alumno' && sesion.alumno_id !== user.id)
      return res.status(403).json({ success: false, message: 'Sin acceso a esta sesión' });
    if (user.rol === 'docente' && sesion.docente_id !== user.id)
      return res.status(403).json({ success: false, message: 'Sin acceso a esta sesión' });

    const [result] = await pool.query(
      `INSERT INTO justificantes (sesion_id, usuario_id, tipo, motivo) VALUES (?, ?, ?, ?)`,
      [sesion_id, user.id, tipo, motivo.trim()]
    );

    res.status(201).json({ success: true, message: 'Justificante enviado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear justificante' });
  }
};

// PUT /api/justificantes/:id/revisar  (admin)
const revisarJustificante = async (req, res) => {
  const { id } = req.params;
  const { estado, notas_revision } = req.body;

  if (!['aprobado', 'rechazado'].includes(estado)) {
    return res.status(400).json({ success: false, message: 'Estado inválido' });
  }

  try {
    await pool.query(
      `UPDATE justificantes SET estado = ?, notas_revision = ?, revisado_por = ? WHERE id = ?`,
      [estado, notas_revision || null, req.user.id, id]
    );
    res.json({ success: true, message: `Justificante ${estado}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al revisar justificante' });
  }
};

module.exports = { getJustificantes, createJustificante, revisarJustificante };
