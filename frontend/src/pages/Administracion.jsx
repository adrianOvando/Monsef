import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getUsuarios, createUsuario, updateUsuario, toggleUsuario, getRoles } from '../services/authService.js';
import { getZonas, getRutas, getPuntosRuta, createRuta, updateRuta, toggleRuta, toggleZona } from '../services/rutasService.js';
import { getGeocercas, createGeocerca, toggleGeocerca } from '../services/puntosService.js';
import Table from '../components/shared/Table.jsx';
import Button from '../components/shared/Button.jsx';
import Modal from '../components/shared/Modal.jsx';
import Badge from '../components/shared/Badge.jsx';
import AlertBanner from '../components/shared/AlertBanner.jsx';

const TABS = ['Usuarios', 'Zonas', 'Rutas Planificadas', 'Geocercas'];

export default function Administracion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Usuarios');
  const [alert, setAlert] = useState(null);

  // --- Usuarios ---
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [uModal, setUModal] = useState(false);
  const [uEdit, setUEdit] = useState(null);
  const [uForm, setUForm] = useState({ nombre: '', email: '', rol_id: '', password: '' });
  const [uSaving, setUSaving] = useState(false);

  // --- Zonas ---
  const [zonas, setZonas] = useState([]);

  // --- Rutas ---
  const [rutas, setRutas] = useState([]);
  const [rModal, setRModal] = useState(false);
  const [rEdit, setREdit] = useState(null);
  const [rForm, setRForm] = useState({ nombre: '', zona_id: '', frecuencia: '', horario_estimado: '', distancia_km: '', descripcion: '', puntos_ruta: [] });
  const [rSaving, setRSaving] = useState(false);

  // --- Geocercas ---
  const [geocercas, setGeocercas] = useState([]);
  const [gModal, setGModal] = useState(false);
  const [gForm, setGForm] = useState({ ruta_id: '', nombre: '', radio_metros: 100, poligono_json: '' });
  const [gSaving, setGSaving] = useState(false);

  useEffect(() => {
    document.title = 'Administración — MonitoreoRS Sucre';
    if (user?.rol !== 'admin') navigate('/dashboard');
  }, [user]);

  useEffect(() => {
    if (tab === 'Usuarios') { getUsuarios().then(r => setUsuarios(r.data.data || [])); getRoles().then(r => setRoles(r.data.data || [])); }
    if (tab === 'Zonas') { getZonas().then(r => setZonas(r.data.data || [])); }
    if (tab === 'Rutas Planificadas') { getRutas().then(r => setRutas(r.data.data || [])); getZonas().then(r => setZonas(r.data.data || [])); }
    if (tab === 'Geocercas') { getGeocercas().then(r => setGeocercas(r.data.data || [])); getRutas().then(r => setRutas(r.data.data || [])); }
  }, [tab]);

  // ── Usuarios ──────────────────────────────────────────────
  const abrirU = (u = null) => {
    setUEdit(u);
    setUForm(u ? { nombre: u.nombre, email: u.email, rol_id: u.rol_id, password: '' } : { nombre: '', email: '', rol_id: '', password: '' });
    setUModal(true);
  };
  const guardarU = async () => {
    setUSaving(true);
    try {
      if (uEdit) { await updateUsuario(uEdit.id, uForm); }
      else { await createUsuario(uForm); }
      setAlert({ type: 'success', message: 'Usuario guardado' });
      setUModal(false);
      getUsuarios().then(r => setUsuarios(r.data.data || []));
    } catch { setAlert({ type: 'error', message: 'Error al guardar usuario' }); }
    setUSaving(false);
  };
  const togU = async (id) => { await toggleUsuario(id); getUsuarios().then(r => setUsuarios(r.data.data || [])); };

  // ── Zonas ──────────────────────────────────────────────────
  const togZ = async (id) => { await toggleZona(id); getZonas().then(r => setZonas(r.data.data || [])); };

  // ── Rutas ──────────────────────────────────────────────────
  const abrirR = async (r = null) => {
    setREdit(r);
    if (r) {
      const pts = await getPuntosRuta(r.id);
      setRForm({ nombre: r.nombre, zona_id: r.zona_id, frecuencia: r.frecuencia || '', horario_estimado: r.horario_estimado || '', distancia_km: r.distancia_km || '', descripcion: r.descripcion || '', puntos_ruta: (pts.data.data || []).map(p => ({ lat: p.lat, lng: p.lng, descripcion: p.descripcion || '' })) });
    } else {
      setRForm({ nombre: '', zona_id: '', frecuencia: '', horario_estimado: '', distancia_km: '', descripcion: '', puntos_ruta: [{ lat: '', lng: '', descripcion: '' }] });
    }
    setRModal(true);
  };
  const guardarR = async () => {
    setRSaving(true);
    try {
      if (rEdit) { await updateRuta(rEdit.id, rForm); }
      else { await createRuta(rForm); }
      setAlert({ type: 'success', message: 'Ruta guardada' });
      setRModal(false);
      getRutas().then(r => setRutas(r.data.data || []));
    } catch { setAlert({ type: 'error', message: 'Error al guardar ruta' }); }
    setRSaving(false);
  };
  const togR = async (id) => { await toggleRuta(id); getRutas().then(r => setRutas(r.data.data || [])); };

  // ── Geocercas ──────────────────────────────────────────────
  const guardarG = async () => {
    setGSaving(true);
    try {
      let poligono = gForm.poligono_json;
      if (typeof poligono === 'string') poligono = JSON.parse(poligono);
      await createGeocerca({ ...gForm, poligono_json: poligono });
      setAlert({ type: 'success', message: 'Geocerca creada' });
      setGModal(false);
      getGeocercas().then(r => setGeocercas(r.data.data || []));
    } catch { setAlert({ type: 'error', message: 'Error al crear geocerca. Verifique el JSON.' }); }
    setGSaving(false);
  };
  const togG = async (id) => { await toggleGeocerca(id); getGeocercas().then(r => setGeocercas(r.data.data || [])); };

  return (
    <div>
      <div className="page-header"><h1>⚙️ Administración</h1></div>
      {alert && <AlertBanner type={alert.type} message={alert.message} autoDismiss onClose={() => setAlert(null)} />}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--color-gray-100)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Arial', fontSize: 13, fontWeight: tab === t ? 700 : 400, color: tab === t ? 'var(--color-primary)' : 'var(--color-gray-600)', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Usuarios ── */}
      {tab === 'Usuarios' && (
        <div>
          <div className="page-header" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 16 }}>Gestión de Usuarios</h2><Button onClick={() => abrirU()}>+ Nuevo Usuario</Button></div>
          <div className="card">
            <Table columns={[
              { key: 'nombre', label: 'Nombre' },
              { key: 'email', label: 'Email' },
              { key: 'rol', label: 'Rol', render: v => <span className="badge badge-info">{v}</span> },
              { key: 'activo', label: 'Activo', render: v => <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Activo' : 'Inactivo'}</span> },
              { key: 'created_at', label: 'Creado', render: v => v ? new Date(v).toLocaleDateString('es-BO') : '—' },
              { key: 'acciones', label: 'Acciones', render: (_, row) => (<div style={{ display: 'flex', gap: 6 }}><Button size="sm" variant="secondary" onClick={() => abrirU(row)}>Editar</Button><Button size="sm" variant={row.activo ? 'danger' : 'secondary'} onClick={() => togU(row.id)}>{row.activo ? 'Desactivar' : 'Activar'}</Button></div>) },
            ]} data={usuarios} emptyMessage="Sin usuarios" />
          </div>
          <Modal isOpen={uModal} onClose={() => setUModal(false)} title={uEdit ? 'Editar Usuario' : 'Nuevo Usuario'} footer={<><Button variant="secondary" onClick={() => setUModal(false)}>Cancelar</Button><Button loading={uSaving} onClick={guardarU}>Guardar</Button></>}>
            <div className="form-group"><label className="form-label">Nombre</label><input className="form-control" value={uForm.nombre} onChange={e => setUForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={uForm.email} onChange={e => setUForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Rol</label>
              <select className="form-control" value={uForm.rol_id} onChange={e => setUForm(f => ({ ...f, rol_id: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {roles.map(r => {
                  const roleLabels = {
                    admin: 'Administrador',
                    supervisor: 'Supervisor municipal',
                    operador: 'Operador / personal de recolección'
                  };
                  return <option key={r.id} value={r.id}>{roleLabels[r.nombre] || r.nombre}</option>;
                })}
              </select>
            </div>
            <div className="form-group"><label className="form-label">{uEdit ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label><input className="form-control" type="password" value={uForm.password} onChange={e => setUForm(f => ({ ...f, password: e.target.value }))} /></div>
          </Modal>
        </div>
      )}

      {/* ── Zonas ── */}
      {tab === 'Zonas' && (
        <div className="card">
          <Table columns={[
            { key: 'nombre', label: 'Nombre' },
            { key: 'descripcion', label: 'Descripción', render: v => v ? (v.length > 60 ? v.substring(0, 60) + '…' : v) : '—' },
            { key: 'lat_referencia', label: 'Lat', render: v => parseFloat(v).toFixed(6) },
            { key: 'lng_referencia', label: 'Lng', render: v => parseFloat(v).toFixed(6) },
            { key: 'activa', label: 'Estado', render: v => <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Activa' : 'Inactiva'}</span> },
            { key: 'acciones', label: 'Acciones', render: (_, row) => <Button size="sm" variant={row.activa ? 'danger' : 'secondary'} onClick={() => togZ(row.id)}>{row.activa ? 'Desactivar' : 'Activar'}</Button> },
          ]} data={zonas} emptyMessage="Sin zonas" />
        </div>
      )}

      {/* ── Rutas ── */}
      {tab === 'Rutas Planificadas' && (
        <div>
          <div className="page-header" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 16 }}>Rutas Planificadas</h2><Button onClick={() => abrirR()}>+ Nueva Ruta</Button></div>
          <div className="card">
            <Table columns={[
              { key: 'nombre', label: 'Nombre' },
              { key: 'zona_nombre', label: 'Zona' },
              { key: 'frecuencia', label: 'Frecuencia', render: v => v || '—' },
              { key: 'horario_estimado', label: 'Horario', render: v => v || '—' },
              { key: 'distancia_km', label: 'Dist. km', render: v => v ? `${v} km` : '—' },
              { key: 'activa', label: 'Estado', render: v => <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Activa' : 'Inactiva'}</span> },
              { key: 'acciones', label: 'Acciones', render: (_, row) => (<div style={{ display: 'flex', gap: 6 }}><Button size="sm" variant="secondary" onClick={() => abrirR(row)}>Editar</Button><Button size="sm" variant={row.activa ? 'danger' : 'secondary'} onClick={() => togR(row.id)}>{row.activa ? 'Desactivar' : 'Activar'}</Button></div>) },
            ]} data={rutas} emptyMessage="Sin rutas" />
          </div>
          <Modal isOpen={rModal} onClose={() => setRModal(false)} title={rEdit ? 'Editar Ruta' : 'Nueva Ruta'} size="lg"
            footer={<><Button variant="secondary" onClick={() => setRModal(false)}>Cancelar</Button><Button loading={rSaving} onClick={guardarR}>Guardar</Button></>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Nombre</label><input className="form-control" value={rForm.nombre} onChange={e => setRForm(f => ({ ...f, nombre: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Zona</label>
                <select className="form-control" value={rForm.zona_id} onChange={e => setRForm(f => ({ ...f, zona_id: e.target.value }))}>
                  <option value="">Seleccionar zona</option>
                  {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Distancia (km)</label><input className="form-control" type="number" step="0.1" value={rForm.distancia_km} onChange={e => setRForm(f => ({ ...f, distancia_km: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Frecuencia</label><input className="form-control" value={rForm.frecuencia} onChange={e => setRForm(f => ({ ...f, frecuencia: e.target.value }))} placeholder="Lunes, Miércoles, Viernes" /></div>
              <div className="form-group"><label className="form-label">Horario</label><input className="form-control" value={rForm.horario_estimado} onChange={e => setRForm(f => ({ ...f, horario_estimado: e.target.value }))} placeholder="06:00 - 08:00" /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Descripción</label><textarea className="form-control" rows={2} value={rForm.descripcion} onChange={e => setRForm(f => ({ ...f, descripcion: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><b>Puntos de Ruta</b><Button size="sm" variant="secondary" onClick={() => setRForm(f => ({ ...f, puntos_ruta: [...f.puntos_ruta, { lat: '', lng: '', descripcion: '' }] }))}>+ Punto</Button></div>
              {rForm.puntos_ruta.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 8, marginBottom: 8 }}>
                  <input className="form-control" type="number" step="0.000001" placeholder="Latitud" value={p.lat} onChange={e => setRForm(f => ({ ...f, puntos_ruta: f.puntos_ruta.map((pt, idx) => idx === i ? { ...pt, lat: e.target.value } : pt) }))} />
                  <input className="form-control" type="number" step="0.000001" placeholder="Longitud" value={p.lng} onChange={e => setRForm(f => ({ ...f, puntos_ruta: f.puntos_ruta.map((pt, idx) => idx === i ? { ...pt, lng: e.target.value } : pt) }))} />
                  <input className="form-control" placeholder="Descripción" value={p.descripcion} onChange={e => setRForm(f => ({ ...f, puntos_ruta: f.puntos_ruta.map((pt, idx) => idx === i ? { ...pt, descripcion: e.target.value } : pt) }))} />
                  {rForm.puntos_ruta.length > 1 && <Button size="sm" variant="danger" onClick={() => setRForm(f => ({ ...f, puntos_ruta: f.puntos_ruta.filter((_, idx) => idx !== i) }))}>✕</Button>}
                </div>
              ))}
            </div>
          </Modal>
        </div>
      )}

      {/* ── Geocercas ── */}
      {tab === 'Geocercas' && (
        <div>
          <div className="page-header" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 16 }}>Geocercas</h2><Button onClick={() => { setGForm({ ruta_id: '', nombre: '', radio_metros: 100, poligono_json: '' }); setGModal(true); }}>+ Nueva Geocerca</Button></div>
          <div className="card">
            <Table columns={[
              { key: 'nombre', label: 'Nombre' },
              { key: 'ruta_nombre', label: 'Ruta' },
              { key: 'radio_metros', label: 'Radio', render: v => `${v} m` },
              { key: 'activa', label: 'Estado', render: v => <span className={`badge ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Activa' : 'Inactiva'}</span> },
              { key: 'acciones', label: 'Acciones', render: (_, row) => <Button size="sm" variant={row.activa ? 'danger' : 'secondary'} onClick={() => togG(row.id)}>{row.activa ? 'Desactivar' : 'Activar'}</Button> },
            ]} data={geocercas} emptyMessage="Sin geocercas" />
          </div>
          <Modal isOpen={gModal} onClose={() => setGModal(false)} title="Nueva Geocerca"
            footer={<><Button variant="secondary" onClick={() => setGModal(false)}>Cancelar</Button><Button loading={gSaving} onClick={guardarG}>Guardar</Button></>}>
            <div className="form-group"><label className="form-label">Ruta</label>
              <select className="form-control" value={gForm.ruta_id} onChange={e => setGForm(f => ({ ...f, ruta_id: e.target.value }))}>
                <option value="">Seleccionar ruta</option>
                {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Nombre</label><input className="form-control" value={gForm.nombre} onChange={e => setGForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Radio (metros)</label><input className="form-control" type="number" value={gForm.radio_metros} onChange={e => setGForm(f => ({ ...f, radio_metros: parseInt(e.target.value) }))} /></div>
            <div className="form-group">
              <label className="form-label">Polígono (JSON array de {`{lat, lng}`})</label>
              <textarea className="form-control" rows={5} value={gForm.poligono_json} onChange={e => setGForm(f => ({ ...f, poligono_json: e.target.value }))} placeholder='[{"lat":-19.054,"lng":-65.261},{"lat":-19.054,"lng":-65.262},...]' />
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
