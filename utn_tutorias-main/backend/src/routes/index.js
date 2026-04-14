const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validate, loginRules, registerRules, sesionRules,
  asignacionRules, justificanteRules, changePasswordRules
} = require('../middleware/validation');
const authCtrl = require('../controllers/authController');
const sesionesCtrl = require('../controllers/sesionesController');
const usuariosCtrl = require('../controllers/usuariosController');
const justCtrl = require('../controllers/justificantesController');
const backupCtrl = require('../controllers/backupController');
const router = express.Router();

// ── AUTH ──────────────────────────────────────────────
router.post('/auth/login', loginRules, validate, authCtrl.login);
router.post('/auth/register', authenticate, authorize('administrador'), registerRules, validate, authCtrl.register);
router.get('/auth/me', authenticate, authCtrl.getMe);
router.put('/auth/change-password', authenticate, changePasswordRules, validate, authCtrl.changePassword);

// ── USUARIOS ──────────────────────────────────────────
router.get('/usuarios', authenticate, authorize('administrador'), usuariosCtrl.getUsuarios);
router.get('/usuarios/docentes', authenticate, usuariosCtrl.getDocentes);
router.get('/usuarios/alumnos', authenticate, authorize('administrador', 'docente'), usuariosCtrl.getAlumnos);
router.get('/usuarios/:id', authenticate, usuariosCtrl.getUsuarioById);
router.put('/usuarios/:id', authenticate, usuariosCtrl.updateUsuario);
router.delete('/usuarios/:id', authenticate, authorize('administrador'), usuariosCtrl.deactivateUsuario);

// ── ASIGNACIONES ──────────────────────────────────────
router.get('/asignaciones', authenticate, authorize('administrador', 'docente'), usuariosCtrl.getAsignaciones);
router.post('/asignaciones', authenticate, authorize('administrador'), asignacionRules, validate, usuariosCtrl.createAsignacion);
router.put('/asignaciones/:id/toggle', authenticate, authorize('administrador'), usuariosCtrl.toggleAsignacion);

// ── SESIONES ──────────────────────────────────────────
router.get('/sesiones/estadisticas', authenticate, sesionesCtrl.getEstadisticas);
router.get('/sesiones', authenticate, sesionesCtrl.getSesiones);
router.get('/sesiones/:id', authenticate, sesionesCtrl.getSesionById);
router.post('/sesiones', authenticate, authorize('administrador', 'docente'), sesionRules, validate, sesionesCtrl.createSesion);
router.put('/sesiones/:id', authenticate, authorize('administrador', 'docente'), sesionesCtrl.updateSesion);
router.post('/sesiones/:id/generar-codigo', authenticate, authorize('administrador', 'docente'), sesionesCtrl.generarCodigo);
router.post('/sesiones/:id/confirmar-alumno', authenticate, authorize('alumno'), sesionesCtrl.confirmarAlumno);
router.post('/sesiones/:id/confirmar-docente', authenticate, authorize('docente', 'administrador'), sesionesCtrl.confirmarDocente);
router.post('/sesiones/:id/completar', authenticate, authorize('administrador', 'docente'), sesionesCtrl.completarSesion);

// ── JUSTIFICANTES ─────────────────────────────────────
router.get('/justificantes', authenticate, justCtrl.getJustificantes);
router.post('/justificantes', authenticate, justificanteRules, validate, justCtrl.createJustificante);
router.put('/justificantes/:id/revisar', authenticate, authorize('administrador'), justCtrl.revisarJustificante);

// ── AUDIT LOG ─────────────────────────────────────────
router.get('/audit', authenticate, authorize('administrador'), async (req, res) => {
  const { pool } = require('../config/database');
  const [rows] = await pool.query(`
    SELECT al.*, CONCAT(u.nombre,' ',u.apellido_paterno) AS usuario_nombre
    FROM audit_log al LEFT JOIN usuarios u ON u.id = al.usuario_id
    ORDER BY al.created_at DESC LIMIT 500
  `);
  res.json({ success: true, data: rows });
});

module.exports = router;

// ── BACKUP ────────────────────────────────────────────
router.post('/backup/manual',             authenticate, authorize('administrador'), backupCtrl.hacerRespaldoManual);
router.get('/backup/listar',              authenticate, authorize('administrador'), backupCtrl.listarRespaldos);
router.get('/backup/descargar/:nombre',   authenticate, authorize('administrador'), backupCtrl.descargarRespaldo);
router.delete('/backup/eliminar/:nombre', authenticate, authorize('administrador'), backupCtrl.eliminarRespaldo);
router.post('/backup/programar',          authenticate, authorize('administrador'), backupCtrl.programarRespaldo);
router.get('/backup/config',              authenticate, authorize('administrador'), backupCtrl.obtenerConfig);
router.post('/backup/restaurar/:nombre',  authenticate, authorize('administrador'), backupCtrl.restaurarRespaldo);

