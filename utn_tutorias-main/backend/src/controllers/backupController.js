const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { pool } = require('../config/database');

const BACKUP_DIR = path.join(__dirname, '../../backups');

// Asegurar que el directorio de respaldos exista
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Tarea cron activa (referencia global)
let cronJob = null;
let cronConfig = null;

const ejecutarRespaldo = () => {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const nombreArchivo = `Respaldo_utn_asesorias_${fecha}.sql`;
    const rutaArchivo = path.join(BACKUP_DIR, nombreArchivo);

    const host     = process.env.DB_HOST || 'localhost';
    const port     = process.env.DB_PORT || '3306';
    const user     = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'utn_tutorias';

    const passArg = password ? `-p"${password}"` : '--password=""';
    const cmd = `mysqldump -h${host} -P${port} -u${user} ${passArg} --single-transaction --routines --triggers ${database} > "${rutaArchivo}"`;

    exec(cmd, (error) => {
      if (error) {
        // Intentar sin contraseña si falla
        const cmd2 = `mysqldump -h${host} -P${port} -u${user} ${database} > "${rutaArchivo}"`;
        exec(cmd2, (err2) => {
          if (err2) return reject(err2);
          resolve({ nombreArchivo, rutaArchivo, tamaño: fs.statSync(rutaArchivo).size });
        });
        return;
      }
      resolve({ nombreArchivo, rutaArchivo, tamaño: fs.statSync(rutaArchivo).size });
    });
  });
};

// ─────────────────────────────────────────
// POST /api/backup/manual
// ─────────────────────────────────────────
const hacerRespaldoManual = async (req, res) => {
  try {
    const resultado = await ejecutarRespaldo();

    await pool.query(
      'INSERT INTO audit_log (usuario_id, accion, ip_address) VALUES (?, ?, ?)',
      [req.user.id, 'BACKUP_MANUAL', req.ip]
    );

    res.json({
      success: true,
      message: 'Respaldo generado exitosamente',
      archivo: resultado.nombreArchivo,
      tamaño: resultado.tamaño
    });
  } catch (err) {
    console.error('Error al hacer respaldo:', err);
    res.status(500).json({ success: false, message: 'Error al generar respaldo: ' + err.message });
  }
};

// ─────────────────────────────────────────
// GET /api/backup/listar
// ─────────────────────────────────────────
const listarRespaldos = async (req, res) => {
  try {
    const archivos = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          nombre: f,
          tamaño: stats.size,
          fecha: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json({ success: true, data: archivos });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al listar respaldos' });
  }
};

// ─────────────────────────────────────────
// GET /api/backup/descargar/:nombre
// ─────────────────────────────────────────
const descargarRespaldo = (req, res) => {
  const { nombre } = req.params;
  // Seguridad: evitar path traversal
  if (nombre.includes('..') || nombre.includes('/') || !nombre.endsWith('.sql')) {
    return res.status(400).json({ success: false, message: 'Nombre de archivo inválido' });
  }
  const ruta = path.join(BACKUP_DIR, nombre);
  if (!fs.existsSync(ruta)) {
    return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
  }
  res.download(ruta);
};

// ─────────────────────────────────────────
// DELETE /api/backup/eliminar/:nombre
// ─────────────────────────────────────────
const eliminarRespaldo = (req, res) => {
  const { nombre } = req.params;
  if (nombre.includes('..') || !nombre.endsWith('.sql')) {
    return res.status(400).json({ success: false, message: 'Nombre inválido' });
  }
  const ruta = path.join(BACKUP_DIR, nombre);
  if (!fs.existsSync(ruta)) {
    return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
  }
  fs.unlinkSync(ruta);
  res.json({ success: true, message: 'Respaldo eliminado' });
};

