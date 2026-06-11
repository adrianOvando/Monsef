import api from './api.js';
export const getResumen = () => api.get('/reportes/resumen');
export const getUltimosRecorridos = () => api.get('/reportes/ultimos');
export const getNotificaciones = (params) => api.get('/notificaciones', { params });
export const marcarLeida = (id) => api.put(`/notificaciones/${id}/leer`);
export const marcarTodasLeidas = () => api.put('/notificaciones/leer-todas');
export const descargarPDF = async (tipo, desde, hasta) => {
  const response = await api.get('/reportes/pdf', {
    params: { tipo, desde, hasta },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `reporte-tipo${tipo}-${desde}-${hasta}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
