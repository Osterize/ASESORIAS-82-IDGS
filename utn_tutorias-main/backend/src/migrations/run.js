const { pool } = require('../config/database');

const migrations = [
  // ─────────────────────────────────────────
  // TABLA: usuarios
  // ─────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(80) NOT NULL,
    apellido_materno VARCHAR(80),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('alumno','docente','administrador') NOT NULL,
    numero_control VARCHAR(20) UNIQUE,
    numero_empleado VARCHAR(20) UNIQUE,
    carrera VARCHAR(120),
    semestre TINYINT UNSIGNED,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_uuid (uuid)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ─────────────────────────────────────────
  // TABLA: sesiones_tutoria
  // ─────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS sesiones_tutoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    docente_id INT NOT NULL,
    alumno_id INT NOT NULL,
    fecha_programada DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    modalidad ENUM('presencial','virtual') NOT NULL DEFAULT 'presencial',
    lugar_enlace VARCHAR(255),
    estado ENUM('programada','pendiente_confirmacion','confirmada','completada','cancelada','no_presentado') NOT NULL DEFAULT 'programada',
    temas_propuestos TEXT,
    observaciones_docente TEXT,
    observaciones_alumno TEXT,
    codigo_confirmacion VARCHAR(8),
    codigo_expira_at TIMESTAMP,
    codigo_usado TINYINT(1) DEFAULT 0,
    confirmada_por_alumno TINYINT(1) DEFAULT 0,
    confirmada_por_docente TINYINT(1) DEFAULT 0,
    fecha_confirmacion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_docente (docente_id),
    INDEX idx_alumno (alumno_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_programada)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ─────────────────────────────────────────
  // TABLA: avances_alumno
  // ─────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS avances_alumno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id INT NOT NULL,
    alumno_id INT NOT NULL,
    docente_id INT NOT NULL,
    temas_vistos TEXT NOT NULL,
    nivel_comprension ENUM('bajo','medio','alto') NOT NULL DEFAULT 'medio',
    compromisos TEXT,
    recursos_compartidos TEXT,
    proximos_temas TEXT,
    calificacion_sesion TINYINT UNSIGNED CHECK (calificacion_sesion BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sesion_id) REFERENCES sesiones_tutoria(id) ON DELETE CASCADE,
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_avance_sesion (sesion_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ─────────────────────────────────────────
  // TABLA: justificantes
  // ─────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS justificantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    sesion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo ENUM('inasistencia_alumno','inasistencia_docente','reprogramacion','otro') NOT NULL,
    motivo TEXT NOT NULL,
    archivo_nombre VARCHAR(255),
    archivo_ruta VARCHAR(500),
    estado ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
    revisado_por INT,
    notas_revision TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sesion_id) REFERENCES sesiones_tutoria(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (revisado_por) REFERENCES usuarios(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ─────────────────────────────────────────
  // TABLA: asignaciones_tutor (Docente asignado a grupo/alumno)
  // ─────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS asignaciones_tutor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    alumno_id INT NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    activa TINYINT(1) DEFAULT 1,
    asignado_por INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_asignacion (docente_id, alumno_id, periodo),
    INDEX idx_alumno (alumno_id),
    INDEX idx_docente (docente_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ─────────────────────────────────────────
  // TABLA: audit_log (Seguridad y trazabilidad)
  // ─────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(60),
    registro_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_accion (accion),
    INDEX idx_fecha (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // ─────────────────────────────────────────
  // INSERT: Admin por defecto
  // ─────────────────────────────────────────
  `INSERT IGNORE INTO usuarios (uuid, nombre, apellido_paterno, apellido_materno, email, password_hash, rol, numero_empleado)
   VALUES (UUID(), 'Administrador', 'UTN', 'Sistema', 'admin@utn.edu.mx', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqEhCJmGqWrP9r7wFh4eUZ5UXMkW', 'administrador', 'ADM001')`
  // Password por defecto: Admin2024! (cambiar al primer inicio)
];

const runMigrations = async () => {
  console.log('🚀 Ejecutando migraciones...');
  for (let i = 0; i < migrations.length; i++) {
    try {
      await pool.query(migrations[i]);
      console.log(`  ✅ Migración ${i + 1}/${migrations.length} completada`);
    } catch (err) {
      console.error(`  ❌ Error en migración ${i + 1}:`, err.message);
      throw err;
    }
  }
  console.log('🎉 Todas las migraciones completadas');
  process.exit(0);
};

runMigrations().catch(() => process.exit(1));
