import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PageHeader, LoadingSpinner, formatFecha, formatDateTime, JUSTIFICANTE_ESTADO } from '../../components/shared/helpers';
import { X, CheckCircle, XCircle } from 'lucide-react';

function ModalRevisar({ justificante: j, onClose, onSave }) {
  const [form, setForm] = useState({ estado: 'aprobado', notas_revision: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/justificantes/${j.id}/revisar`, form);
      toast.success(`Justificante ${form.estado}`);
      onSave();
    } catch { toast.error('Error al revisar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Revisar Justificante</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: 14, border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>Motivo del justificante</div>
              <p style={{ fontSize: 14 }}>{j.motivo}</p>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
                Solicitado por: <strong>{j.solicitante_nombre}</strong> · {formatFecha(j.fecha_programada)}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Decisión <span>*</span></label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'aprobado', label: '✅ Aprobar', color: 'var(--success)' },
                  { value: 'rechazado', label: '❌ Rechazar', color: 'var(--danger)' }
                ].map(opt => (
                  <label key={opt.value} style={{
                    flex: 1, padding: '12px', border: '2px solid',
                    borderColor: form.estado === opt.value ? opt.color : 'var(--gray-200)',
                    borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'center',
                    fontSize: 14, fontWeight: 500,
                    background: form.estado === opt.value ? opt.color + '12' : '#fff',
                    transition: 'all .15s'
                  }}>
                    <input type="radio" name="estado" value={opt.value} hidden
                      checked={form.estado === opt.value}
                      onChange={() => setForm(p => ({ ...p, estado: opt.value }))} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notas de revisión</label>
              <textarea className="form-textarea"
                placeholder="Observaciones sobre la decisión tomada..."
                value={form.notas_revision}
                onChange={e => setForm(p => ({ ...p, notas_revision: e.target.value }))}
                style={{ minHeight: 80 }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar Decisión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminJustificantes() {
  const [justificantes, setJustificantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modal, setModal] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = filtro ? `?estado=${filtro}` : '';
      const { data } = await api.get(`/justificantes${params}`);
      setJustificantes(data.data);
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  const TIPO_LABELS = {
    inasistencia_alumno: 'Inasistencia alumno',
    inasistencia_docente: 'Inasistencia docente',
    reprogramacion: 'Reprogramación',
    otro: 'Otro'
  };

  return (
    <div>
      <PageHeader title="Justificantes" subtitle="Gestiona solicitudes de justificante de los usuarios" />

      <div className="card mb-6">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <select className="form-select" style={{ width: 200 }} value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : justificantes.length === 0 ? (
            <div className="empty-state"><h4>Sin justificantes</h4></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Solicitante</th>
                  <th>Tipo</th>
                  <th>Sesión</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {justificantes.map(j => (
                  <tr key={j.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{j.solicitante_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{j.solicitante_email}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{TIPO_LABELS[j.tipo] || j.tipo}</td>
                    <td style={{ fontSize: 13 }}>
                      {formatFecha(j.fecha_programada)}
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{j.docente_nombre} → {j.alumno_nombre}</div>
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {j.motivo}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${JUSTIFICANTE_ESTADO[j.estado]?.class || 'badge-gray'}`}>
                        {JUSTIFICANTE_ESTADO[j.estado]?.label || j.estado}
                      </span>
                    </td>
                    <td>
                      {j.estado === 'pendiente' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(j)}>
                          Revisar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <ModalRevisar justificante={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); cargar(); }} />}
    </div>
  );
}

export function AdminAuditoria() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit').then(({ data }) => setLogs(data.data)).catch(() => toast.error('Error')).finally(() => setLoading(false));
  }, []);

  const ACTION_BADGE = {
    LOGIN: 'badge-blue', REGISTRO_USUARIO: 'badge-green',
    CREAR_SESION: 'badge-gold', DESACTIVAR_USUARIO: 'badge-red',
    CAMBIO_PASSWORD: 'badge-yellow'
  };

  return (
    <div>
      <PageHeader title="Registro de Auditoría" subtitle="Historial de acciones del sistema (últimas 500)" />
      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : (
            <table>
              <thead>
                <tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Tabla</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{formatDateTime(l.created_at)}</td>
                    <td style={{ fontSize: 13 }}>{l.usuario_nombre || 'Sistema'}</td>
                    <td><span className={`badge ${ACTION_BADGE[l.accion] || 'badge-gray'}`} style={{ fontSize: 11 }}>{l.accion}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{l.tabla_afectada || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{l.ip_address || '—'}</td>
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
