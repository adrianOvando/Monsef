import React, { useState, useEffect } from 'react';
import { getHorarios, updateHorario } from '../services/horariosService.js';
import { getZonas } from '../services/rutasService.js';
import { useAuth } from '../hooks/useAuth.js';
import Table from '../components/shared/Table.jsx';
import Button from '../components/shared/Button.jsx';
import Modal from '../components/shared/Modal.jsx';
import AlertBanner from '../components/shared/AlertBanner.jsx';

export default function HorariosEstablecidos() {
  const { user } = useAuth();
  const [horarios, setHorarios] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre_tramo: '', zona_id: '', dias_recoleccion: '', horario_manana: '', horario_tarde: '', observaciones: '' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    document.title = 'Horarios Establecidos — MonitoreoRS Sucre';
    cargar();
    getZonas().then(r => setZonas(r.data.data || []));
  }, []);

  const cargar = () => {
    setLoading(true);
    getHorarios()
      .then(r => { setHorarios(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const abrirEditar = (h) => {
    setEditando(h);
    setForm({
      nombre_tramo: h.nombre_tramo,
      zona_id: h.zona_id || '',
      dias_recoleccion: h.dias_recoleccion,
      horario_manana: h.horario_manana || '',
      horario_tarde: h.horario_tarde || '',
      observaciones: h.observaciones || ''
    });
    setModalOpen(true);
  };

  const guardar = async () => {
    if (!form.nombre_tramo || !form.dias_recoleccion) {
      setAlert({ type: 'error', message: 'El tramo y los días de recolección son requeridos' });
      return;
    }
    setSaving(true);
    try {
      await updateHorario(editando.id, form);
      setAlert({ type: 'success', message: 'Horario actualizado correctamente' });
      setModalOpen(false);
      cargar();
    } catch {
      setAlert({ type: 'error', message: 'Error al actualizar el horario' });
    }
    setSaving(false);
  };

  const columns = [
    { key: 'zona_nombre', label: 'Zona', render: (v) => v || 'General' },
    { key: 'nombre_tramo', label: 'Tramo' },
    { key: 'dias_recoleccion', label: 'Días de Recolección' },
    { 
      key: 'horario_propuesto', 
      label: 'Horario Propuesto',
      render: (_, row) => (
        <div style={{ fontSize: 13 }}>
          {row.horario_manana && <div>☀️ Mañana: {row.horario_manana}</div>}
          {row.horario_tarde && <div>🌙 Tarde: {row.horario_tarde}</div>}
          {!row.horario_manana && !row.horario_tarde && <span>—</span>}
        </div>
      )
    },
    { key: 'observaciones', label: 'Observaciones', render: (v) => v || '—' },
  ];

  if (isAdmin) {
    columns.push({
      key: 'acciones',
      label: 'Acciones',
      render: (_, row) => (
        <Button size="sm" variant="secondary" onClick={() => abrirEditar(row)}>Editar</Button>
      )
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Horarios Establecidos</h1>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} autoDismiss onClose={() => setAlert(null)} />}

      {/* Panel informativo superior */}
      <div style={{
        backgroundColor: 'var(--color-gray-50)',
        borderLeft: '3px solid var(--color-primary)',
        padding: '12px 16px',
        borderRadius: '4px',
        fontSize: '13px',
        color: 'var(--color-gray-600)',
        lineHeight: '1.6',
        marginBottom: '20px'
      }}>
        Los horarios actuales del camión recolector no cuentan con un horario fijo. Durante el trabajo de campo (12–15 de mayo de 2026) se observaron los siguientes horarios variables: Martes aprox. 15:00 h, Jueves aprox. 07:00 h, Viernes aprox. 06:00 h, sin previo aviso a los vecinos. Los horarios que se muestran a continuación son la propuesta reorganizada del proyecto.
      </div>

      <div className="card">
        <Table columns={columns} data={horarios} loading={loading} emptyMessage="No hay horarios establecidos registrados" />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Editar Horario de Recorrido"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button loading={saving} onClick={guardar}>Guardar</Button></>}>
        
        <div className="form-group">
          <label className="form-label">Nombre del Tramo *</label>
          <input className="form-control" value={form.nombre_tramo} onChange={e => setForm(f => ({ ...f, nombre_tramo: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Zona</label>
          <select className="form-control" value={form.zona_id} onChange={e => setForm(f => ({ ...f, zona_id: e.target.value }))}>
            <option value="">Seleccionar zona...</option>
            {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Días de Recolección *</label>
          <input className="form-control" value={form.dias_recoleccion} onChange={e => setForm(f => ({ ...f, dias_recoleccion: e.target.value }))} placeholder="Ej: Lunes, Viernes" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Horario Mañana</label>
            <input className="form-control" value={form.horario_manana} onChange={e => setForm(f => ({ ...f, horario_manana: e.target.value }))} placeholder="Ej: 07:30 - 10:00" />
          </div>
          <div className="form-group">
            <label className="form-label">Horario Tarde</label>
            <input className="form-control" value={form.horario_tarde} onChange={e => setForm(f => ({ ...f, horario_tarde: e.target.value }))} placeholder="Ej: 16:00 - 18:00" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Observaciones</label>
          <textarea className="form-control" rows={3} value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} />
        </div>

      </Modal>
    </div>
  );
}
