import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { PageHeader, LoadingSpinner, EstadoBadge, formatFecha, formatHora } from '../../components/shared/helpers';
import { CalendarDays, Users, UserCheck, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, stRes] = await Promise.all([
          api.get('/sesiones?limit=5'),
          api.get('/sesiones/estadisticas')
        ]);
        setSesiones(sRes.data.data.slice(0, 6));
        setStats(stRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Sesiones', value: stats?.total || 0, icon: CalendarDays, color: 'var(--utn-blue-600)', bg: 'var(--utn-blue-100)' },
    { label: 'Programadas', value: stats?.programadas || 0, icon: Clock, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Confirmadas', value: stats?.confirmadas || 0, icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-light)' },
    { label: 'Completadas', value: stats?.completadas || 0, icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Pendientes', value: stats?.pendientes || 0, icon: AlertCircle, color: 'var(--warning)', bg: 'var(--warning-light)' },
    { label: 'Canceladas', value: stats?.canceladas || 0, icon: XCircle, color: 'var(--danger)', bg: 'var(--danger-light)' },
  ];

  return (
    <div>
      <PageHeader
        title={`Bienvenido, ${user?.nombre}`}
        subtitle={`Panel de administración — ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* Stats grid */}
      <div className="grid grid-3 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Nueva Sesión', icon: CalendarDays, to: '/admin/sesiones', color: 'var(--utn-blue-700)' },
          { label: 'Asignar Tutor', icon: UserCheck, to: '/admin/asignaciones', color: '#7c3aed' },
          { label: 'Gestionar Usuarios', icon: Users, to: '/admin/usuarios', color: 'var(--success)' },
          { label: 'Justificantes', icon: FileText, to: '/admin/justificantes', color: 'var(--warning)' },
          { label: 'Reportes CSV', icon: TrendingUp, to: '/admin/reportes', color: '#0ea5e9' },
        ].map(a => (
          <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)', padding: '20px',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all .2s', cursor: 'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: a.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <a.icon size={20} color={a.color} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Sesiones recientes */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16 }}>Sesiones Recientes</h3>
          <Link to="/admin/sesiones" className="btn btn-secondary btn-sm">Ver todas</Link>
        </div>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          {sesiones.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={40} />
              <h4>Sin sesiones registradas</h4>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Docente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.alumno_nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{s.numero_control}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{s.docente_nombre}</td>
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
