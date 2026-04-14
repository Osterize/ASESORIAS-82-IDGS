import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, BookOpen } from 'lucide-react';
import { formatFecha, formatHora } from '../shared/helpers';

export default function ModalCompletar({ sesion, onClose, onSave }) {
  const [form, setForm] = useState({
    temas_vistos: sesion.temas_propuestos || '',
    nivel_comprension: 'medio',
    compromisos: '',
    recursos_compartidos: '',
    proximos_temas: '',
    calificacion_sesion: ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.temas_vistos.trim()) return toast.error('Los temas vistos son obligatorios');
    setLoading(true);
    try {
      await api.post(`/sesiones/${sesion.id}/completar`, form);
      toast.success('Sesión completada y avances registrados');
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al completar sesión');
    } finally { setLoading(false); }
  };

  const niveles = [
    { value: 'bajo', label: '🔴 Bajo', color: 'var(--danger)' },
    { value: 'medio', label: '🟡 Medio', color: 'var(--warning)' },
    { value: 'alto', label: '🟢 Alto', color: 'var(--success)' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3>Registrar Avances de Sesión</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
              {sesion.alumno_nombre} · {formatFecha(sesion.fecha_programada)} · {formatHora(sesion.hora_inicio)}
            </p>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div className="form-group">
              <label className="form-label">Temas vistos en la sesión <span>*</span></label>
              <textarea className="form-textarea"
                placeholder="Describe los temas revisados durante la tutoría..."
                value={form.temas_vistos}
                onChange={e => set('temas_vistos', e.target.value)}
                style={{ minHeight: 100 }} required />
            </div>

            <div className="form-group">
              <label className="form-label">Nivel de comprensión del alumno</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {niveles.map(n => (
                  <label key={n.value} style={{
                    flex: 1, padding: '12px 10px', border: '2px solid',
                    borderColor: form.nivel_comprension === n.value ? n.color : 'var(--gray-200)',
                    borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'center',
                    fontSize: 13, fontWeight: 500,
                    background: form.nivel_comprension === n.value ? n.color + '10' : '#fff',
                    transition: 'all .15s'
                  }}>
                    <input type="radio" name="nivel" value={n.value} hidden
                      checked={form.nivel_comprension === n.value}
                      onChange={() => set('nivel_comprension', n.value)} />
                    {n.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Compromisos del alumno</label>
                <textarea className="form-textarea"
                  placeholder="Tareas, ejercicios, lecturas para la próxima sesión..."
                  value={form.compromisos}
                  onChange={e => set('compromisos', e.target.value)}
                  style={{ minHeight: 80 }} />
              </div>

              <div className="form-group">
                <label className="form-label">Recursos compartidos</label>
                <textarea className="form-textarea"
                  placeholder="Links, libros, documentos compartidos..."
                  value={form.recursos_compartidos}
                  onChange={e => set('recursos_compartidos', e.target.value)}
                  style={{ minHeight: 80 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Próximos temas a trabajar</label>
              <input type="text" className="form-input"
                placeholder="Temas planificados para la siguiente sesión..."
                value={form.proximos_temas}
                onChange={e => set('proximos_temas', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Calificación de la sesión (1-5)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onClick={() => set('calificacion_sesion', n)}
                    style={{
                      width: 44, height: 44, borderRadius: 'var(--radius)',
                      border: '2px solid',
                      borderColor: form.calificacion_sesion >= n ? 'var(--utn-gold)' : 'var(--gray-200)',
                      background: form.calificacion_sesion >= n ? '#fef9e7' : '#fff',
                      cursor: 'pointer', fontSize: 20,
                      transition: 'all .15s'
                    }}>
                    ⭐
                  </button>
                ))}
                {form.calificacion_sesion && (
                  <button type="button" className="btn btn-secondary btn-sm"
                    onClick={() => set('calificacion_sesion', '')}>
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              <BookOpen size={16} />
              {loading ? 'Guardando...' : 'Completar y Guardar Avances'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
