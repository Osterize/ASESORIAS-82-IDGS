import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        toast.success(`¡Bienvenido, ${data.user.nombre}!`);
        const rol = data.user.rol;
        if (rol === 'administrador') navigate('/admin/dashboard');
        else if (rol === 'docente') navigate('/docente/dashboard');
        else navigate('/alumno/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, var(--utn-blue-900) 0%, var(--utn-blue-700) 50%, var(--utn-blue-500) 100%)'
    }}>
      {/* Panel izquierdo */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        color: '#fff'
      }} className="hide-mobile">
        <div style={{ maxWidth: 420 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, border: '2px solid rgba(255,255,255,.3)'
          }}>
            <GraduationCap size={40} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Poppins', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
            Sistema de asesorías
          </h1>
          <p style={{ fontSize: 16, opacity: .85, lineHeight: 1.7, marginBottom: 32 }}>
            Universidad Tecnológica de Nayarit — Plataforma integral para la gestión de asesorías académicas.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Registro y seguimiento de sesiones', 'Asignación de tutores académicos', 'Confirmación segura por código', 'Gestión de justificantes'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--utn-gold)', flexShrink: 0
                }} />
                <span style={{ fontSize: 14, opacity: .9 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Form */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        boxShadow: '-20px 0 60px rgba(0,0,0,.2)'
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Logo mobile */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--utn-blue-700)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12
            }}>
              <GraduationCap size={28} color="#fff" />
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 22, color: 'var(--utn-blue-900)' }}>
              Iniciar Sesión
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
              Sistema de Asesorias UTN
            </p>
          </div>

          {params.get('expired') && (
            <div className="alert alert-warning" style={{ marginBottom: 20, fontSize: 13 }}>
              <AlertCircle size={16} /> Tu sesión expiró. Inicia sesión nuevamente.
            </div>
          )}

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20, fontSize: 13 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Correo institucional <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--gray-400)'
                }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="usuario@utn.edu.mx"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--gray-400)'
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)',
                    display: 'flex', padding: 4
                  }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 8, justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)',
                    borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block'
                  }} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', marginTop: 24 }}>
            ¿Problemas de acceso? Contacta al área de Servicios Escolares.
          </p>
        </div>
      </div>
    </div>
  );
}
