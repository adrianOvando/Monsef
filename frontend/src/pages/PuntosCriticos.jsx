import React, { useState, useEffect } from 'react';
import { getPuntos, createPunto, updatePunto, deletePunto } from '../services/puntosService.js';
import { getZonas } from '../services/rutasService.js';
import { descargarPDF } from '../services/reportesService.js';
import { useAuth } from '../hooks/useAuth.js';
import Table from '../components/shared/Table.jsx';
import Badge from '../components/shared/Badge.jsx';
import Button from '../components/shared/Button.jsx';
import Modal from '../components/shared/Modal.jsx';
import AlertBanner from '../components/shared/AlertBanner.jsx';

const TIPOS = ['acumulacion', 'contenedor_desbordado', 'calle_sin_cobertura', 'otro'];
const NIVELES = ['bajo', 'medio', 'alto'];
const TIPO_LABEL = { acumulacion: 'Acumulación', contenedor_desbordado: 'Contenedor desbordado', calle_sin_cobertura: 'Sin cobertura', otro: 'Otro' };

const EMPTY_FORM = { nombre: '', zona_id: '', lat: '', lng: '', tipo: 'acumulacion', nivel_criticidad: 'medio', descripcion: '', fecha_registro: '', foto_url: '' };

export default function PuntosCriticos() {
  const { user } = useAuth();
  const [puntos, setPuntos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ zona_id: '', tipo: '', nivel_criticidad: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [puntoDetalle, setPuntoDetalle] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const canEdit = user?.rol === 'admin' || user?.rol === 'supervisor';

  useEffect(() => {
    document.title = 'Puntos Críticos — MonitoreoRS Sucre';
    cargar();
    getZonas().then(r => setZonas(r.data.data || []));
  }, []);

  const cargar = () => {
    setLoading(true);
    getPuntos(filtros).then(r => { setPuntos(r.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [filtros]);

  const abrirNuevo = () => { setEditando(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const abrirEditar = (p) => { setEditando(p); setForm({ nombre: p.nombre, zona_id: p.zona_id, lat: p.lat, lng: p.lng, tipo: p.tipo, nivel_criticidad: p.nivel_criticidad, descripcion: p.descripcion || '', fecha_registro: p.fecha_registro || '', foto_url: p.foto_url || '' }); setModalOpen(true); };
  const abrirDetalle = (p) => { setPuntoDetalle(p); setDetailOpen(true); };

  const guardar = async () => {
    if (!form.nombre || !form.zona_id || !form.lat || !form.lng) { setAlert({ type: 'error', message: 'Nombre, zona, latitud y longitud son requeridos' }); return; }
    setSaving(true);
    try {
      if (editando) { await updatePunto(editando.id, form); setAlert({ type: 'success', message: 'Punto actualizado correctamente' }); }
      else { await createPunto(form); setAlert({ type: 'success', message: 'Punto creado correctamente' }); }
      setModalOpen(false);
      cargar();
    } catch { setAlert({ type: 'error', message: 'Error al guardar el punto' }); }
    setSaving(false);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este punto crítico?')) return;
    await deletePunto(id).then(() => { setAlert({ type: 'success', message: 'Punto eliminado' }); cargar(); }).catch(() => setAlert({ type: 'error', message: 'Error al eliminar' }));
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'zona_nombre', label: 'Zona' },
    { key: 'tipo', label: 'Tipo', render: (v) => TIPO_LABEL[v] || v },
    { key: 'nivel_criticidad', label: 'Nivel', render: (v) => <Badge value={v} type="nivel" /> },
    { key: 'fecha_registro', label: 'Fecha Registro', render: (v) => v ? new Date(v).toLocaleDateString('es-BO') : '—' },
    {
      key: 'acciones', label: 'Acciones', render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="ghost" onClick={() => abrirDetalle(row)}>Ver</Button>
          {canEdit && <Button size="sm" variant="secondary" onClick={() => abrirEditar(row)}>Editar</Button>}
          {user?.rol === 'admin' && <Button size="sm" variant="danger" onClick={() => eliminar(row.id)}>Eliminar</Button>}
        </div>
      )
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Puntos Críticos</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="sm" loading={pdfLoading} onClick={async () => { setPdfLoading(true); await descargarPDF('2', '2026-01-01', new Date().toISOString().split('T')[0]); setPdfLoading(false); }}>Exportar PDF</Button>
          {canEdit && <Button onClick={abrirNuevo}>+ Nuevo Punto</Button>}
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} autoDismiss onClose={() => setAlert(null)} />}

      {/* Filtros */}
      <div className="filters-bar">
        <select className="form-control" style={{ width: 180 }} value={filtros.zona_id} onChange={e => setFiltros(f => ({ ...f, zona_id: e.target.value }))}>
          <option value="">Todas las zonas</option>
          {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
        </select>
        <select className="form-control" style={{ width: 180 }} value={filtros.tipo} onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
        </select>
        <select className="form-control" style={{ width: 180 }} value={filtros.nivel_criticidad} onChange={e => setFiltros(f => ({ ...f, nivel_criticidad: e.target.value }))}>
          <option value="">Todos los niveles</option>
          {NIVELES.map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
        </select>
      </div>

      <div className="card">
        <Table columns={columns} data={puntos} loading={loading} emptyMessage="No hay puntos críticos registrados" />
      </div>

      {/* New/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar Punto Crítico' : 'Nuevo Punto Crítico'}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button loading={saving} onClick={guardar}>Guardar</Button></>}>
        {alert && <AlertBanner type={alert.type} message={alert.message} />}
        <div className="form-group"><label className="form-label">Nombre *</label><input className="form-control" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Zona *</label>
          <select className="form-control" value={form.zona_id} onChange={e => setForm(f => ({ ...f, zona_id: e.target.value }))}>
            <option value="">Seleccionar zona</option>
            {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Latitud *</label><input className="form-control" type="number" step="0.000001" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Longitud *</label><input className="form-control" type="number" step="0.000001" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Tipo</label>
            <select className="form-control" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABEL[t]}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Nivel</label>
            <select className="form-control" value={form.nivel_criticidad} onChange={e => setForm(f => ({ ...f, nivel_criticidad: e.target.value }))}>
              {NIVELES.map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Fecha Registro</label><input className="form-control" type="date" value={form.fecha_registro} onChange={e => setForm(f => ({ ...f, fecha_registro: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">URL de la Fotografía</label><input className="form-control" value={form.foto_url} onChange={e => setForm(f => ({ ...f, foto_url: e.target.value }))} placeholder="Ej: anexo_b_foto1.jpg" /></div>
        <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-control" rows={3} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} /></div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle del Punto Crítico"
        footer={<Button onClick={() => setDetailOpen(false)}>Cerrar</Button>}>
        {puntoDetalle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><b>Nombre:</b> {puntoDetalle.nombre}</div>
            <div><b>Zona:</b> {puntoDetalle.zona_nombre}</div>
            <div><b>Tipo:</b> {TIPO_LABEL[puntoDetalle.tipo] || puntoDetalle.tipo}</div>
            <div><b>Nivel:</b> <Badge value={puntoDetalle.nivel_criticidad} type="nivel" /></div>
            <div><b>Coordenadas:</b> {puntoDetalle.lat}, {puntoDetalle.lng}</div>
            <div><b>Fecha:</b> {puntoDetalle.fecha_registro ? new Date(puntoDetalle.fecha_registro).toLocaleDateString('es-BO') : '—'}</div>
            {puntoDetalle.descripcion && <div><b>Descripción:</b> {puntoDetalle.descripcion}</div>}
            <div style={{ marginTop: 8 }}>
              <b>Fotografía de Referencia:</b>
              {puntoDetalle.foto_url ? (
                <div style={{ marginTop: 6 }}>
                  <img 
                    src={puntoDetalle.foto_url.startsWith('http') || puntoDetalle.foto_url.startsWith('/') ? puntoDetalle.foto_url : `/${puntoDetalle.foto_url}`} 
                    alt="Punto Crítico" 
                    style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '6px', objectFit: 'cover', display: 'block', border: '1px solid var(--color-gray-100)' }} 
                  />
                </div>
              ) : (
                <div style={{ marginTop: 6, padding: '16px', background: 'var(--color-gray-50)', borderRadius: '6px', color: 'var(--color-gray-400)', textAlign: 'center', fontSize: '13px', border: '1px dashed var(--color-gray-100)' }}>
                  Sin fotografía registrada
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
