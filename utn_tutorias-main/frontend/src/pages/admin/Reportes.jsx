import { useState } from 'react';
import api from '../../services/api';
import { PageHeader } from '../../components/shared/helpers';
import { Download, FileText, TrendingUp, Users, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const exportarCSV = (datos, nombreArchivo, columnas) => {
  if (!datos.length) { toast.error('Sin datos para exportar'); return; }
  const encabezado = columnas.map(c => c.label).join(',');
  const filas = datos.map(row =>
    columnas.map(c => {
      const val = row[c.key] ?? '';
      // Escapar comas y comillas en el valor
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [encabezado, ...filas].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Archivo "${a.download}" descargado`);
};

const REPORTES = [
  {
    id: 'sesiones',
    titulo: 'Reporte de Sesiones',
    descripcion: 'Todas las sesiones de tutoría con su estado, participantes y modalidad.',
    icon: FileText,
    color: 'var(--utn-blue-600)',
    bg: 'var(--utn-blue-100)',
    endpoint: '/sesiones',
    columnas: [
      { key: 'id', label: 'ID' },
      { key: 'fecha_programada', label: 'Fecha' },
      { key: 'hora_inicio', label: 'Hora inicio' },
      { key: 'hora_fin', label: 'Hora fin' },
      { key: 'alumno_nombre', label: 'Alumno' },
      { key: 'numero_control', label: 'N° Control' },
      { key: 'carrera', label: 'Carrera' },
      { key: 'docente_nombre', label: 'Docente' },
      { key: 'modalidad', label: 'Modalidad' },
      { key: 'estado', label: 'Estado' },
      { key: 'temas_propuestos', label: 'Temas propuestos' },
    ]
  },
  {
    id: 'avances',
    titulo: 'Reporte de Avances',
    descripcion: 'Sesiones completadas con temas vistos, nivel de comprensión y compromisos.',
    icon: TrendingUp,
    color: 'var(--success)',
    bg: 'var(--success-light)',
    endpoint: '/sesiones?estado=completada',
    columnas: [
      { key: 'id', label: 'ID Sesión' },
      { key: 'fecha_programada', label: 'Fecha' },
      { key: 'alumno_nombre', label: 'Alumno' },
      { key: 'numero_control', label: 'N° Control' },
      { key: 'carrera', label: 'Carrera' },
      { key: 'docente_nombre', label: 'Docente' },
      { key: 'temas_vistos', label: 'Temas vistos' },
      { key: 'nivel_comprension', label: 'Nivel comprensión' },
      { key: 'compromisos', label: 'Compromisos' },
      { key: 'proximos_temas', label: 'Próximos temas' },
      { key: 'calificacion_sesion', label: 'Calificación (1-5)' },
    ]
  },
  {
    id: 'usuarios',
    titulo: 'Reporte de Usuarios',
    descripcion: 'Lista completa de alumnos y docentes registrados en el sistema.',
    icon: Users,
    color: '#7c3aed',
    bg: '#ede9fe',
    endpoint: '/usuarios',
    columnas: [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'apellido_paterno', label: 'Apellido Paterno' },
      { key: 'apellido_materno', label: 'Apellido Materno' },
      { key: 'email', label: 'Email' },
      { key: 'rol', label: 'Rol' },
      { key: 'numero_control', label: 'N° Control' },
      { key: 'numero_empleado', label: 'N° Empleado' },
      { key: 'carrera', label: 'Carrera' },
      { key: 'semestre', label: 'Semestre' },
      { key: 'activo', label: 'Activo' },
    ]
  },
  {
    id: 'asignaciones',
    titulo: 'Reporte de Asignaciones',
    descripcion: 'Asignaciones activas de tutores por alumno y periodo.',
    icon: BarChart2,
    color: 'var(--warning)',
    bg: 'var(--warning-light)',
    endpoint: '/asignaciones',
    columnas: [
      { key: 'id', label: 'ID' },
      { key: 'docente_nombre', label: 'Docente' },
      { key: 'docente_email', label: 'Email Docente' },
      { key: 'alumno_nombre', label: 'Alumno' },
      { key: 'alumno_email', label: 'Email Alumno' },
      { key: 'numero_control', label: 'N° Control' },
      { key: 'carrera', label: 'Carrera' },
      { key: 'periodo', label: 'Periodo' },
      { key: 'activa', label: 'Activa' },
    ]
  }
];

export default function AdminReportes() {
  const [loadingId, setLoadingId] = useState(null);

  const handleExportar = async (reporte) => {
    setLoadingId(reporte.id);
    try {
      const { data } = await api.get(reporte.endpoint);
      const datos = data.data || [];
      exportarCSV(datos, `utn_tutorias_${reporte.id}`, reporte.columnas);
    } catch {
      toast.error('Error al obtener datos para el reporte');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reportes y Exportaciones"
        subtitle="Genera reportes en formato CSV para análisis externo o resguardo institucional"
      />

      <div className="alert alert-info mb-6" style={{ fontSize: 13 }}>
        <Download size={16} />
        Los archivos se descargan en formato <strong>CSV (UTF-8 con BOM)</strong>, compatible con Microsoft Excel, LibreOffice Calc y Google Sheets.
      </div>

      <div className="grid grid-2 gap-6">
        {REPORTES.map(r => (
          <div key={r.id} className="card" style={{ transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius)',
                  background: r.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <r.icon size={22} color={r.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, color: 'var(--gray-800)', marginBottom: 4 }}>{r.titulo}</h3>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>{r.descripcion}</p>
                </div>
              </div>

              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                  Columnas incluidas
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {r.columnas.map(c => (
                    <span key={c.key} style={{
                      fontSize: 11, padding: '2px 8px', background: '#fff',
                      border: '1px solid var(--gray-200)', borderRadius: 20,
                      color: 'var(--gray-600)'
                    }}>
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center' }}
                onClick={() => handleExportar(r)}
                disabled={loadingId === r.id}
              >
                {loadingId === r.id ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Descargar CSV
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3 style={{ fontSize: 15 }}>💡 ¿Cómo usar los reportes?</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-2 gap-4">
            {[
              { titulo: 'Microsoft Excel', desc: 'Abre Excel → Datos → Desde texto/CSV → selecciona el archivo → Codificación: UTF-8.' },
              { titulo: 'LibreOffice Calc', desc: 'Abre el archivo .csv directamente. Selecciona Separado por coma y UTF-8 como codificación.' },
              { titulo: 'Google Sheets', desc: 'Archivo → Importar → sube el CSV → Separador: coma → Reemplazar hoja de cálculo.' },
              { titulo: 'Resguardo institucional', desc: 'Guarda los reportes con nombre descriptivo, ej: utn_tutorias_sesiones_2025-01-15.csv' },
            ].map(tip => (
              <div key={tip.titulo} style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--utn-blue-700)', marginBottom: 4 }}>📌 {tip.titulo}</div>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
