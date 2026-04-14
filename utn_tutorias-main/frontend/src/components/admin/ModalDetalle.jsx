import { X, User, Calendar, Clock, MapPin, BookOpen, TrendingUp, Star } from 'lucide-react';
import { EstadoBadge, formatFecha, formatHora, NIVEL_CONFIG } from '../shared/helpers';

export default function ModalDetalle({ sesion: s, onClose }) {
  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <Icon size={16} color="var(--utn-blue-500)" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
        <div style={{ fontSize: 14, color: 'var(--gray-800)', marginTop: 2 }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3>Detalle de Sesión #{s.id}</h3>
            <div style={{ marginTop: 6 }}><EstadoBadge estado={s.estado} /></div>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="grid grid-2 gap-4">
            {/* Col 1 */}
            <div>
              <h4 style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>Participantes</h4>
              <InfoRow icon={User} label="Alumno" value={`${s.alumno_nombre} (${s.numero_control})`} />
              <InfoRow icon={User} label="Carrera" value={`${s.carrera} — Sem. ${s.semestre || '?'}`} />
              <InfoRow icon={User} label="Docente/Tutor" value={s.docente_nombre} />

              <h4 style={{ fontSize: 13, color: 'var(--gray-500)', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Sesión</h4>
              <InfoRow icon={Calendar} label="Fecha" value={formatFecha(s.fecha_programada)} />
              <InfoRow icon={Clock} label="Horario" value={`${formatHora(s.hora_inicio)} – ${formatHora(s.hora_fin)}`} />
              <InfoRow icon={MapPin} label={s.modalidad === 'virtual' ? 'Enlace' : 'Lugar'} value={s.lugar_enlace || (s.modalidad === 'presencial' ? 'Presencial' : '—')} />
            </div>

            {/* Col 2 */}
            <div>
              <h4 style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>Contenido</h4>
              <InfoRow icon={BookOpen} label="Temas propuestos" value={s.temas_propuestos} />
              <InfoRow icon={BookOpen} label="Temas vistos" value={s.temas_vistos} />

              {s.nivel_comprension && (
                <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <TrendingUp size={16} color="var(--utn-blue-500)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Nivel comprensión</div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: NIVEL_CONFIG[s.nivel_comprension]?.color + '18',
                        color: NIVEL_CONFIG[s.nivel_comprension]?.color
                      }}>
                        {NIVEL_CONFIG[s.nivel_comprension]?.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {s.calificacion_sesion && (
                <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <Star size={16} color="var(--utn-gold)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Calificación</div>
                    <div style={{ marginTop: 4 }}>{'⭐'.repeat(s.calificacion_sesion)} ({s.calificacion_sesion}/5)</div>
                  </div>
                </div>
              )}

              <InfoRow icon={BookOpen} label="Compromisos del alumno" value={s.compromisos} />
              <InfoRow icon={BookOpen} label="Próximos temas" value={s.proximos_temas} />
            </div>
          </div>

          {/* Observaciones */}
          {(s.observaciones_docente || s.observaciones_alumno) && (
            <>
              <div className="divider" />
              <h4 style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.04em' }}>Observaciones</h4>
              <div className="grid grid-2 gap-4">
                {s.observaciones_docente && (
                  <div style={{ background: 'var(--utn-blue-50)', borderRadius: 'var(--radius)', padding: 14, border: '1px solid var(--utn-blue-200)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--utn-blue-700)', marginBottom: 6 }}>📝 Docente</div>
                    <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>{s.observaciones_docente}</p>
                  </div>
                )}
                {s.observaciones_alumno && (
                  <div style={{ background: 'var(--success-light)', borderRadius: 'var(--radius)', padding: 14, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>📝 Alumno</div>
                    <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>{s.observaciones_alumno}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Estado confirmaciones */}
          <div className="divider" />
          <h4 style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.04em' }}>Estado de confirmaciones</h4>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Alumno confirmó', confirmed: s.confirmada_por_alumno },
              { label: 'Docente confirmó', confirmed: s.confirmada_por_docente },
            ].map(c => (
              <div key={c.label} style={{
                flex: 1, padding: 14, borderRadius: 'var(--radius)',
                background: c.confirmed ? 'var(--success-light)' : 'var(--gray-100)',
                border: `1px solid ${c.confirmed ? '#bbf7d0' : 'var(--gray-200)'}`,
                textAlign: 'center', fontSize: 13
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{c.confirmed ? '✅' : '⏳'}</div>
                <div style={{ fontWeight: 500, color: c.confirmed ? 'var(--success)' : 'var(--gray-500)' }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
