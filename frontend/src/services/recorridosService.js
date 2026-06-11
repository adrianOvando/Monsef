import api from './api.js';
export const getRecorridos = (params) => api.get('/recorridos', { params });
export const getRecorrido = (id) => api.get(`/recorridos/${id}`);
export const createRecorrido = (data) => api.post('/recorridos', data);
export const getVerificacion = (id) => api.get(`/recorridos/${id}/verificacion`);
