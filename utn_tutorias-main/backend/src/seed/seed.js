require('dotenv').config({ path: '../../.env' });
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const hash = (p) => bcrypt.hash(p, 12);

async function seed() {
  console.log('\n🌱 Iniciando seed de datos de prueba...\n');

  // ── USUARIOS ──────────────────────────────────────────────────
  const PASSWORD = 'Utn2024!';

  const usuarios = [
    // Administradores
    { nombre: 'Maria Guadalupe', ap: 'Pérez', am: 'Arellano', email: 'lupita.perez@utnay.edu.mx', rol: 'administrador', emp: 'ADM002' },
    { nombre: 'María De Los Ángeles', ap: 'Solórzano', am: 'Murillo', email: 'angeles.solorzano@utnay.edu.mx', rol: 'administrador', emp: 'ADM003' },
    { nombre: 'Miriam Fabiola', ap: 'González', am: 'Cobian', email: 'rectoria@utnay.edu.mx', rol: 'administrador', emp: 'ADM004' },

    // Docentes
    { nombre: 'Silvia Sofia', ap: 'Castrejón', am: 'Zarate', email: 'silvia.castrejon@utnay.edu.mx', rol: 'docente', emp: 'DOC001' },
    { nombre: 'Juan Manuel', ap: 'Tovar', am: 'Sanchez', email: 'juan.tovar@utnay.edu.mx', rol: 'docente', emp: 'DOC002' },
    { nombre: 'Stephany Anahi', ap: 'Lopez', am: 'Lizarraga', email: 'anahi.lopez@utnay.edu.mx', rol: 'docente', emp: 'DOC003' },
    { nombre: 'Lizbeth Geraldine', ap: 'Ibarra', am: 'Carlos', email: 'lizbeth.ibarra@utnay.edu.mx', rol: 'docente', emp: 'DOC004' },

    // Alumnos (TIC)
    { nombre: 'José Manuel', ap: 'Aguilar', am: 'Núñez', email: 'TIC-310173@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310173', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Xandier Daniel', ap: 'Aguilar', am: 'Osuna', email: 'TIC-310035@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310035', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Eimy Eileen', ap: 'Aranda', am: 'Martinez', email: 'TIC-310012@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310012', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Rafael Humberto', ap: 'Avila', am: 'Rios', email: 'TIC-310153@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310153', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Agustin', ap: 'Benites', am: 'Sánchez', email: 'TIC-310139@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310139', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Nephtis Adonahi', ap: 'Cañedo', am: 'Segura', email: 'TIC-310054@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310054', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Brandon Josue', ap: 'De La Paz', am: 'Venegas', email: 'TIC-310029@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310029', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Jesus Gabriel', ap: 'Esparza', am: 'Burgara', email: 'TIC-310049@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310049', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Diego Sebastian', ap: 'Flores', am: 'Luna', email: 'TIC-310131@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310131', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Joana Michelle', ap: 'Gasga', am: 'Garcia', email: 'TIC-310089@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310089', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Luis Ricardo', ap: 'Gomez', am: 'Nava', email: 'TIC-310040@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310040', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Karol Emmanuel', ap: 'González', am: 'Torres', email: 'TIC-310091@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310091', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Alfredo Joel', ap: 'Hernández', am: 'Casillas', email: 'TIC-310144@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310144', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Carlos Eduardo', ap: 'Lopez', am: 'Castillo', email: 'TIC-310148@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310148', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Alan Emir', ap: 'Medina', am: 'Delgado', email: 'TIC-310011@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310011', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Alex Gilberto', ap: 'Morales', am: 'Bañuelos', email: 'TIC-310195@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310195', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Jesus Antonio', ap: 'Ornelas', am: 'Gonzalez', email: 'TIC-310167@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310167', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Karla Yadira', ap: 'Ozuna', am: 'Aguilar', email: 'TIC-300099@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-300099', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Julio Javier', ap: 'Perez', am: 'Ruiz', email: 'TIC-310068@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310068', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Aldair Alejandro', ap: 'Ramos', am: 'Diaz', email: 'TIC-310059@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310059', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'David Arturo', ap: 'Reyna', am: 'Villanueva', email: 'TIC-310182@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310182', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Jesús Emmanuel', ap: 'Rodríguez', am: 'De La Cruz', email: 'TIC-310192@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310192', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Maximiliano', ap: 'Ruíz', am: 'Encarnación', email: 'TIC-310196@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310196', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'José Armando', ap: 'Topete', am: 'Fregoso', email: 'TIC-310137@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310137', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Raúl Mauricio', ap: 'Velasco', am: 'Sánchez', email: 'TIC-310156@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310156', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 },
    { nombre: 'Jazmin Lizeth', ap: 'Zepeda', am: 'Aguilar', email: 'TIC-310088@utnay.edu.mx', rol: 'alumno', ctrl: 'TIC-310088', carrera: 'Ing. en Desarrollo y Gestión de Software', sem: 8 }
  ];

  const ids = {};

  console.log('📋 Insertando usuarios...');
  for (const u of usuarios) {
    const ph = await hash(PASSWORD);
    const uuid = uuidv4();
    try {
      const [r] = await pool.query(
        `INSERT IGNORE INTO usuarios 
          (uuid, nombre, apellido_paterno, apellido_materno, email, password_hash, rol, numero_empleado, numero_control, carrera, semestre)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [uuid, u.nombre, u.ap, u.am, u.email, ph, u.rol,
         u.emp || null, u.ctrl || null, u.carrera || null, u.sem || null]
      );
      if (r.insertId) {
        ids[u.email] = r.insertId;
        console.log(`  ✅ ${u.rol.padEnd(14)} | ${u.nombre} ${u.ap} <${u.email}>`);
      } else {
        const [ex] = await pool.query('SELECT id FROM usuarios WHERE email=?', [u.email]);
        if (ex.length) ids[u.email] = ex[0].id;
        console.log(`  ⚠️  Ya existe: ${u.email}`);
      }
    } catch (e) {
      console.error(`  ❌ Error con ${u.email}:`, e.message);
    }
  }

  // ── ASIGNACIONES TUTOR (Docente ↔ Alumno) ─────────────────────
  console.log('\n🔗 Creando asignaciones docente↔alumno...');
  const PERIODO = 'Ene-Jun 2025';
  const adminId = ids['lupita.perez@utnay.edu.mx'] || ids['rectoria@utnay.edu.mx'];

  // Asignaciones reales con tus docentes y alumnos
  const asignaciones = [
    // DOC001 (Silvia Castrejón) asigna a 5 alumnos
    { doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310173@utnay.edu.mx' },
    { doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310035@utnay.edu.mx' },
    { doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310012@utnay.edu.mx' },
    { doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310153@utnay.edu.mx' },
    { doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310139@utnay.edu.mx' },
    
    // DOC002 (Juan Manuel Tovar) asigna a 5 alumnos
    { doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310054@utnay.edu.mx' },
    { doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310029@utnay.edu.mx' },
    { doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310049@utnay.edu.mx' },
    { doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310131@utnay.edu.mx' },
    { doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310089@utnay.edu.mx' },
    
    // DOC003 (Stephany Lopez) asigna a 5 alumnos
    { doc: 'anahi.lopez@utnay.edu.mx', alu: 'TIC-310040@utnay.edu.mx' },
    { doc: 'anahi.lopez@utnay.edu.mx', alu: 'TIC-310091@utnay.edu.mx' },
    { doc: 'anahi.lopez@utnay.edu.mx', alu: 'TIC-310144@utnay.edu.mx' },
    { doc: 'anahi.lopez@utnay.edu.mx', alu: 'TIC-310148@utnay.edu.mx' },
    { doc: 'anahi.lopez@utnay.edu.mx', alu: 'TIC-310011@utnay.edu.mx' },
    
    // DOC004 (Lizbeth Ibarra) asigna al resto
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310195@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310167@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-300099@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310068@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310059@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310182@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310192@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310196@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310137@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310156@utnay.edu.mx' },
    { doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310088@utnay.edu.mx' }
  ];

  for (const a of asignaciones) {
    const dId = ids[a.doc];
    const aId = ids[a.alu];
    if (!dId || !aId) { 
      console.log(`  ⚠️  IDs no encontrados: ${a.doc} → ${a.alu}`); 
      continue; 
    }
    try {
      await pool.query(
        `INSERT IGNORE INTO asignaciones_tutor (docente_id, alumno_id, periodo, asignado_por) VALUES (?,?,?,?)`,
        [dId, aId, PERIODO, adminId]
      );
      console.log(`  ✅ ${a.doc.split('@')[0]} → ${a.alu.split('@')[0]}`);
    } catch (e) { 
      console.error(`  ❌`, e.message); 
    }
  }

  // ── SESIONES DE TUTORÍA ───────────────────────────────────────
  console.log('\n📅 Creando sesiones de tutoría...');

  const hoy = new Date();
  const fecha = (offsetDays) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const sesiones = [
    // Sesiones completadas (históricas) - con alumnos reales
    {
      doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310173@utnay.edu.mx',
      fecha: fecha(-20), hi: '10:00', hf: '11:00', mod: 'presencial', lugar: 'Sala de tutorías A-201',
      temas: 'Desarrollo web - HTML5 y CSS3', estado: 'completada',
      temas_vistos: 'Estructura de documentos HTML, selectores CSS, modelo de caja y flexbox.',
      nivel: 'medio', compromisos: 'Crear una landing page personal con los temas vistos.',
      proximos: 'JavaScript básico y manipulación del DOM', cal: 4,
      conf_alu: 1, conf_doc: 1
    },
    {
      doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310035@utnay.edu.mx',
      fecha: fecha(-15), hi: '11:00', hf: '12:00', mod: 'virtual', lugar: 'https://meet.google.com/utn-tutorias',
      temas: 'Base de datos - MySQL', estado: 'completada',
      temas_vistos: 'Consultas SELECT, JOIN, GROUP BY y subconsultas.',
      nivel: 'alto', compromisos: 'Optimizar consultas del proyecto integrador.',
      proximos: 'Procedimientos almacenados y triggers', cal: 5,
      conf_alu: 1, conf_doc: 1
    },
    {
      doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310054@utnay.edu.mx',
      fecha: fecha(-10), hi: '09:00', hf: '10:00', mod: 'presencial', lugar: 'Sala B-102',
      temas: 'Metodologías ágiles - Scrum', estado: 'completada',
      temas_vistos: 'Roles en Scrum, artefactos, sprints y reuniones.',
      nivel: 'bajo', compromisos: 'Aplicar Scrum en su equipo de proyecto.',
      proximos: 'Kanban y gestión de flujo de trabajo', cal: 3,
      conf_alu: 1, conf_doc: 1
    },
    {
      doc: 'anahi.lopez@utnay.edu.mx', alu: 'TIC-310040@utnay.edu.mx',
      fecha: fecha(-7), hi: '14:00', hf: '15:00', mod: 'presencial', lugar: 'Cubículo 3',
      temas: 'Programación orientada a objetos - Java', estado: 'completada',
      temas_vistos: 'Clases, objetos, herencia, polimorfismo y encapsulamiento.',
      nivel: 'alto', compromisos: 'Implementar el diagrama de clases en código.',
      proximos: 'Interfaces y clases abstractas', cal: 5,
      conf_alu: 1, conf_doc: 1
    },
    {
      doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310195@utnay.edu.mx',
      fecha: fecha(-5), hi: '13:00', hf: '14:00', mod: 'presencial', lugar: 'Sala de tutorías C-301',
      temas: 'Estructura de datos - Listas enlazadas', estado: 'completada',
      temas_vistos: 'Implementación de listas simples y dobles, inserción y eliminación.',
      nivel: 'medio', compromisos: 'Resolver ejercicios de listas en Python.',
      proximos: 'Pilas y colas', cal: 4,
      conf_alu: 1, conf_doc: 1
    },

    // Sesiones confirmadas (próximas)
    {
      doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310012@utnay.edu.mx',
      fecha: fecha(2), hi: '10:00', hf: '11:00', mod: 'presencial', lugar: 'Sala A-201',
      temas: 'Git y control de versiones', estado: 'confirmada',
      conf_alu: 1, conf_doc: 1
    },
    {
      doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310029@utnay.edu.mx',
      fecha: fecha(3), hi: '11:00', hf: '12:00', mod: 'virtual', lugar: 'https://zoom.us/j/utnay123',
      temas: 'Docker y contenedores', estado: 'confirmada',
      conf_alu: 1, conf_doc: 1
    },

    // Sesiones pendientes de confirmación (con código)
    {
      doc: 'anahi.lopez@utnay.edu.mx', alu: 'TIC-310091@utnay.edu.mx',
      fecha: fecha(5), hi: '09:00', hf: '10:00', mod: 'presencial', lugar: 'Cubículo 3',
      temas: 'APIs REST con Node.js', estado: 'pendiente_confirmacion',
      codigo: 'TUT4B2', conf_alu: 0, conf_doc: 0
    },
    {
      doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310167@utnay.edu.mx',
      fecha: fecha(4), hi: '15:00', hf: '16:00', mod: 'presencial', lugar: 'Sala C-301',
      temas: 'Autenticación JWT', estado: 'pendiente_confirmacion',
      codigo: 'MKT9Z1', conf_alu: 0, conf_doc: 0
    },

    // Sesiones programadas (futuras)
    {
      doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310153@utnay.edu.mx',
      fecha: fecha(7), hi: '10:00', hf: '11:00', mod: 'presencial', lugar: 'Sala A-201',
      temas: 'React - componentes y estado', estado: 'programada'
    },
    {
      doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310049@utnay.edu.mx',
      fecha: fecha(8), hi: '09:00', hf: '10:00', mod: 'virtual', lugar: 'https://meet.google.com/utn-002',
      temas: 'TypeScript para proyectos grandes', estado: 'programada'
    },
    {
      doc: 'anahi.lopez@utnay.edu.mx', alu: 'TIC-310144@utnay.edu.mx',
      fecha: fecha(10), hi: '14:00', hf: '15:00', mod: 'presencial', lugar: 'Cubículo 3',
      temas: 'Pruebas unitarias con Jest', estado: 'programada'
    },
    {
      doc: 'lizbeth.ibarra@utnay.edu.mx', alu: 'TIC-310300@utnay.edu.mx',
      fecha: fecha(6), hi: '13:00', hf: '14:00', mod: 'presencial', lugar: 'Sala C-301',
      temas: 'CI/CD con GitHub Actions', estado: 'programada'
    },

    // Sesión cancelada
    {
      doc: 'silvia.castrejon@utnay.edu.mx', alu: 'TIC-310139@utnay.edu.mx',
      fecha: fecha(-3), hi: '11:00', hf: '12:00', mod: 'presencial', lugar: 'Sala A-201',
      temas: 'Frameworks CSS - Tailwind', estado: 'cancelada'
    },
    // No presentado
    {
      doc: 'juan.tovar@utnay.edu.mx', alu: 'TIC-310131@utnay.edu.mx',
      fecha: fecha(-12), hi: '09:00', hf: '10:00', mod: 'presencial', lugar: 'Sala B-102',
      temas: 'MongoDB y Mongoose', estado: 'no_presentado',
      obs_doc: 'El alumno no se presentó a la sesión sin previo aviso.'
    }
  ];

  const sesionIds = [];
  for (const s of sesiones) {
    const dId = ids[s.doc];
    const aId = ids[s.alu];
    if (!dId || !aId) { 
      console.log(`  ⚠️  IDs no encontrados para sesión: ${s.doc} → ${s.alu}`); 
      continue; 
    }
    try {
      const expira = s.codigo ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;
      const [r] = await pool.query(
        `INSERT INTO sesiones_tutoria
          (docente_id, alumno_id, fecha_programada, hora_inicio, hora_fin,
           modalidad, lugar_enlace, temas_propuestos, estado,
           observaciones_docente, codigo_confirmacion, codigo_expira_at,
           confirmada_por_alumno, confirmada_por_docente,
           fecha_confirmacion)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [dId, aId, s.fecha, s.hi, s.hf, s.mod, s.lugar || null,
         s.temas || null, s.estado, s.obs_doc || null,
         s.codigo || null, expira,
         s.conf_alu ?? 0, s.conf_doc ?? 0,
         (s.conf_alu && s.conf_doc) ? new Date() : null]
      );
      sesionIds.push({ id: r.insertId, s });
      console.log(`  ✅ [${s.estado.padEnd(24)}] ${s.alu.split('@')[0]} ← ${s.doc.split('@')[0]} · ${s.fecha}`);
    } catch (e) {
      console.error(`  ❌ Error en sesión:`, e.message);
    }
  }

  // ── AVANCES (solo para sesiones completadas) ──────────────────
  console.log('\n📊 Registrando avances en sesiones completadas...');
  for (const { id: sesId, s } of sesionIds) {
    if (s.estado !== 'completada' || !s.temas_vistos) continue;
    const dId = ids[s.doc];
    const aId = ids[s.alu];
    try {
      await pool.query(
        `INSERT IGNORE INTO avances_alumno
          (sesion_id, alumno_id, docente_id, temas_vistos, nivel_comprension, compromisos, proximos_temas, calificacion_sesion)
         VALUES (?,?,?,?,?,?,?,?)`,
        [sesId, aId, dId, s.temas_vistos, s.nivel, s.compromisos || null, s.proximos || null, s.cal || null]
      );
      console.log(`  ✅ Avance registrado → sesión #${sesId} (${s.alu})`);
    } catch (e) {
      console.error(`  ❌ Error en avance:`, e.message);
    }
  }

  // ── JUSTIFICANTES ──────────────────────────────────────────────
  console.log('\n📄 Creando justificantes de prueba...');
  const sesNoPres = sesionIds.find(x => x.s.estado === 'no_presentado');
  const sesCancelada = sesionIds.find(x => x.s.estado === 'cancelada');

  const justificantes = [];
  if (sesNoPres) {
    justificantes.push({
      sesion_id: sesNoPres.id,
      usuario_id: ids['TIC-310131@utnay.edu.mx'],
      tipo: 'inasistencia_alumno',
      motivo: 'Tuve una cita médica de urgencia ese día y no pude asistir a la sesión. Tengo el comprobante del IMSS.',
      estado: 'pendiente'
    });
  }
  if (sesCancelada) {
    justificantes.push({
      sesion_id: sesCancelada.id,
      usuario_id: ids['TIC-310139@utnay.edu.mx'],
      tipo: 'reprogramacion',
      motivo: 'Solicito reprogramar la sesión de Tailwind para la siguiente semana, ya que tengo evaluación parcial ese día.',
      estado: 'aprobado'
    });
  }

  for (const j of justificantes) {
    if (!j.sesion_id || !j.usuario_id) continue;
    try {
      await pool.query(
        `INSERT INTO justificantes (sesion_id, usuario_id, tipo, motivo, estado) VALUES (?,?,?,?,?)`,
        [j.sesion_id, j.usuario_id, j.tipo, j.motivo, j.estado]
      );
      console.log(`  ✅ Justificante [${j.estado}] → sesión #${j.sesion_id}`);
    } catch (e) {
      console.error(`  ❌ Error en justificante:`, e.message);
    }
  }

  process.exit(0);
}

seed().catch(e => { console.error('Error fatal en seed:', e); process.exit(1); });