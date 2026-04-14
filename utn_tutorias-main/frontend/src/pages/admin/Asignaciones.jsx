import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PageHeader, LoadingSpinner } from '../../components/shared/helpers';
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';

function ModalAsignacion({ onClose, onSave }) {
  const [form, setForm] = useState({ docente_id: '', alumno_id: '', periodo: '' });
  const [docentes, setDocentes] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/usuarios/docentes'), api.get('/usuarios/alumnos')])
      .then(([d, a]) => { setDocentes(d.data.data); setAlumnos(a.data.data); })
      .catch(() => toast.error('Error al cargar opciones'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.docente_id || !form.alumno_id || !form.periodo) {
      return toast.error('Todos los campos son obligatorios');
    }
    setLoading(true);
    try {
      await api.post('/asignaciones', form);
      toast.success('Asignación creada');
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al crear asignación');
    } finally { setLoading(false); }
  };

  const periodoActual = () => {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const año = now.getFullYear();
    return mes <= 6 ? `Ene-Jun ${año}` : `Ago-Dic ${año}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Nueva Asignación de Tutor</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="alert alert-info" style={{ fontSize: 13 }}>
              Asigna un docente como tutor de un alumno para el periodo seleccionado.
            </div>
            <div className="form-group">
              <label className="form-label">Docente/Tutor <span>*</span></label>
              <select className="form-select" value={form.docente_id}
                onChange={e => setForm(p => ({ ...p, docente_id: e.target.value }))} required>
                <option value="">— Seleccionar docente —</option>
                {docentes.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} {d.apellido_paterno} {d.apellido_materno || ''} — {d.numero_empleado || 'Sin N° emp.'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Alumno <span>*</span></label>
              <select className="form-select" value={form.alumno_id}
                onChange={e => setForm(p => ({ ...p, alumno_id: e.target.value }))} required>
                <option value="">— Seleccionar alumno —</option>
                {alumnos.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.apellido_paterno} — {a.numero_control || 'Sin N° ctrl'} ({a.carrera || 'Sin carrera'})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Periodo <span>*</span></label>
              <input className="form-input" value={form.periodo}
                placeholder={periodoActual()}
                onChange={e => setForm(p => ({ ...p, periodo: e.target.value }))} required />
              <span className="form-hint">Ej: Ene-Jun 2025, Ago-Dic 2025</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Asignación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAsignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/asignaciones');
      setAsignaciones(data.data);
    } catch { toast.error('Error al cargar asignaciones'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleToggle = async (id, activa) => {
    try {
      await api.put(`/asignaciones/${id}/toggle`);
      toast.success(activa ? 'Asignación desactivada' : 'Asignación reactivada');
      cargar();
    } catch { toast.error('Error'); }
  };

  const filtradas = asignaciones.filter(a =>
    !busqueda || [a.docente_nombre, a.alumno_nombre, a.numero_control, a.periodo]
      .some(v => v?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Asignación de Tutores"
        subtitle="Gestiona qué docente atiende a cada alumno por periodo"
        action={
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <Plus size={17} /> Nueva Asignación
          </button>
        }
      />

      <div className="card mb-6">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <input className="form-input" placeholder="Buscar por docente, alumno o periodo..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ maxWidth: 400 }} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : filtradas.length === 0 ? (
            <div className="empty-state">
              <h4>Sin asignaciones</h4>
              <p style={{ fontSize: 13 }}>Crea la primera asignación usando el botón de arriba</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Docente Tutor</th>
                  <th>Alumno Tutorado</th>
                  <th>N° Control</th>
                  <th>Carrera</th>
                  <th>Periodo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(a => (
                  <tr key={a.id} style={{ opacity: a.activa ? 1 : .55 }}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{a.docente_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{a.docente_email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{a.alumno_nombre}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{a.alumno_email}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{a.numero_control || '—'}</td>
                    <td style={{ fontSize: 13 }}>{a.carrera || '—'}</td>
                    <td>
                      <span className="badge badge-blue">{a.periodo}</span>
                    </td>
                    <td>
                      <span className={`badge ${a.activa ? 'badge-green' : 'badge-gray'}`}>
                        {a.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${a.activa ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => handleToggle(a.id, a.activa)}
                        title={a.activa ? 'Desactivar asignación' : 'Reactivar asignación'}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {a.activa ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                        {a.activa ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <ModalAsignacion onClose={() => setModal(false)} onSave={() => { setModal(false); cargar(); }} />}
    </div>
  );
}
