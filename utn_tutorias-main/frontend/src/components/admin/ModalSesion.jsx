import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

export default function ModalSesion({ sesion, onClose, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    alumno_id: '', docente_id: '', fecha_programada: '',
    hora_inicio: '', hora_fin: '', modalidad: 'presencial',
    lugar_enlace: '', temas_propuestos: ''
  });
  const [alumnos, setAlumnos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const promises = [api.get('/usuarios/alumnos')];
        if (user.rol === 'administrador') promises.push(api.get('/usuarios/docentes'));
        const [aRes, dRes] = await Promise.all(promises);
        setAlumnos(aRes.data.data);
        if (dRes) setDocentes(dRes.data.data);
      } catch { toast.error('Error cargando opciones'); }
    };
    loadOptions();

    if (sesion) {
      setForm({
        alumno_id: sesion.alumno_id || '',
        docente_id: sesion.docente_id || '',
        fecha_programada: sesion.fecha_programada?.split('T')[0] || '',
        hora_inicio: sesion.hora_inicio || '',
        hora_fin: sesion.hora_fin || '',
        modalidad: sesion.modalidad || 'presencial',
        lugar_enlace: sesion.lugar_enlace || '',
        temas_propuestos: sesion.temas_propuestos || ''
      });
    }
  }, [sesion, user.rol]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.alumno_id || !form.fecha_programada || !form.hora_inicio || !form.hora_fin) {
      return toast.error('Completa todos los campos obligatorios');
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (user.rol === 'docente') payload.docente_id = user.id;
      
      if (sesion) {
        await api.put(`/sesiones/${sesion.id}`, payload);
        toast.success('Sesión actualizada');
      } else {
        await api.post('/sesiones', payload);
        toast.success('Sesión creada exitosamente');
      }
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al guardar');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>{sesion ? 'Editar Sesión' : 'Nueva Sesión de Tutoría'}</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Alumno <span>*</span></label>
                <select className="form-select" value={form.alumno_id}
                  onChange={e => set('alumno_id', e.target.value)} required>
                  <option value="">— Seleccionar alumno —</option>
                  {alumnos.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} {a.apellido_paterno} — {a.numero_control}
                    </option>
                  ))}
                </select>
              </div>

              {user.rol === 'administrador' && (
                <div className="form-group">
                  <label className="form-label">Docente/Tutor <span>*</span></label>
                  <select className="form-select" value={form.docente_id}
                    onChange={e => set('docente_id', e.target.value)} required>
                    <option value="">— Seleccionar docente —</option>
                    {docentes.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nombre} {d.apellido_paterno}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Fecha <span>*</span></label>
                <input type="date" className="form-input"
                  value={form.fecha_programada}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('fecha_programada', e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Hora inicio <span>*</span></label>
                <input type="time" className="form-input"
                  value={form.hora_inicio}
                  onChange={e => set('hora_inicio', e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Hora fin <span>*</span></label>
                <input type="time" className="form-input"
                  value={form.hora_fin}
                  onChange={e => set('hora_fin', e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Modalidad</label>
                <select className="form-select" value={form.modalidad}
                  onChange={e => set('modalidad', e.target.value)}>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>

              {form.modalidad === 'virtual' && (
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Enlace de videollamada</label>
                  <input type="url" className="form-input"
                    placeholder="https://meet.google.com/..."
                    value={form.lugar_enlace}
                    onChange={e => set('lugar_enlace', e.target.value)} />
                </div>
              )}

              {form.modalidad === 'presencial' && (
                <div className="form-group">
                  <label className="form-label">Lugar</label>
                  <input type="text" className="form-input"
                    placeholder="Aula 301, Edificio A..."
                    value={form.lugar_enlace}
                    onChange={e => set('lugar_enlace', e.target.value)} />
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="form-group">
              <label className="form-label">Temas propuestos para la sesión</label>
              <textarea className="form-textarea"
                placeholder="Ej: Repaso de álgebra lineal, resolución de ejercicios del capítulo 3..."
                value={form.temas_propuestos}
                onChange={e => set('temas_propuestos', e.target.value)}
                style={{ minHeight: 90 }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : sesion ? 'Actualizar Sesión' : 'Crear Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
