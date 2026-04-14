import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../layout/Layout';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--utn-blue-900)'
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{
            width: 48, height: 48, border: '3px solid rgba(255,255,255,.2)',
            borderTopColor: '#fff', borderRadius: '50%', margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontFamily: 'Poppins', fontSize: 14, opacity: .7 }}>Cargando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) {
    const redirects = {
      administrador: '/admin/dashboard',
      docente: '/docente/dashboard',
      alumno: '/alumno/dashboard'
    };
    return <Navigate to={redirects[user.rol] || '/login'} replace />;
  }

  return <Layout>{children}</Layout>;
}
