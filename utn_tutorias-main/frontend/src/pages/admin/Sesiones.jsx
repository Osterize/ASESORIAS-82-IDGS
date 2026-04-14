import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { enviarCodigoConfirmacion } from '../../services/emailService';
import { EstadoBadge, formatFecha, formatHora, PageHeader, LoadingSpinner, ConfirmDialog } from '../../components/shared/helpers';
import { Plus, Search, RefreshCw, Mail, Eye, Edit2, CheckCircle, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import ModalSesion from '../../components/admin/ModalSesion';
import ModalCompletar from '../../components/admin/ModalCompletar';
import ModalDetalle from '../../components/admin/ModalDetalle';

export default function AdminSesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [modalCompletar, setModalCompletar] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [enviandoCodigo, setEnviandoCodigo] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      const { data } = await api.get(`/sesiones?${params}`);
      setSesiones(data.data);
    } catch { toast.error('Error al cargar sesiones'); }
    finally { setLoading(false); }
  }, [filtroEstado]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleGenerarCodigo = async (sesion) => {
    setEnviandoCodigo(sesion.id);
    try {
      const { data } = await api.post(`/sesiones/${sesion.id}/generar-codigo`);
      if (!data.success) { toast.error(data.message); return; }

      const emailResult = await enviarCodigoConfirmacion({
        alumnoEmail: data.alumnoEmail,
        alumnoNombre: data.alumnoNombre,
        docenteNombre: sesion.docente_nombre,
        fecha: formatFecha(sesion.fecha_programada),
        hora: formatHora(sesion.hora_inicio),
        codigo: data.codigo,
        expira: new Date(data.expira).toLocaleString('es-MX')
      });

      if (emailResult.success) {
        toast.success(`Código enviado a ${data.alumnoEmail}`);
      } else {
        toast.success(`Código generado: ${data.codigo} (EmailJS no configurado, muéstraselo al alumno)`);
        navigator.clipboard?.writeText(data.codigo);
      }
      cargar();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al generar código');
    } finally {
      setEnviandoCodigo(null);
    }
  };

  const handleConfirmarDocente = async (id) => {
    try {
      await api.post(`/sesiones/${id}/confirmar-docente`);
      toast.success('Confirmación registrada');
      cargar();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const filtradas = sesiones.filter(s =>
    !busqueda || [s.alumno_nombre, s.docente_nombre, s.numero_control, s.carrera]
      .some(v => v?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Sesiones de Tutoría"
        subtitle="Registro, seguimiento y control de todas las sesiones"
        action={
          <button className="btn btn-primary" onClick={() => setModalCrear(true)}>
            <Plus size={17} /> Nueva Sesión
          </button>
        }
      />

      {/* Filtros */}
      <div className="card mb-6">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="form-input" style={{ paddingLeft: 36 }}
                placeholder="Buscar alumno, docente, N° control..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 200 }}
              value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="programada">Programada</option>
              <option value="pendiente_confirmacion">Pendiente confirmación</option>
              <option value="confirmada">Confirmada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="no_presentado">No presentado</option>
            </select>
            <button className="btn btn-secondary" onClick={cargar}>
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : filtradas.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} />
              <h4>Sin resultados</h4>
              <p style={{ fontSize: 13, marginTop: 4 }}>No hay sesiones con los filtros aplicados</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Alumno</th>
                  <th>Docente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>#{s.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.alumno_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.numero_control} · {s.carrera}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{s.docente_nombre}</td>
                    <td style={{ fontSize: 13 }}>{formatFecha(s.fecha_programada)}</td>
                    <td style={{ fontSize: 13 }}>{formatHora(s.hora_inicio)} – {formatHora(s.hora_fin)}</td>
                    <td>
                      <span className={`badge ${s.modalidad === 'virtual' ? 'badge-blue' : 'badge-gray'}`}>
                        {s.modalidad === 'virtual' ? '🌐 Virtual' : '🏫 Presencial'}
                      </span>
                    </td>
                    <td><EstadoBadge estado={s.estado} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-icon btn-secondary" title="Ver detalle" onClick={() => setModalDetalle(s)}>
                          <Eye size={14} />
                        </button>
                        {['programada', 'pendiente_confirmacion'].includes(s.estado) && (
                          <button className="btn btn-icon btn-secondary" title="Generar y enviar código"
                            onClick={() => handleGenerarCodigo(s)}
                            disabled={enviandoCodigo === s.id}
                            style={{ color: 'var(--utn-blue-600)' }}>
                            {enviandoCodigo === s.id
                              ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />
                              : <Mail size={14} />}
                          </button>
                        )}
                        {s.estado === 'pendiente_confirmacion' && !s.confirmada_por_docente && (
                          <button className="btn btn-icon btn-secondary" title="Confirmar como docente"
                            onClick={() => handleConfirmarDocente(s.id)}
                            style={{ color: 'var(--success)' }}>
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {['confirmada', 'programada'].includes(s.estado) && (
                          <button className="btn btn-icon btn-secondary" title="Registrar avances"
                            onClick={() => setModalCompletar(s)}
                            style={{ color: 'var(--utn-gold-dark)' }}>
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
        {!loading && (
          <div className="card-footer" style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            Mostrando {filtradas.length} de {sesiones.length} sesiones
          </div>
        )}
      </div>

      {modalCrear && <ModalSesion onClose={() => setModalCrear(false)} onSave={() => { setModalCrear(false); cargar(); }} />}
      {modalCompletar && <ModalCompletar sesion={modalCompletar} onClose={() => setModalCompletar(null)} onSave={() => { setModalCompletar(null); cargar(); }} />}
      {modalDetalle && <ModalDetalle sesion={modalDetalle} onClose={() => setModalDetalle(null)} />}
    </div>
  );
}
