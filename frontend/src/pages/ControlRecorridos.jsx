import React, { useState, useEffect } from 'react';
import { getRecorridos, getRecorrido, createRecorrido } from '../services/recorridosService.js';
import { getRutas } from '../services/rutasService.js';
import Badge from '../components/shared/Badge.jsx';
import Button from '../components/shared/Button.jsx';
import Modal from '../components/shared/Modal.jsx';
import AlertBanner from '../components/shared/AlertBanner.jsx';
import Loader from '../components/shared/Loader.jsx';

export default function ControlRecorridos() {
  const [tab, setTab] = useState('registrar');
  const [rutas, setRutas] = useState([]);
  const [recorridos, setRecorridos] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [form, setForm] = useState({ ruta_id: '', fecha: '', hora_inicio: '', hora_fin: '', observaciones: '' });
  const [coordenadas, setCoordenadas] = useState([{ lat: '', lng: '' }, { lat: '', lng: '' }]);
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [alert, setAlert] = useState(null);
  const [filtros, setFiltros] = useState({ ruta_id: '', fecha_desde: '', fecha_hasta: '', estado: '' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [recorridoDetalle, setRecorridoDetalle] = useState(null);

  useEffect(() => {
    document.title = 'Control de Recorridos — MonitoreoRS Sucre';
    getRutas().then(r => setRutas(r.data.data || []));
    cargarHistorial();
  }, []);

  const cargarHistorial = () => {
    setLoadingHist(true);
    getRecorridos(filtros).then(r => { setRecorridos(r.data.data || []); setLoadingHist(false); }).catch(() => setLoadingHist(false));
  };

  useEffect(() => { if (tab === 'historial') cargarHistorial(); }, [filtros, tab]);

  const agregarCoord = () => setCoordenadas(prev => [...prev, { lat: '', lng: '' }]);
  const quitarCoord = (i) => setCoordenadas(prev => prev.filter((_, idx) => idx !== i));
  const actualizarCoord = (i, field, val) => setCoordenadas(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  const registrar = async () => {
    if (!form.ruta_id || !form.fecha) { setAlert({ type: 'error', message: 'Ruta y fecha son requeridos' }); return; }
    const coordsValidas = coordenadas.filter(c => c.lat && c.lng).map(c => ({ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }));
    if (coordsValidas.length < 2) { setAlert({ type: 'error', message: 'Ingrese al menos 2 coordenadas válidas' }); return; }
    setSaving(true);
    try {
      const res = await createRecorrido({ ...form, coordenadas: coordsValidas });
      setResultado(res.data.data);
      setAlert({ type: 'success', message: 'Recorrido registrado y verificado exitosamente' });
      setForm({ ruta_id: '', fecha: '', hora_inicio: '', hora_fin: '', observaciones: '' });
      setCoordenadas([{ lat: '', lng: '' }, { lat: '', lng: '' }]);
    } catch { setAlert({ type: 'error', message: 'Error al registrar el recorrido' }); }
    setSaving(false);
  };

  const verDetalle = async (id) => {
    const res = await getRecorrido(id);
    setRecorridoDetalle(res.data.data);
    setDetailOpen(true);
  };

  return (
    <div>
      <div className="page-header"><h1>Control de Recorridos</h1></div>
      {alert && <AlertBanner type={alert.type} message={alert.message} autoDismiss onClose={() => setAlert(null)} />}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--color-gray-100)' }}>
        {['registrar', 'historial'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 24px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Arial', fontSize: 14, fontWeight: tab === t ? 700 : 400, color: tab === t ? 'var(--color-primary)' : 'var(--color-gray-600)', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', marginBottom: -2 }}>
            {t === 'registrar' ? 'Registrar Recorrido' : 'Historial'}
          </button>
        ))}
      </div>

      {tab === 'registrar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Datos del Recorrido</h3></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Ruta Planificada *</label>
                <select className="form-control" value={form.ruta_id} onChange={e => setForm(f => ({ ...f, ruta_id: e.target.value }))}>
                  <option value="">Seleccionar ruta...</option>
                  {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Fecha *</label><input className="form-control" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Hora Inicio</label><input className="form-control" type="time" value={form.hora_inicio} onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Hora Fin</label><input className="form-control" type="time" value={form.hora_fin} onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Observaciones</label><textarea className="form-control" rows={3} value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} /></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Coordenadas del Recorrido</h3>
              <Button size="sm" variant="secondary" onClick={agregarCoord}>+ Agregar Punto</Button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>#</th><th>Latitud</th><th>Longitud</th><th></th></tr></thead>
                  <tbody>
                    {coordenadas.map((c, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--color-gray-400)' }}>{i + 1}</td>
                        <td><input className="form-control" style={{ padding: '4px 8px' }} type="number" step="0.000001" placeholder="-19.060" value={c.lat} onChange={e => actualizarCoord(i, 'lat', e.target.value)} /></td>
                        <td><input className="form-control" style={{ padding: '4px 8px' }} type="number" step="0.000001" placeholder="-65.262" value={c.lng} onChange={e => actualizarCoord(i, 'lng', e.target.value)} /></td>
                        <td>{coordenadas.length > 2 && <Button size="sm" variant="danger" onClick={() => quitarCoord(i)}>✕</Button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <Button loading={saving} onClick={registrar} style={{ width: '100%' }}>Registrar y Verificar</Button>
            </div>
          </div>

          {resultado && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header"><h3 className="card-title">Resultado de Verificación</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 56, fontWeight: 700, color: resultado.porcentaje_cumplimiento >= 80 ? 'var(--color-success)' : 'var(--color-danger)', lineHeight: 1 }}>
                      {resultado.porcentaje_cumplimiento}%
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-gray-600)', marginTop: 4 }}>Cumplimiento</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 12 }}><Badge value={resultado.estado} type="estado" /></div>
                    <div className="progress-bar-wrapper" style={{ height: 16, borderRadius: 8, marginBottom: 8 }}>
                      <div className="progress-bar-fill" style={{ width: `${resultado.porcentaje_cumplimiento}%`, height: '100%', background: resultado.porcentaje_cumplimiento >= 80 ? 'var(--color-success)' : 'var(--color-danger)', borderRadius: 8, transition: 'width 1s ease' }} />
                    </div>
                    {resultado.porcentaje_cumplimiento < 80 && (
                      <div className="alert-banner alert-warning" style={{ marginTop: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'text-bottom' }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Desviación detectada. Se generó una notificación automática.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'historial' && (
        <div>
          <div className="filters-bar">
            <select className="form-control" style={{ width: 200 }} value={filtros.ruta_id} onChange={e => setFiltros(f => ({ ...f, ruta_id: e.target.value }))}>
              <option value="">Todas las rutas</option>
              {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            <input className="form-control" type="date" value={filtros.fecha_desde} onChange={e => setFiltros(f => ({ ...f, fecha_desde: e.target.value }))} placeholder="Desde" />
            <input className="form-control" type="date" value={filtros.fecha_hasta} onChange={e => setFiltros(f => ({ ...f, fecha_hasta: e.target.value }))} placeholder="Hasta" />
            <select className="form-control" style={{ width: 180 }} value={filtros.estado} onChange={e => setFiltros(f => ({ ...f, estado: e.target.value }))}>
              <option value="">Todos los estados</option>
              <option value="completado">Completado</option>
              <option value="desviacion_detectada">Desviación</option>
              <option value="incompleto">Incompleto</option>
            </select>
          </div>
          <div className="card">
            {loadingHist ? <Loader /> : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Ruta</th><th>Fecha</th><th>Hora Inicio</th><th>Hora Fin</th><th>Estado</th><th>Cumplimiento</th><th>Observaciones</th><th></th></tr></thead>
                  <tbody>
                    {recorridos.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--color-gray-400)' }}>No hay recorridos registrados</td></tr>
                    ) : recorridos.map(r => (
                      <tr key={r.id}>
                        <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.ruta_nombre}</td>
                        <td>{r.fecha ? new Date(r.fecha).toLocaleDateString('es-BO') : '—'}</td>
                        <td>{r.hora_inicio || '—'}</td>
                        <td>{r.hora_fin || '—'}</td>
                        <td><Badge value={r.estado} type="estado" /></td>
                        <td style={{ minWidth: 120 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="progress-bar-wrapper" style={{ flex: 1 }}>
                              <div className="progress-bar-fill" style={{ width: `${r.porcentaje_cumplimiento || 0}%`, background: r.porcentaje_cumplimiento >= 80 ? 'var(--color-success)' : 'var(--color-danger)' }} />
                            </div>
                            <span style={{ fontSize: 11, minWidth: 32 }}>{r.porcentaje_cumplimiento}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>{r.observaciones || '—'}</td>
                        <td><Button size="sm" variant="ghost" onClick={() => verDetalle(r.id)}>Ver</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle del Recorrido" size="lg"
        footer={<Button onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {recorridoDetalle && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><b>Ruta:</b> {recorridoDetalle.ruta_nombre}</div>
              <div><b>Zona:</b> {recorridoDetalle.zona_nombre}</div>
              <div><b>Fecha:</b> {recorridoDetalle.fecha ? new Date(recorridoDetalle.fecha).toLocaleDateString('es-BO') : '—'}</div>
              <div><b>Estado:</b> <Badge value={recorridoDetalle.estado} type="estado" /></div>
              <div><b>Hora inicio:</b> {recorridoDetalle.hora_inicio || '—'}</div>
              <div><b>Hora fin:</b> {recorridoDetalle.hora_fin || '—'}</div>
              <div><b>Cumplimiento:</b> {recorridoDetalle.porcentaje_cumplimiento}%</div>
            </div>
            {recorridoDetalle.observaciones && <div style={{ marginBottom: 12 }}><b>Observaciones:</b> {recorridoDetalle.observaciones}</div>}
            {recorridoDetalle.coordenadas?.length > 0 && (
              <div>
                <b>Coordenadas registradas ({recorridoDetalle.coordenadas.length} puntos):</b>
                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
                  <table style={{ width: '100%', fontSize: 12 }}>
                    <thead><tr><th>#</th><th>Latitud</th><th>Longitud</th><th>Dentro geocerca</th></tr></thead>
                    <tbody>
                      {recorridoDetalle.coordenadas.map((c, i) => (
                        <tr key={i} style={{ background: c.dentro_geocerca ? 'inherit' : '#fff3f3' }}>
                          <td>{c.orden}</td>
                          <td>{c.lat}</td>
                          <td>{c.lng}</td>
                          <td>{c.dentro_geocerca ? 'Sí' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
