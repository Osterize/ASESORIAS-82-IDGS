import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader } from '../../components/shared/helpers';
import toast from 'react-hot-toast';
import { Database, Download, Trash2, RefreshCw, Clock, Play, Shield } from 'lucide-react';

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function Backup() {
  const [respaldos, setRespaldos]         = useState([]);
  const [loading, setLoading]             = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [loadingCron, setLoadingCron]     = useState(false);
  const [restaurando, setRestaurando]     = useState(null);

  // Config cron
  const [frecuencia, setFrecuencia] = useState('diario');
  const [hora, setHora]             = useState('02:00');
  const [cronActivo, setCronActivo] = useState(false);
  const [cronInfo, setCronInfo]     = useState(null);

  const cargarRespaldos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/backup/listar');
      if (data.success) setRespaldos(data.data);
    } catch {
      toast.error('Error al cargar respaldos');
    } finally {
      setLoading(false);
    }
  };

  const cargarConfig = async () => {
    try {
      const { data } = await api.get('/backup/config');
      if (data.success && data.config.activo) {
        setCronActivo(true);
        setFrecuencia(data.config.frecuencia);
        setHora(data.config.hora);
        setCronInfo(data.config);
      }
    } catch {}
  };

  useEffect(() => {
    cargarRespaldos();
    cargarConfig();
  }, []);

  const hacerRespaldoManual = async () => {
    setLoadingManual(true);
    try {
      const { data } = await api.post('/backup/manual');
      if (data.success) {
        toast.success(`✅ Respaldo creado: ${data.archivo}`);
        cargarRespaldos();
      }
    } catch {
      toast.error('Error al generar respaldo');
    } finally {
      setLoadingManual(false);
    }
  };

  const descargar = (nombre) => {
    const token = localStorage.getItem('utn_token');
    const url = `${api.defaults.baseURL}/backup/descargar/${nombre}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = nombre;
        a.click();
      });
  };

  const eliminar = async (nombre) => {
    if (!confirm(`¿Eliminar el respaldo "${nombre}"?`)) return;
    try {
      await api.delete(`/backup/eliminar/${nombre}`);
      toast.success('Respaldo eliminado');
      cargarRespaldos();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const restaurar = async (nombre) => {
    if (!confirm(`⚠️ ¿Restaurar la base de datos desde "${nombre}"?\nEsto sobreescribirá los datos actuales.`)) return;
    setRestaurando(nombre);
    try {
      const { data } = await api.post(`/backup/restaurar/${nombre}`);
      if (data.success) toast.success('✅ Base de datos restaurada exitosamente');
      else toast.error(data.message);
    } catch {
      toast.error('Error al restaurar');
    } finally {
      setRestaurando(null);
    }
  };

  const programarCron = async () => {
    setLoadingCron(true);
    try {
      const { data } = await api.post('/backup/programar', { frecuencia, hora, activo: cronActivo });
      if (data.success) {
        toast.success(data.message);
        setCronInfo(cronActivo ? { frecuencia, hora, activo: true } : null);
      }
    } catch {
      toast.error('Error al programar respaldo');
    } finally {
      setLoadingCron(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Respaldos de Base de Datos"
        subtitle="Administra los respaldos y restauraciones del sistema"
      />

      {/* Tarjetas superiores */}
      <div className="grid grid-3 gap-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ borderLeft: '4px solid var(--utn-blue-600)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Database size={28} color="var(--utn-blue-600)" />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--utn-blue-700)' }}>{respaldos.length}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Respaldos disponibles</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Clock size={28} color="var(--success)" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>
                {cronInfo?.activo ? `${cronInfo.frecuencia} · ${cronInfo.hora}` : 'Inactivo'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Respaldo automático</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Shield size={28} color="#7c3aed" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed' }}>
                {respaldos[0] ? formatFecha(respaldos[0].fecha) : 'Sin respaldos'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Último respaldo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-6">

        {/* ── Respaldo Manual ── */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Play size={16} color="var(--utn-blue-600)" /> Respaldo Manual
            </h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, lineHeight: 1.6 }}>
              Genera un respaldo completo de la base de datos en este momento. El archivo <strong>.sql</strong> se guardará en el servidor y estará disponible para descargar.
            </p>
            <button
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center' }}
              onClick={hacerRespaldoManual}
              disabled={loadingManual}
            >
              {loadingManual ? (
                <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Generando respaldo...</>
              ) : (
                <><Database size={16} /> Generar Respaldo Ahora</>
              )}
            </button>
          </div>
        </div>

        {/* ── Respaldo Automático ── */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="var(--success)" /> Respaldo Automático
            </h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={cronActivo}
                onChange={e => setCronActivo(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: cronActivo ? 'var(--success)' : 'var(--gray-500)' }}>
                {cronActivo ? '✅ Respaldo automático activo' : 'Activar respaldo automático'}
              </span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, display: 'block', marginBottom: 4 }}>FRECUENCIA</label>
                <select
                  className="form-control"
                  value={frecuencia}
                  onChange={e => setFrecuencia(e.target.value)}
                  disabled={!cronActivo}
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal (lunes)</option>
                  <option value="mensual">Mensual (día 1)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, display: 'block', marginBottom: 4 }}>HORA</label>
                <input
                  type="time"
                  className="form-control"
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                  disabled={!cronActivo}
                />
              </div>
            </div>

            <button
              className="btn btn-success w-full"
              style={{ justifyContent: 'center' }}
              onClick={programarCron}
              disabled={loadingCron}
            >
              {loadingCron ? 'Guardando...' : <><Clock size={16} /> Guardar Configuración</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Lista de Respaldos ── */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15 }}>📁 Respaldos Disponibles</h3>
          <button className="btn btn-secondary" onClick={cargarRespaldos} disabled={loading}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>Cargando...</div>
          ) : respaldos.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>
              <Database size={32} style={{ marginBottom: 8, opacity: .4 }} />
              <p>No hay respaldos disponibles. Genera el primero.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>ARCHIVO</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>FECHA</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>TAMAÑO</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {respaldos.map((r, i) => (
                  <tr key={r.nombre} style={{ borderBottom: '1px solid var(--gray-100)', background: i % 2 === 0 ? '#fff' : 'var(--gray-50)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: 'var(--utn-blue-700)' }}>
                      {r.nombre}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>
                      {formatFecha(r.fecha)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>
                      {formatBytes(r.tamaño)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => descargar(r.nombre)}
                          title="Descargar"
                        >
                          <Download size={13} /> Descargar
                        </button>
                        <button
                          className="btn btn-warning"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => restaurar(r.nombre)}
                          disabled={restaurando === r.nombre}
                          title="Restaurar"
                        >
                          <RefreshCw size={13} /> {restaurando === r.nombre ? 'Restaurando...' : 'Restaurar'}
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => eliminar(r.nombre)}
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
