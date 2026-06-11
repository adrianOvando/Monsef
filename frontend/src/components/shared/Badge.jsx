import React from 'react';

const NIVEL_MAP = { alto: 'badge-danger', medio: 'badge-warning', bajo: 'badge-info' };
const ESTADO_MAP = { completado: 'badge-success', en_progreso: 'badge-info', incompleto: 'badge-warning', desviacion_detectada: 'badge-danger' };
const NIVEL_TEXT = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };
const ESTADO_TEXT = { completado: 'Completado', en_progreso: 'En Progreso', incompleto: 'Incompleto', desviacion_detectada: 'Desviación' };

export default function Badge({ value, type = 'auto' }) {
  let cls = 'badge';
  let text = value;

  if (type === 'nivel' || NIVEL_MAP[value]) {
    cls += ' ' + (NIVEL_MAP[value] || 'badge-info');
    text = NIVEL_TEXT[value] || value;
  } else if (type === 'estado' || ESTADO_MAP[value]) {
    cls += ' ' + (ESTADO_MAP[value] || 'badge');
    text = ESTADO_TEXT[value] || value;
  } else {
    cls += ' badge-info';
  }

  return <span className={cls}>{text}</span>;
}
