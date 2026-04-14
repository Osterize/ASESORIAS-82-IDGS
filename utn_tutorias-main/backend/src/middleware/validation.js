const { body, validationResult } = require('express-validator');

// Middleware que ejecuta la validación y responde si hay errores
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ── REGLAS ────────────────────────────────────────────────────
const loginRules = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida')
    .isLength({ min: 6 }).withMessage('Contraseña muy corta'),
];

const registerRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido')
    .isLength({ max: 100 }).withMessage('Nombre demasiado largo'),
  body('apellido_paterno').trim().notEmpty().withMessage('Apellido paterno requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número'),
  body('rol').isIn(['alumno', 'docente', 'administrador']).withMessage('Rol inválido'),
];

const sesionRules = [
  body('alumno_id').isInt({ min: 1 }).withMessage('ID de alumno inválido'),
  body('fecha_programada').isDate().withMessage('Fecha inválida'),
  body('hora_inicio').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora de inicio inválida'),
  body('hora_fin').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora de fin inválida'),
  body('modalidad').optional().isIn(['presencial', 'virtual']).withMessage('Modalidad inválida'),
];

const asignacionRules = [
  body('docente_id').isInt({ min: 1 }).withMessage('ID de docente inválido'),
  body('alumno_id').isInt({ min: 1 }).withMessage('ID de alumno inválido'),
  body('periodo').trim().notEmpty().withMessage('Periodo requerido')
    .isLength({ max: 20 }).withMessage('Periodo demasiado largo'),
];

const justificanteRules = [
  body('sesion_id').isInt({ min: 1 }).withMessage('ID de sesión inválido'),
  body('tipo').isIn(['inasistencia_alumno', 'inasistencia_docente', 'reprogramacion', 'otro'])
    .withMessage('Tipo de justificante inválido'),
  body('motivo').trim().notEmpty().withMessage('Motivo requerido')
    .isLength({ min: 10, max: 1000 }).withMessage('El motivo debe tener entre 10 y 1000 caracteres'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
  body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número'),
];

module.exports = {
  validate,
  loginRules,
  registerRules,
  sesionRules,
  asignacionRules,
  justificanteRules,
  changePasswordRules,
};