// ─────────────────────────────────────────
// POST /api/backup/programar
// body: { frecuencia: 'diario' | 'semanal' | 'mensual', hora: '02:00', activo: true }
// ─────────────────────────────────────────
const programarRespaldo = async (req, res) => {
  const { frecuencia, hora, activo } = req.body;

  // Detener cron anterior si existe
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    cronConfig = null;
  }

  if (!activo) {
    return res.json({ success: true, message: 'Respaldo automático desactivado' });
  }

  const [hh, mm] = (hora || '02:00').split(':');
  let expresionCron;

  switch (frecuencia) {
    case 'diario':
      expresionCron = `${mm} ${hh} * * *`;
      break;
    case 'semanal':
      expresionCron = `${mm} ${hh} * * 1`; // cada lunes
      break;
    case 'mensual':
      expresionCron = `${mm} ${hh} 1 * *`; // día 1 de cada mes
      break;
    default:
      return res.status(400).json({ success: false, message: 'Frecuencia inválida' });
  }

  cronConfig = { frecuencia, hora, expresionCron, activo: true };

  cronJob = cron.schedule(expresionCron, async () => {
    console.log(`🔄 Ejecutando respaldo automático (${frecuencia})...`);
    try {
      const r = await ejecutarRespaldo();
      console.log(`✅ Respaldo automático completado: ${r.nombreArchivo}`);
      await pool.query(
        'INSERT INTO audit_log (usuario_id, accion, ip_address) VALUES (?, ?, ?)',
        [null, `BACKUP_AUTOMATICO_${frecuencia.toUpperCase()}`, 'sistema']
      );
    } catch (err) {
      console.error('❌ Error en respaldo automático:', err.message);
    }
  });

  await pool.query(
    'INSERT INTO audit_log (usuario_id, accion, ip_address) VALUES (?, ?, ?)',
    [req.user.id, `PROGRAMAR_BACKUP_${frecuencia.toUpperCase()}`, req.ip]
  );

  res.json({
    success: true,
    message: `Respaldo automático programado: ${frecuencia} a las ${hora}`,
    config: cronConfig
  });
};

// ─────────────────────────────────────────
// GET /api/backup/config
// ─────────────────────────────────────────
const obtenerConfig = (req, res) => {
  res.json({
    success: true,
    config: cronConfig || { activo: false }
  });
};

// ─────────────────────────────────────────
// POST /api/backup/restaurar/:nombre
// ─────────────────────────────────────────
const restaurarRespaldo = async (req, res) => {
  const { nombre } = req.params;
  if (nombre.includes('..') || !nombre.endsWith('.sql')) {
    return res.status(400).json({ success: false, message: 'Nombre inválido' });
  }
  const ruta = path.join(BACKUP_DIR, nombre);
  if (!fs.existsSync(ruta)) {
    return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
  }

  const host     = process.env.DB_HOST || 'localhost';
  const port     = process.env.DB_PORT || '3306';
  const user     = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'utn_tutorias';

  const passArg = password ? `-p"${password}"` : '';
  const cmd = `mysql -h${host} -P${port} -u${user} ${passArg} ${database} < "${ruta}"`;

  exec(cmd, async (error) => {
    if (error) {
      // Intentar sin contraseña
      const cmd2 = `mysql -h${host} -P${port} -u${user} ${database} < "${ruta}"`;
      exec(cmd2, async (err2) => {
        if (err2) {
          return res.status(500).json({ success: false, message: 'Error al restaurar: ' + err2.message });
        }
        await pool.query(
          'INSERT INTO audit_log (usuario_id, accion, ip_address) VALUES (?, ?, ?)',
          [req.user.id, 'RESTAURAR_BACKUP', req.ip]
        );
        return res.json({ success: true, message: 'Base de datos restaurada exitosamente' });
      });
      return;
    }
    await pool.query(
      'INSERT INTO audit_log (usuario_id, accion, ip_address) VALUES (?, ?, ?)',
      [req.user.id, 'RESTAURAR_BACKUP', req.ip]
    );
    res.json({ success: true, message: 'Base de datos restaurada exitosamente' });
  });
};

module.exports = {
  hacerRespaldoManual,
  listarRespaldos,
  descargarRespaldo,
  eliminarRespaldo,
  programarRespaldo,
  obtenerConfig,
  restaurarRespaldo
};
