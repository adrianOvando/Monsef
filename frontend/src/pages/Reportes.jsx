import React, { useState, useEffect } from 'react';
import { getResumen, getUltimosRecorridos, descargarPDF } from '../services/reportesService.js';
import { getRutas } from '../services/rutasService.js';
import Button from '../components/shared/Button.jsx';
import AlertBanner from '../components/shared/AlertBanner.jsx';
import Badge from '../components/shared/Badge.jsx';

const TIPOS = [
  { 
    id: '1', 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
        <line x1="9" y1="3" x2="9" y2="18"></line>
        <line x1="15" y1="6" x2="15" y2="21"></line>
      </svg>
    ), 
    label: 'Rutas registradas y cobertura', 
    desc: 'Rutas, recorridos y cumplimiento promedio por zona.' 
  },
  { 
    id: '2', 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ), 
    label: 'Puntos críticos identificados', 
    desc: 'Listado completo de puntos críticos registrados.' 
  },
  { 
    id: '3', 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
    ), 
    label: 'Cumplimiento de recorridos programados', 
    desc: 'Recorridos en el período con detalle de cumplimiento.' 
  },
  { 
    id: '4', 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    ), 
    label: 'Notificaciones y desviaciones', 
    desc: 'Desviaciones de ruta detectadas en el período.' 
  },
];

export default function Reportes() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('1');
  const [desde, setDesde] = useState('2026-01-01');
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [rutas, setRutas] = useState([]);

  useEffect(() => {
    document.title = 'Reportes — MonitoreoRS Sucre';
    getRutas().then(r => setRutas(r.data.data || []));
    cargarPreview();
  }, []);

  useEffect(() => { cargarPreview(); }, [tipoSeleccionado, desde, hasta]);

  const cargarPreview = async () => {
    setLoading(true);
    try {
      if (tipoSeleccionado === '1' || tipoSeleccionado === '4') {
        const r = await getResumen();
        setPreview(r.data.data);
      } else if (tipoSeleccionado === '3') {
        const r = await getUltimosRecorridos();
        setPreview(r.data.data);
      } else {
        setPreview(null);
      }
    } catch { setPreview(null); }
    setLoading(false);
  };

  const generarPDF = async () => {
    setPdfLoading(true);
    try {
      await descargarPDF(tipoSeleccionado, desde, hasta);
      setAlert({ type: 'success', message: 'PDF generado y descargado exitosamente' });
    } catch { setAlert({ type: 'error', message: 'Error al generar el PDF. Verifique que el backend esté en ejecución.' }); }
    setPdfLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Reportes</h1>
        <Button onClick={generarPDF} loading={pdfLoading} icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        }>Generar PDF</Button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} autoDismiss onClose={() => setAlert(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>
        {/* Panel izquierdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Tipo de Reporte</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TIPOS.map(t => (
                <label key={t.id} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 6, border: `2px solid ${tipoSeleccionado === t.id ? 'var(--color-primary)' : 'var(--color-gray-100)'}`, cursor: 'pointer', background: tipoSeleccionado === t.id ? '#f1f8e9' : 'white', transition: '0.2s' }}>
                  <input type="radio" name="tipo" value={t.id} checked={tipoSeleccionado === t.id} onChange={() => setTipoSeleccionado(t.id)} style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.icon} {t.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>{t.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Período</h3></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Desde</label><input className="form-control" type="date" value={desde} onChange={e => setDesde(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Hasta</label><input className="form-control" type="date" value={hasta} onChange={e => setHasta(e.target.value)} /></div>
            </div>
          </div>

          <Button onClick={generarPDF} loading={pdfLoading} style={{ width: '100%', padding: '12px', fontSize: 15 }} icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          }>
            Descargar PDF
          </Button>
        </div>

        {/* Preview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Vista Previa — {TIPOS.find(t => t.id === tipoSeleccionado)?.label}</h3>
            <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>{desde} al {hasta}</span>
          </div>
          <div className="card-body">
            {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-gray-400)' }}>Cargando vista previa…</div> : (
              tipoSeleccionado === '1' && preview ? (
                <div>
                  <p style={{ marginBottom: 16, color: 'var(--color-gray-600)' }}>Resumen general del sistema al período seleccionado:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                      { label: 'Zonas Monitoreadas', value: preview.totalZonas },
                      { label: 'Rutas Activas', value: preview.totalRutas },
                      { label: 'Puntos Críticos', value: preview.totalPuntos },
                      { label: 'Puntos Nivel Alto', value: preview.totalAlto },
                      { label: 'Recorridos del Mes', value: preview.totalMes },
                    ].map(item => (
                      <div key={item.label} style={{ padding: 16, background: 'var(--color-gray-50)', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)' }}>{item.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : tipoSeleccionado === '3' && preview ? (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Ruta</th><th>Fecha</th><th>Estado</th><th>Cumplimiento</th></tr></thead>
                    <tbody>
                      {preview.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>Sin datos</td></tr> :
                        preview.map(r => (
                          <tr key={r.id}>
                            <td>{r.ruta_nombre || r.ruta}</td>
                            <td>{r.fecha ? new Date(r.fecha).toLocaleDateString('es-BO') : '—'}</td>
                            <td><Badge value={r.estado} type="estado" /></td>
                            <td>{r.porcentaje_cumplimiento}%</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-gray-400)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  </div>
                  <div>Haga clic en "Descargar PDF" para generar el reporte completo</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>Los datos se obtienen directamente de la base de datos</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
