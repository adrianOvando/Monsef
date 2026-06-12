import React, { useState, useEffect, useRef } from 'react';
import { getResumen, getUltimosRecorridos, getNotificaciones } from '../services/reportesService.js';
import { getRutas, getPuntosRuta } from '../services/rutasService.js';
import { getPuntos } from '../services/puntosService.js';
import MapaBase from '../components/maps/MapaBase.jsx';
import CapaRutas from '../components/maps/CapaRutas.jsx';
import CapaPuntos from '../components/maps/CapaPuntos.jsx';
import Badge from '../components/shared/Badge.jsx';
import Loader from '../components/shared/Loader.jsx';

const PUNTOS_REFERENCIA = [
  { nombre: 'Colegio Humboldt', lat: -19.055253599999993, lng: -65.26232576441824 },
  { nombre: 'Pulacayo', lat: -19.056878706607797, lng: -65.2636688528034 },
  { nombre: 'Madre de Dios 1', lat: -19.060902736049425, lng: -65.26213321020619 },
  { nombre: 'Alta Prosperina', lat: -19.064468075247696, lng: -65.26054962384545 },
  { nombre: 'Pulacayo 2', lat: -19.05712180772799, lng: -65.265331505866 },
  { nombre: 'Humboldt 2', lat: -19.055875143038893, lng: -65.26107348621176 },
  { nombre: 'Colegio Goytia', lat: -19.058536442602527, lng: -65.26006026427821 },
];

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [recorridos, setRecorridos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);
  const refMarkersRef = useRef([]);

  useEffect(() => {
    document.title = 'Dashboard — MonitoreoRS Sucre';
    Promise.all([
      getResumen(), getUltimosRecorridos(), getNotificaciones({ leida: 0 }), getRutas(), getPuntos()
    ]).then(([res, rec, notif, rut, pnt]) => {
      setResumen(res.data.data);
      setRecorridos(rec.data.data || []);
      setNotificaciones((notif.data.data || []).slice(0, 5));
      // Attach puntos to rutas
      const rutasData = rut.data.data || [];
      setRutas(rutasData.map(r => ({ ...r, puntos: [] })));
      setPuntos(pnt.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Fetch puntos_ruta for each ruta
  useEffect(() => {
    if (rutas.length === 0) return;
    Promise.all(rutas.map(r => getPuntosRuta(r.id).then(res => ({ ...r, puntos: res.data.data || [] })))).then(setRutas);
  }, [rutas.length]);

  // Add reference markers when map loads
  useEffect(() => {
    if (!mapInstance || !window.google) return;
    refMarkersRef.current.forEach(m => m.setMap(null));
    refMarkersRef.current = PUNTOS_REFERENCIA.map(p => {
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstance,
        title: p.nombre,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#1B5E20', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 8 },
      });
      const iw = new window.google.maps.InfoWindow({ content: `<b style="font-family:Arial">${p.nombre}</b>` });
      marker.addListener('click', () => iw.open(mapInstance, marker));
      return marker;
    });
  }, [mapInstance]);

  if (loading) return <Loader fullscreen />;

  const kpis = [
    { 
      label: 'Zonas Monitoreadas', 
      value: resumen?.totalZonas ?? 0, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
          <line x1="9" y1="3" x2="9" y2="18"></line>
          <line x1="15" y1="6" x2="15" y2="21"></line>
        </svg>
      ), 
      color: 'var(--color-primary)' 
    },
    { 
      label: 'Rutas Planificadas Activas', 
      value: resumen?.totalRutas ?? 0, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-info)' }}>
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      ), 
      color: 'var(--color-info)' 
    },
    { 
      label: 'Puntos Críticos', 
      value: resumen?.totalPuntos ?? 0, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-warning)' }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ), 
      color: 'var(--color-warning)', 
      sub: resumen?.totalAlto ? `${resumen.totalAlto} alto` : null 
    },
    { 
      label: 'Recorridos del Mes', 
      value: resumen?.totalMes ?? 0, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-success)' }}>
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      ), 
      color: 'var(--color-success)' 
    },
    { 
      label: 'Horarios Establecidos', 
      value: resumen?.totalHorarios ?? 0, 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ), 
      color: 'var(--color-primary)' 
    },
  ];

  return (
    <div>
      <div className="page-header"><h1>Dashboard</h1><span style={{ color: 'var(--color-gray-400)', fontSize: 13 }}>Vista general del sistema</span></div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card kpi-card">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 24, display: 'flex', alignItems: 'center' }}>{kpi.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                {kpi.sub && <span className="badge badge-danger" style={{ fontSize: 11 }}>{kpi.sub}</span>}
                <div style={{ fontSize: 12, color: 'var(--color-gray-600)', marginTop: 2 }}>{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map + Notifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Mapa de Cobertura</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            <MapaBase height="380px" onMapLoad={(m) => { setMapInstance(m); }}>
              <CapaRutas map={mapInstance} rutas={rutas.filter(r => r.activa)} />
              <CapaPuntos map={mapInstance} puntos={puntos} visible={true} />
            </MapaBase>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Notificaciones Recientes</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {notificaciones.length === 0 ? (
              <p style={{ padding: 16, color: 'var(--color-gray-400)', textAlign: 'center' }}>Sin notificaciones nuevas</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notificaciones.map((n) => (
                  <li key={n.id} className="notification-item notification-unread">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{n.titulo}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>{n.mensaje?.substring(0, 80)}…</div>
                      </div>
                      <Badge value={n.tipo} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 4 }}>
                      {n.created_at ? new Date(n.created_at).toLocaleDateString('es-BO') : ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Últimos recorridos */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Últimos Recorridos</h3></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Ruta</th><th>Fecha</th><th>Estado</th><th>Cumplimiento</th><th>Observaciones</th></tr></thead>
              <tbody>
                {recorridos.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--color-gray-400)' }}>No hay recorridos registrados</td></tr>
                ) : recorridos.map((r) => (
                  <tr key={r.id}>
                    <td>{r.ruta_nombre || r.ruta}</td>
                    <td>{r.fecha ? new Date(r.fecha).toLocaleDateString('es-BO') : '—'}</td>
                    <td><Badge value={r.estado} type="estado" /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar-wrapper" style={{ flex: 1 }}>
                          <div className="progress-bar-fill" style={{ width: `${r.porcentaje_cumplimiento || 0}%`, background: r.porcentaje_cumplimiento >= 80 ? 'var(--color-success)' : 'var(--color-danger)' }} />
                        </div>
                        <span style={{ fontSize: 12, minWidth: 36 }}>{r.porcentaje_cumplimiento || 0}%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-gray-600)', fontSize: 12 }}>{r.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
