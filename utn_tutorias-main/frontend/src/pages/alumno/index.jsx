import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { EstadoBadge, formatFecha, formatHora, PageHeader, LoadingSpinner, NIVEL_CONFIG, JUSTIFICANTE_ESTADO } from '../../components/shared/helpers';
import { CalendarDays, BookOpen, Key, CheckCircle, TrendingUp, FileText, Plus, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ────────────────────────────────────────
// DASHBOARD ALUMNO
// ────────────────────────────────────────
export function AlumnoDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [proximas, setProximas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/sesiones/estadisticas'), api.get('/sesiones?estado=programada')])
      .then(([st, ses]) => { setStats(st.data.data); setProximas(ses.data.data.slice(0, 3)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title={`¡Hola, ${user?.nombre}!`}
        subtitle={`${user?.carrera ? user.carrera + ' · ' : ''}${user?.semestre ? `Semestre ${user.semestre}` : ''}`} />

      <div className="grid grid-3 gap-4 mb-6">
        {[
          { label: 'Total Asesorías', value: stats?.total || 0, color: 'var(--utn-blue-600)', bg: 'var(--utn-blue-100)', icon: CalendarDays },
          { label: 'Próximas', value: (stats?.programadas || 0) + (stats?.pendientes || 0), color: '#0ea5e9', bg: '#e0f2fe', icon: CalendarDays },
          { label: 'Completadas', value: stats?.completadas || 0, color: 'var(--success)', bg: 'var(--success-light)', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Pendiente de confirmar */}
      {stats?.pendientes > 0 && (
        <div className="alert alert-warning mb-6">
          <AlertCircle size={18} />
          <div>
            <strong>¡Tienes {stats.pendientes} asesoría(s) pendiente(s) de confirmación!</strong>
            <br />Ingresa el código que recibiste por correo en la sección "Mis Asesorías".
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3 style={{ fontSize: 16 }}>Próximas sesiones</h3></div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          {proximas.length === 0 ? (
            <div className="empty-state"><h4>Sin sesiones próximas</h4></div>
          ) : (
            <table>
              <thead><tr><th>Docente</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead>
              <tbody>
                {proximas.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{s.docente_nombre}</td>
                    <td style={{ fontSize: 13 }}>{formatFecha(s.fecha_programada)}</td>
                    <td style={{ fontSize: 13 }}>{formatHora(s.hora_inicio)}</td>
                    <td><EstadoBadge estado={s.estado} /></td>
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

// ────────────────────────────────────────
// MODAL CONFIRMAR CON CÓDIGO
// ────────────────────────────────────────
function ModalConfirmar({ sesion, onClose, onSave }) {
  const [codigo, setCodigo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (codigo.trim().length < 4) return toast.error('Ingresa el código completo');
    setLoading(true);
    try {
      await api.post(`/sesiones/${sesion.id}/confirmar-alumno`, {
        codigo: codigo.toUpperCase().trim(),
        observaciones_alumno: observaciones
      });
      toast.success('¡Asesoría confirmada exitosamente!');
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Código incorrecto');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div>
            <h3>Confirmar Asistencia</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
              {sesion.docente_nombre} · {formatFecha(sesion.fecha_programada)} {formatHora(sesion.hora_inicio)}
            </p>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="alert alert-info" style={{ fontSize: 13 }}>
              <Key size={16} />
              Ingresa el código de 6 caracteres que tu docente te envió por correo electrónico.
            </div>

            <div className="form-group">
              <label className="form-label">Código de confirmación <span>*</span></label>
              <input
                type="text"
                className="form-input"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                style={{
                  fontSize: 28, fontWeight: 700, letterSpacing: 10,
                  textAlign: 'center', fontFamily: 'monospace',
                  textTransform: 'uppercase', padding: '16px'
                }}
                required autoFocus
              />
              <span className="form-hint text-center" style={{ textAlign: 'center' }}>
                El código tiene 6 caracteres (letras y números)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Comentarios sobre la sesión (opcional)</label>
              <textarea className="form-textarea"
                placeholder="¿Cómo te fue en la sesión? ¿Tienes algún comentario?"
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                style={{ minHeight: 80 }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-success" disabled={loading || codigo.length < 4}>
              <CheckCircle size={16} />
              {loading ? 'Verificando...' : 'Confirmar Asistencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ────────────────────────────────────────
// SESIONES ALUMNO
// ────────────────────────────────────────
export function AlumnoSesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modalConfirmar, setModalConfirmar] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const p = filtro ? `?estado=${filtro}` : '';
      const { data } = await api.get(`/sesiones${p}`);
      setSesiones(data.data);
    } catch { } finally { setLoading(false); }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  return (
    <div>
      <PageHeader title="Mis Asesorías" subtitle="Historial y seguimiento de todas tus sesiones" />

      <div className="card mb-4">
        <div className="card-body" style={{ padding: '14px 18px' }}>
          <select className="form-select" style={{ width: 220 }} value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="programada">Programada</option>
            <option value="pendiente_confirmacion">Pendiente de confirmar</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : sesiones.length === 0 ? (
            <div className="empty-state"><CalendarDays size={48} /><h4>Sin sesiones registradas</h4></div>
          ) : (
            <table>
              <thead>
                <tr><th>Docente</th><th>Fecha</th><th>Hora</th><th>Lugar/Modalidad</th><th>Estado</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {sesiones.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{s.docente_nombre}</td>
                    <td style={{ fontSize: 13 }}>{formatFecha(s.fecha_programada)}</td>
                    <td style={{ fontSize: 13 }}>{formatHora(s.hora_inicio)} – {formatHora(s.hora_fin)}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {s.modalidad === 'virtual' ? '🌐 Virtual' : `🏫 ${s.lugar_enlace || 'Presencial'}`}
                    </td>
                    <td><EstadoBadge estado={s.estado} /></td>
                    <td>
                      {s.estado === 'pendiente_confirmacion' && !s.confirmada_por_alumno && (
                        <button className="btn btn-primary btn-sm" onClick={() => setModalConfirmar(s)}>
                          <Key size={13} /> Ingresar código
                        </button>
                      )}
                      {s.confirmada_por_alumno && (
                        <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                          ✅ Confirmada
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalConfirmar && (
        <ModalConfirmar sesion={modalConfirmar}
          onClose={() => setModalConfirmar(null)}
          onSave={() => { setModalConfirmar(null); cargar(); }} />
      )}
    </div>
  );
}

// ────────────────────────────────────────
// AVANCE ALUMNO
// ────────────────────────────────────────
export function AlumnoAvance() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sesiones?estado=completada').then(({ data }) => setSesiones(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Mi Avance Académico" subtitle="Registro de temas y compromisos por sesión" />

      {sesiones.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div className="stat-card" style={{ flex: 1 }}>
            <div className="stat-icon" style={{ background: 'var(--utn-blue-100)' }}><BookOpen size={22} color="var(--utn-blue-600)" /></div>
            <div><div className="stat-value" style={{ color: 'var(--utn-blue-600)' }}>{sesiones.length}</div><div className="stat-label">Sesiones completadas</div></div>
          </div>
          <div className="stat-card" style={{ flex: 1 }}>
            <div className="stat-icon" style={{ background: 'var(--warning-light)' }}><TrendingUp size={22} color="var(--warning)" /></div>
            <div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>
                {sesiones.filter(s => s.calificacion_sesion).length > 0
                  ? (sesiones.reduce((a, s) => a + (s.calificacion_sesion || 0), 0) / sesiones.filter(s => s.calificacion_sesion).length).toFixed(1)
                  : '—'}
              </div>
              <div className="stat-label">Calificación promedio</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? <LoadingSpinner /> : sesiones.length === 0 ? (
          <div className="card"><div className="card-body"><div className="empty-state"><BookOpen size={48} /><h4>Sin sesiones completadas aún</h4></div></div></div>
        ) : sesiones.map(s => (
          <div key={s.id} className="card">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: 15 }}>{formatFecha(s.fecha_programada)} · {formatHora(s.hora_inicio)}</h4>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Tutor: {s.docente_nombre}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {s.nivel_comprension && (
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: NIVEL_CONFIG[s.nivel_comprension]?.color + '18',
                      color: NIVEL_CONFIG[s.nivel_comprension]?.color
                    }}>
                      Comprensión: {NIVEL_CONFIG[s.nivel_comprension]?.label}
                    </span>
                  )}
                  {s.calificacion_sesion && <span>{'⭐'.repeat(s.calificacion_sesion)}</span>}
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-2 gap-4">
                {s.temas_vistos && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>📚 Temas vistos</div>
                    <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{s.temas_vistos}</p>
                  </div>
                )}
                {s.compromisos && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>📋 Mis compromisos</div>
                    <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{s.compromisos}</p>
                  </div>
                )}
                {s.proximos_temas && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>🎯 Próximos temas</div>
                    <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{s.proximos_temas}</p>
                  </div>
                )}
                {s.recursos_compartidos && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>🔗 Recursos</div>
                    <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{s.recursos_compartidos}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────
// JUSTIFICANTES ALUMNO
// ────────────────────────────────────────
function ModalJustificanteAlumno({ sesiones, onClose, onSave }) {
  const [form, setForm] = useState({ sesion_id: '', tipo: 'inasistencia_alumno', motivo: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sesion_id || !form.motivo) return toast.error('Completa todos los campos');
    setLoading(true);
    try {
      await api.post('/justificantes', form);
      toast.success('Justificante enviado');
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Enviar Justificante</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Sesión <span>*</span></label>
              <select className="form-select" value={form.sesion_id}
                onChange={e => setForm(p => ({ ...p, sesion_id: e.target.value }))} required>
                <option value="">— Seleccionar sesión —</option>
                {sesiones.map(s => (
                  <option key={s.id} value={s.id}>
                    {formatFecha(s.fecha_programada)} {formatHora(s.hora_inicio)} · {s.docente_nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo <span>*</span></label>
              <select className="form-select" value={form.tipo}
                onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                <option value="inasistencia_alumno">No pude asistir</option>
                <option value="reprogramacion">Solicitar reprogramación</option>
                <option value="otro">Otro motivo</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Motivo <span>*</span></label>
              <textarea className="form-textarea" placeholder="Explica el motivo de tu justificante..."
                value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))}
                required style={{ minHeight: 100 }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Justificante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AlumnoJustificantes() {
  const [justificantes, setJustificantes] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const [j, s] = await Promise.all([api.get('/justificantes'), api.get('/sesiones')]);
      setJustificantes(j.data.data);
      setSesiones(s.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  return (
    <div>
      <PageHeader title="Mis Justificantes" subtitle="Solicitudes enviadas al administrador"
        action={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={17} /> Nuevo Justificante</button>} />
      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : justificantes.length === 0 ? (
            <div className="empty-state"><FileText size={48} /><h4>Sin justificantes enviados</h4></div>
          ) : (
            <table>
              <thead><tr><th>Tipo</th><th>Motivo</th><th>Sesión</th><th>Estado</th><th>Notas</th></tr></thead>
              <tbody>
                {justificantes.map(j => (
                  <tr key={j.id}>
                    <td style={{ fontSize: 13 }}>{j.tipo.replace(/_/g, ' ')}</td>
                    <td style={{ fontSize: 13 }}>{j.motivo}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{formatFecha(j.fecha_programada)}</td>
                    <td><span className={`badge ${JUSTIFICANTE_ESTADO[j.estado]?.class}`}>{JUSTIFICANTE_ESTADO[j.estado]?.label}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{j.notas_revision || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modal && <ModalJustificanteAlumno sesiones={sesiones} onClose={() => setModal(false)} onSave={() => { setModal(false); cargar(); }} />}
    </div>
  );
}
