import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PageHeader, Avatar } from '../components/shared/helpers';
import { Lock, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Perfil() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) return toast.error('Las contraseñas no coinciden');
    if (passForm.newPassword.length < 8) return toast.error('La contraseña debe tener al menos 8 caracteres');
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success('Contraseña actualizada correctamente');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al cambiar contraseña');
    } finally { setLoading(false); }
  };

  const ROL_LABELS = { administrador: 'Administrador', docente: 'Docente', alumno: 'Alumno' };

  return (
    <div>
      <PageHeader title="Mi Perfil" subtitle="Información de tu cuenta en el sistema" />

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar perfil */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <Avatar nombre={user?.nombre} apellido={user?.apellido_paterno} size={72} />
              <h3 style={{ marginTop: 12, fontSize: 16 }}>{user?.nombre} {user?.apellido_paterno}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{user?.email}</p>
              <span className="badge badge-blue" style={{ marginTop: 8 }}>
                {ROL_LABELS[user?.rol] || user?.rol}
              </span>
            </div>
            <div className="card-footer" style={{ background: 'none' }}>
              {[
                { id: 'info', label: 'Información', icon: User },
                { id: 'seguridad', label: 'Seguridad', icon: Lock },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`btn w-full ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'flex-start', marginBottom: 6 }}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1 }}>
          {tab === 'info' && (
            <div className="card">
              <div className="card-header"><h3 style={{ fontSize: 16 }}><User size={16} style={{ display: 'inline', marginRight: 8 }} />Información Personal</h3></div>
              <div className="card-body">
                <div className="grid grid-2 gap-4">
                  {[
                    { label: 'Nombre', value: user?.nombre },
                    { label: 'Apellido Paterno', value: user?.apellido_paterno },
                    { label: 'Apellido Materno', value: user?.apellido_materno || '—' },
                    { label: 'Email', value: user?.email },
                    { label: 'N° Control', value: user?.numero_control || '—' },
                    { label: 'N° Empleado', value: user?.numero_empleado || '—' },
                    { label: 'Carrera', value: user?.carrera || '—' },
                    { label: 'Cuatrimestre', value: user?.semestre ? `${user.semestre}°` : '—' },
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                        {f.label}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--gray-800)' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div className="alert alert-info" style={{ marginTop: 20, fontSize: 13 }}>
                  <Shield size={15} />
                  Para modificar tus datos, contacta al área de Servicios Escolares.
                </div>
              </div>
            </div>
          )}

          {tab === 'seguridad' && (
            <div className="card">
              <div className="card-header"><h3 style={{ fontSize: 16 }}><Lock size={16} style={{ display: 'inline', marginRight: 8 }} />Cambiar Contraseña</h3></div>
              <div className="card-body">
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                  <div className="form-group">
                    <label className="form-label">Contraseña actual <span>*</span></label>
                    <input type="password" className="form-input"
                      value={passForm.currentPassword}
                      onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))}
                      required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nueva contraseña <span>*</span></label>
                    <input type="password" className="form-input"
                      value={passForm.newPassword}
                      onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                      minLength={8} required />
                    <span className="form-hint">Mínimo 8 caracteres</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmar nueva contraseña <span>*</span></label>
                    <input type="password" className="form-input"
                      value={passForm.confirm}
                      onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
