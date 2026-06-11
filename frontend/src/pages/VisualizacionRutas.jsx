import React, { useState, useEffect } from 'react';
import { getRutas, getZonas, getPuntosRuta } from '../services/rutasService.js';
import { getPuntos, getGeocercas } from '../services/puntosService.js';
import { getRecorridos, getRecorrido } from '../services/recorridosService.js';
import MapaBase from '../components/maps/MapaBase.jsx';
import CapaRutas from '../components/maps/CapaRutas.jsx';
import CapaPuntos from '../components/maps/CapaPuntos.jsx';
import CapaGeocercas from '../components/maps/CapaGeocercas.jsx';
import SimulacionCamion from '../components/maps/SimulacionCamion.jsx';
import Loader from '../components/shared/Loader.jsx';
import Button from '../components/shared/Button.jsx';

export default function VisualizacionRutas() {
  const [rutas, setRutas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [geocercas, setGeocercas] = useState([]);
  const [recorridos, setRecorridos] = useState([]);
  const [rutasActivas, setRutasActivas] = useState({});
  const [mostrarPuntos, setMostrarPuntos] = useState(true);
  const [mostrarGeocercas, setMostrarGeocercas] = useState(false);
  const [mostrarRecorridos, setMostrarRecorridos] = useState(false);
  const [filtroZona, setFiltroZona] = useState('');
  const [rutaDetalle, setRutaDetalle] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation State
  const [simulacionActiva, setSimulacionActiva] = useState(null);
  const [simulacionJugando, setSimulacionJugando] = useState(false);
  const [simulacionProgreso, setSimulacionProgreso] = useState({ index: 0, total: 0 });
  const [carrilesSimulados, setCarrilesSimulados] = useState({});

  useEffect(() => {
    document.title = 'Visualización de Rutas — MonitoreoRS Sucre';
    Promise.all([getRutas(), getZonas(), getPuntos(), getGeocercas(), getRecorridos()])
      .then(async ([rut, zon, pnt, geo, rec]) => {
        const rutasData = rut.data.data || [];
        const withPuntos = await Promise.all(
          rutasData.map(r => getPuntosRuta(r.id).then(res => ({ ...r, puntos: res.data.data || [] })))
        );
        setRutas(withPuntos);
        const activas = {};
        withPuntos.forEach(r => { activas[r.id] = r.activa === 1; });
        setRutasActivas(activas);
        setZonas(zon.data.data || []);
        setPuntos(pnt.data.data || []);
        setGeocercas(geo.data.data || []);
        const recsData = (rec.data.data || []).slice(0, 5);
        const recsWithCoords = await Promise.all(recsData.map(r => getRecorrido(r.id).then(res => res.data.data)));
        setRecorridos(recsWithCoords);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  // Pan and zoom to selected zone reference coordinates
  useEffect(() => {
    if (!mapInstance || !filtroZona || zonas.length === 0) return;
    const selectedZone = zonas.find(z => String(z.id) === filtroZona);
    if (selectedZone && selectedZone.lat_referencia && selectedZone.lng_referencia) {
      const lat = parseFloat(selectedZone.lat_referencia);
      const lng = parseFloat(selectedZone.lng_referencia);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapInstance.panTo({ lat, lng });
        mapInstance.setZoom(16);
      }
    }
  }, [filtroZona, zonas, mapInstance]);

  const rutasFiltradas = rutas.filter(r => !filtroZona || String(r.zona_id) === filtroZona);
  const rutasVisibles = rutasFiltradas.map(r => ({ ...r, activa: rutasActivas[r.id] ? 1 : 0 }));

  const toggleSimulacion = (rutaId) => {
    if (simulacionActiva === rutaId) {
      setSimulacionActiva(null);
      setSimulacionJugando(false);
    } else {
      setSimulacionActiva(rutaId);
      setSimulacionJugando(true);
      setSimulacionProgreso({ index: 0, total: 0 });
    }
  };

  return (
    <div>
      <div className="page-header"><h1>Visualización de Rutas</h1></div>
      {loading ? <Loader /> : (
        <div className="contenedor-rutas">
          {/* Left Side Panel */}
          <div className="panel-lateral-rutas">
            
            {/* Filters Card */}
            <div className="card" style={{ flexShrink: 0 }}>
              <div className="card-header"><h3 className="card-title">Filtros</h3></div>
              <div className="card-body" style={{ padding: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Zona</label>
                  <select className="form-control" value={filtroZona} onChange={e => setFiltroZona(e.target.value)}>
                    <option value="">Todas las zonas</option>
                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Layers Card */}
            <div className="card" style={{ flexShrink: 0 }}>
              <div className="card-header"><h3 className="card-title">Capas</h3></div>
              <div className="card-body" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--color-gray-800)' }}>
                  <input type="checkbox" checked={mostrarPuntos} onChange={e => setMostrarPuntos(e.target.checked)} />
                  Puntos Críticos
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--color-gray-800)' }}>
                  <input type="checkbox" checked={mostrarGeocercas} onChange={e => setMostrarGeocercas(e.target.checked)} />
                  Geocercas
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--color-gray-800)' }}>
                  <input type="checkbox" checked={mostrarRecorridos} onChange={e => setMostrarRecorridos(e.target.checked)} />
                  Recorridos Registrados
                </label>
              </div>
            </div>

            {/* Planned Routes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-gray-800)', margin: '4px 0' }}>Rutas Planificadas</h3>
              {rutasFiltradas.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--color-gray-400)', textAlign: 'center', padding: 20 }}>No se encontraron rutas.</p>
              ) : (
                rutasFiltradas.map(ruta => {
                  const isExpanded = rutaDetalle === ruta.id;
                  const isSimulatingThis = simulacionActiva === ruta.id;

                  return (
                    <div 
                      key={ruta.id} 
                      style={{ 
                        backgroundColor: 'var(--color-white)', 
                        border: '1px solid var(--color-gray-100)', 
                        borderRadius: '6px', 
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    >
                      {/* Checkbox and Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <input 
                          type="checkbox" 
                          style={{ marginTop: 3, cursor: 'pointer' }} 
                          checked={!!rutasActivas[ruta.id]}
                          onChange={e => setRutasActivas(prev => ({ ...prev, [ruta.id]: e.target.checked }))} 
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Route Type Badge */}
                          {ruta.tipo === 'actual' ? (
                            <span style={{ backgroundColor: '#E65100', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginBottom: 4 }}>
                              Ruta actual
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#1B5E20', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginBottom: 4 }}>
                              Ruta propuesta
                            </span>
                          )}
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-gray-800)', lineHeight: '1.3' }}>
                            {ruta.nombre}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-gray-600)', marginTop: 2 }}>
                            {ruta.zona_nombre} · {ruta.distancia_km} km
                          </div>
                        </div>
                      </div>

                      {/* Detail Expansion Drawer */}
                      {isExpanded && (
                        <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--color-gray-100)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-800)' }}>Frecuencia: </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>{ruta.frecuencia || '—'}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-800)' }}>Horario: </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>{ruta.horario_estimado || '—'}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-800)' }}>Distancia: </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>{ruta.distancia_km} km</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-gray-600)', lineHeight: '1.5', marginTop: 4 }}>
                            {ruta.descripcion}
                          </div>

                          {/* Simulation Control Button */}
                          <div style={{ marginTop: 8 }}>
                            {isSimulatingThis ? (
                              <Button 
                                size="sm" 
                                variant="danger" 
                                style={{ width: '100%', borderRadius: '4px' }} 
                                onClick={(e) => { e.preventDefault(); toggleSimulacion(ruta.id); }}
                              >
                                Detener simulación
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                style={{ width: '100%', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '4px' }} 
                                onClick={(e) => { e.preventDefault(); toggleSimulacion(ruta.id); }}
                              >
                                Simular recorrido
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expand / Collapse Button */}
                      <button 
                        onClick={() => setRutaDetalle(isExpanded ? null : ruta.id)}
                        style={{ width: '100%', background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 11, padding: '4px 0 0', cursor: 'pointer', fontWeight: 600, fontFamily: 'Arial' }}
                      >
                        {isExpanded ? 'Ocultar' : 'Ver detalle'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side Map Container */}
          <div className="mapa-rutas" style={{ position: 'relative' }}>
            <MapaBase height="100%" onMapLoad={setMapInstance}>
              <CapaRutas map={mapInstance} rutas={rutasVisibles} recorridos={mostrarRecorridos ? recorridos : []} />
              <CapaPuntos map={mapInstance} puntos={puntos} visible={mostrarPuntos} />
              <CapaGeocercas map={mapInstance} geocercas={geocercas} visible={mostrarGeocercas} />
              
              {/* Simulation Truck Layer */}
              {simulacionActiva && (
                <SimulacionCamion
                  map={mapInstance}
                  puntosRuta={rutas.find(r => r.id === simulacionActiva)?.puntos || []}
                  isPlaying={simulacionJugando}
                  speed={80}
                  onProgress={(idx, tot) => setSimulacionProgreso({ index: idx, total: tot })}
                  onFinished={() => {
                    setSimulacionActiva(null);
                    setSimulacionJugando(false);
                  }}
                  cachedPath={carrilesSimulados[simulacionActiva]}
                  onCachePath={(path) => setCarrilesSimulados(prev => ({ ...prev, [simulacionActiva]: path }))}
                />
              )}
            </MapaBase>

            {/* Floating Simulation Dashboard overlay */}
            {simulacionActiva && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  minWidth: '220px',
                  zIndex: 10,
                  fontFamily: 'Arial, Helvetica, sans-serif'
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', fontSize: 13, color: 'var(--color-gray-800)', fontWeight: 700 }}>
                  Simulación Activa
                </h4>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 2 }}>
                  {rutas.find(r => r.id === simulacionActiva)?.nombre}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-gray-600)', marginBottom: 8 }}>
                  Progreso: {Math.ceil((simulacionProgreso.index / (simulacionProgreso.total || 1)) * 100)}% 
                  ({simulacionProgreso.index} de {simulacionProgreso.total} puntos)
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="secondary" onClick={() => setSimulacionJugando(p => !p)}>
                    {simulacionJugando ? 'Pausar' : 'Reanudar'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => { setSimulacionActiva(null); setSimulacionJugando(false); }}>
                    Detener
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
