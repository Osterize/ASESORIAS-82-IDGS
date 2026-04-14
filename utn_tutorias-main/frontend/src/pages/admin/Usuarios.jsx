import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PageHeader, LoadingSpinner, Avatar, ConfirmDialog } from '../../components/shared/helpers';
import { Plus, Search, RefreshCw, UserX, UserCheck } from 'lucide-react';
import { X } from 'lucide-react';

const ROL_BADGE = {
  administrador: { label: 'Admin', class: 'badge-gold' },
  docente:       { label: 'Docente', class: 'badge-blue' },
  alumno:        { label: 'Alumno', class: 'badge-green' }
};

function ModalUsuario({ usuario, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: '', apellido_paterno: '', apellido_materno: '',
    email: '', password: '', rol: 'alumno',
    numero_control: '', numero_empleado: '', carrera: '', semestre: ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (usuario) setForm({ ...usuario, password: '' });
  }, [usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (usuario) {
        await api.put(`/usuarios/${usuario.id}`, form);
        toast.success('Usuario actualizado');
      } else {
        await api.post('/auth/register', form);
        toast.success('Usuario registrado');
      }
      onSave();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al guardar');
    } finally { setLoading(false); }
  };

  const isAlumno = form.rol === 'alumno';
  const isDocente = form.rol === 'docente' || form.rol === 'administrador';

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>{usuario ? 'Editar Usuario' : 'Registrar Usuario'}</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Nombre <span>*</span></label>
                <input className="form-input" value={form.nombre} onChange={e => set('nombre', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido Paterno <span>*</span></label>
                <input className="form-input" value={form.apellido_paterno} onChange={e => set('apellido_paterno', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido Materno</label>
                <input className="form-input" value={form.apellido_materno || ''} onChange={e => set('apellido_materno', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Rol <span>*</span></label>
                <select className="form-select" value={form.rol} onChange={e => set('rol', e.target.value)} required>
                  <option value="alumno">Alumno</option>
                  <option value="docente">Docente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Email institucional <span>*</span></label>
                <input type="email" className="form-input" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="usuario@utn.edu.mx" required disabled={!!usuario} />
              </div>
              {!usuario && (
                <div className="form-group">
                  <label className="form-label">Contraseña <span>*</span></label>
                  <input type="password" className="form-input" value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres" required minLength={8} />
                </div>
              )}
              {isAlumno && (
                <>
                  <div className="form-group">
                    <label className="form-label">Número de control</label>
                    <input className="form-input" value={form.numero_control || ''}
                      onChange={e => set('numero_control', e.target.value)} placeholder="20XXXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Carrera</label>
                    <input className="form-input" value={form.carrera || ''}
                      onChange={e => set('carrera', e.target.value)} placeholder="Ing. en Sistemas..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cuatrimestre</label>
                    <input type="number" min={1} max={10} className="form-input"
                      value={form.semestre || ''}
                      onChange={e => set('semestre', e.target.value)} />
                  </div>
                </>
              )}
              {isDocente && (
                <div className="form-group">
                  <label className="form-label">N° Empleado</label>
                  <input className="form-input" value={form.numero_empleado || ''}
                    onChange={e => set('numero_empleado', e.target.value)} />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : usuario ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [modal, setModal] = useState(null); // null | 'nuevo' | usuario obj
  const [confirm, setConfirm] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroRol) params.append('rol', filtroRol);
      if (busqueda) params.append('search', busqueda);
      const { data } = await api.get(`/usuarios?${params}`);
      setUsuarios(data.data);
    } catch { toast.error('Error al cargar usuarios'); }
    finally { setLoading(false); }
  }, [filtroRol, busqueda]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleDesactivar = async (id) => {
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Usuario desactivado');
      cargar();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setConfirm(null); }
  };

  const handleReactivar = async (id) => {
    try {
      await api.put(`/usuarios/${id}`, { activo: 1 });
      toast.success('Usuario reactivado');
      cargar();
    } catch (e) { toast.error('Error al reactivar'); }
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        subtitle="Administra alumnos, docentes y administradores del sistema"
        action={
          <button className="btn btn-primary" onClick={() => setModal('nuevo')}>
            <Plus size={17} /> Registrar Usuario
          </button>
        }
      />

      <div className="card mb-6">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input className="form-input" style={{ paddingLeft: 36 }}
                placeholder="Buscar nombre, email, N° control..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 160 }} value={filtroRol} onChange={e => setFiltroRol(e.target.value)}>
              <option value="">Todos los roles</option>
              <option value="alumno">Alumnos</option>
              <option value="docente">Docentes</option>
              <option value="administrador">Admins</option>
            </select>
            <button className="btn btn-secondary" onClick={cargar}><RefreshCw size={15} /></button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
          {loading ? <LoadingSpinner /> : (
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>N° Control / Empleado</th>
                  <th>Carrera / Cuatrimestre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar nombre={u.nombre} apellido={u.apellido_paterno} size={34} />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{u.nombre} {u.apellido_paterno} {u.apellido_materno || ''}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${ROL_BADGE[u.rol]?.class || 'badge-gray'}`}>
                        {ROL_BADGE[u.rol]?.label || u.rol}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{u.numero_control || u.numero_empleado || '—'}</td>
                    <td style={{ fontSize: 13 }}>
                      {u.carrera ? `${u.carrera} ${u.semestre ? `(Sem. ${u.semestre})` : ''}` : '—'}
                    </td>
                    <td>
                      <span className={`badge ${u.activo ? 'badge-green' : 'badge-red'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal(u)}>Editar</button>
                        {u.activo ? (
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirm(u)}>
                            <UserX size={13} />
                          </button>
                        ) : (
                          <button className="btn btn-success btn-sm" onClick={() => handleReactivar(u.id)}>
                            <UserCheck size={13} />
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

      {modal && (
        <ModalUsuario
          usuario={modal === 'nuevo' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); cargar(); }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title="Desactivar usuario"
          message={`¿Desactivar a ${confirm.nombre} ${confirm.apellido_paterno}? No podrá iniciar sesión.`}
          onConfirm={() => handleDesactivar(confirm.id)}
          onCancel={() => setConfirm(null)}
          danger
        />
      )}
    </div>
  );
}
