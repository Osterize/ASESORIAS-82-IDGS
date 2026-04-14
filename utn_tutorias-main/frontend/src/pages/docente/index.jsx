import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { enviarCodigoConfirmacion } from '../../services/emailService';
import { EstadoBadge, formatFecha, formatHora, PageHeader, LoadingSpinner, NIVEL_CONFIG, JUSTIFICANTE_ESTADO } from '../../components/shared/helpers';
import { CalendarDays, Users, TrendingUp, Mail, CheckCircle, Edit2, Eye, Plus, BookOpen, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import ModalSesion from '../../components/admin/ModalSesion';
import ModalCompletar from '../../components/admin/ModalCompletar';
import ModalDetalle from '../../components/admin/ModalDetalle';

// ────────────────────────────────────────
// DASHBOARD DOCENTE
// ────────────────────────────────────────
export function DocenteDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [proximas, setProximas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/sesiones/estadisticas'), api.get('/sesiones?estado=programada')])
      .then(([st, ses]) => { setStats(st.data.data); setProximas(ses.data.data.slice(0, 4)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title={`Hola, ${user?.nombre}`} subtitle="Resumen de tus tutorías asignadas" />

      <div className="grid grid-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats?.total || 0, color: 'var(--utn-blue-600)', bg: 'var(--utn-blue-100)', icon: CalendarDays },
          { label: 'Programadas', value: stats?.programadas || 0, color: '#0ea5e9', bg: '#e0f2fe', icon: CalendarDays },
          { label: 'Confirmadas', value: stats?.confirmadas || 0, color: 'var(--success)', bg: 'var(--success-light)', icon: CheckCircle },
          { label: 'Completadas', value: stats?.completadas || 0, color: '#7c3aed', bg: '#ede9fe', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={22} color={s.color} /></div>
            <div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16 }}>Próximas Sesiones</h3>
          <Link to="/docente/sesiones" className="btn btn-secondary btn-sm">Ver todas</Link>
        </div>
        <div className="table-wrapper" style={{ border: 'none' }}>
          {proximas.length === 0 ? (
            <div className="empty-state"><h4>Sin sesiones programadas próximamente</h4></div>
          ) : (
            <table>
              <thead><tr><th>Alumno</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead>
              <tbody>
                {proximas.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.alumno_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.numero_control}</div>
                    </td>
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
// SESIONES DOCENTE
// ────────────────────────────────────────
export function DocenteSesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalCompletar, setModalCompletar] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [enviandoCodigo, setEnviandoCodigo] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const p = filtro ? `?estado=${filtro}` : '';
      const { data } = await api.get(`/sesiones${p}`);
      setSesiones(data.data);
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleCodigo = async (sesion) => {
    setEnviandoCodigo(sesion.id);
    try {
      const { data } = await api.post(`/sesiones/${sesion.id}/generar-codigo`);
      const emailRes = await enviarCodigoConfirmacion({
        alumnoEmail: data.alumnoEmail, alumnoNombre: data.alumnoNombre,
        docenteNombre: sesion.docente_nombre,
        fecha: formatFecha(sesion.fecha_programada), hora: formatHora(sesion.hora_inicio),
        codigo: data.codigo, expira: new Date(data.expira).toLocaleString('es-MX')
      });
      emailRes.success
        ? toast.success(`Código enviado por email a ${data.alumnoEmail}`)
        : toast.success(`Código: ${data.codigo} (EmailJS no config. — muéstraselo al alumno)`);
      cargar();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setEnviandoCodigo(null); }
  };

  const handleConfirmarDocente = async (id) => {
    try {
      await api.post(`/sesiones/${id}/confirmar-docente`);
      toast.success('Confirmación registrada');
      cargar();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <PageHeader title="Mis Tutorías" subtitle="Administra todas tus sesiones de tutoría"
        action={<button className="btn btn-primary" onClick={() => setModalCrear(true)}><Plus size={17} /> Nueva Sesión</button>} />

      <div className="card mb-4">
        <div className="card-body" style={{ padding: '14px 18px' }}>
          <select className="form-select" style={{ width: 220 }} value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="programada">Programada</option>
            <option value="pendiente_confirmacion">Pendiente confirmación</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : sesiones.length === 0 ? (
            <div className="empty-state"><CalendarDays size={48} /><h4>Sin sesiones</h4></div>
          ) : (
            <table>
              <thead>
                <tr><th>Alumno</th><th>Fecha</th><th>Hora</th><th>Modalidad</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {sesiones.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.alumno_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.numero_control} · {s.carrera}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{formatFecha(s.fecha_programada)}</td>
                    <td style={{ fontSize: 13 }}>{formatHora(s.hora_inicio)} – {formatHora(s.hora_fin)}</td>
                    <td><span className={`badge ${s.modalidad === 'virtual' ? 'badge-blue' : 'badge-gray'}`}>{s.modalidad}</span></td>
                    <td><EstadoBadge estado={s.estado} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-icon btn-secondary" onClick={() => setModalDetalle(s)}><Eye size={14} /></button>
                        {['programada', 'pendiente_confirmacion'].includes(s.estado) && (
                          <button className="btn btn-icon btn-secondary" onClick={() => handleCodigo(s)}
                            disabled={enviandoCodigo === s.id} style={{ color: 'var(--utn-blue-600)' }}
                            title="Enviar código de confirmación al alumno">
                            {enviandoCodigo === s.id
                              ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />
                              : <Mail size={14} />}
                          </button>
                        )}
                        {s.estado === 'pendiente_confirmacion' && !s.confirmada_por_docente && (
                          <button className="btn btn-icon btn-secondary" style={{ color: 'var(--success)' }}
                            onClick={() => handleConfirmarDocente(s.id)} title="Confirmar asistencia">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {['confirmada', 'programada'].includes(s.estado) && (
                          <button className="btn btn-icon btn-secondary" style={{ color: 'var(--utn-gold-dark)' }}
                            onClick={() => setModalCompletar(s)} title="Registrar avances">
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalCrear && <ModalSesion onClose={() => setModalCrear(false)} onSave={() => { setModalCrear(false); cargar(); }} />}
      {modalCompletar && <ModalCompletar sesion={modalCompletar} onClose={() => setModalCompletar(null)} onSave={() => { setModalCompletar(null); cargar(); }} />}
      {modalDetalle && <ModalDetalle sesion={modalDetalle} onClose={() => setModalDetalle(null)} />}
    </div>
  );
}

// ────────────────────────────────────────
// ALUMNOS DOCENTE
// ────────────────────────────────────────
export function DocenteAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/usuarios/alumnos').then(({ data }) => setAlumnos(data.data))
      .catch(() => toast.error('Error')).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Mis Alumnos Tutorados" subtitle="Alumnos asignados a tu cargo" />
      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : alumnos.length === 0 ? (
            <div className="empty-state"><Users size={48} /><h4>Sin alumnos asignados</h4><p style={{ fontSize: 13 }}>El administrador debe asignarte alumnos</p></div>
          ) : (
            <table>
              <thead><tr><th>Alumno</th><th>N° Control</th><th>Carrera</th><th>Semestre</th><th>Email</th></tr></thead>
              <tbody>
                {alumnos.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{a.nombre} {a.apellido_paterno} {a.apellido_materno || ''}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{a.numero_control || '—'}</td>
                    <td style={{ fontSize: 13 }}>{a.carrera || '—'}</td>
                    <td style={{ fontSize: 13 }}>{a.semestre ? `${a.semestre}°` : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{a.email}</td>
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
// AVANCES DOCENTE
// ────────────────────────────────────────
export function DocenteAvances() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sesiones?estado=completada').then(({ data }) => setSesiones(data.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Avances de Alumnos" subtitle="Historial de sesiones completadas y avances registrados" />
      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : sesiones.length === 0 ? (
            <div className="empty-state"><TrendingUp size={48} /><h4>Sin sesiones completadas aún</h4></div>
          ) : (
            <table>
              <thead>
                <tr><th>Alumno</th><th>Fecha</th><th>Temas vistos</th><th>Comprensión</th><th>Calificación</th></tr>
              </thead>
              <tbody>
                {sesiones.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.alumno_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.numero_control}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{formatFecha(s.fecha_programada)}</td>
                    <td style={{ fontSize: 13, maxWidth: 220 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {s.temas_vistos || '—'}
                      </span>
                    </td>
                    <td>
                      {s.nivel_comprension ? (
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: NIVEL_CONFIG[s.nivel_comprension]?.color + '18',
                          color: NIVEL_CONFIG[s.nivel_comprension]?.color
                        }}>
                          {NIVEL_CONFIG[s.nivel_comprension]?.label}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: 14 }}>
                      {s.calificacion_sesion ? '⭐'.repeat(s.calificacion_sesion) : '—'}
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

// ────────────────────────────────────────
// JUSTIFICANTES DOCENTE
// ────────────────────────────────────────
function ModalJustificante({ sesiones, onClose, onSave }) {
  const [form, setForm] = useState({ sesion_id: '', tipo: 'inasistencia_alumno', motivo: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sesion_id || !form.motivo) return toast.error('Completa todos los campos');
    setLoading(true);
    try {
      await api.post('/justificantes', form);
      toast.success('Justificante enviado al administrador');
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
              <label className="form-label">Sesión relacionada <span>*</span></label>
              <select className="form-select" value={form.sesion_id}
                onChange={e => setForm(p => ({ ...p, sesion_id: e.target.value }))} required>
                <option value="">— Seleccionar sesión —</option>
                {sesiones.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.alumno_nombre} · {formatFecha(s.fecha_programada)} {formatHora(s.hora_inicio)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de justificante <span>*</span></label>
              <select className="form-select" value={form.tipo}
                onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                <option value="inasistencia_alumno">Inasistencia del alumno</option>
                <option value="inasistencia_docente">Inasistencia del docente</option>
                <option value="reprogramacion">Solicitud de reprogramación</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Motivo / Descripción <span>*</span></label>
              <textarea className="form-textarea" placeholder="Explica el motivo del justificante..."
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

export function DocenteJustificantes() {
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
      <PageHeader title="Mis Justificantes" subtitle="Solicitudes de justificante enviadas"
        action={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={17} /> Enviar Justificante</button>} />
      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : justificantes.length === 0 ? (
            <div className="empty-state"><FileText size={48} /><h4>Sin justificantes enviados</h4></div>
          ) : (
            <table>
              <thead><tr><th>Tipo</th><th>Motivo</th><th>Sesión</th><th>Estado</th></tr></thead>
              <tbody>
                {justificantes.map(j => (
                  <tr key={j.id}>
                    <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{j.tipo.replace(/_/g, ' ')}</td>
                    <td style={{ fontSize: 13 }}>{j.motivo}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{formatFecha(j.fecha_programada)}</td>
                    <td><span className={`badge ${JUSTIFICANTE_ESTADO[j.estado]?.class}`}>{JUSTIFICANTE_ESTADO[j.estado]?.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modal && <ModalJustificante sesiones={sesiones} onClose={() => setModal(false)} onSave={() => { setModal(false); cargar(); }} />}
    </div>
  );
}
