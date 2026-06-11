import api from './api.js';
export const getPuntos = (params) => api.get('/puntos-criticos', { params });
export const getPunto = (id) => api.get(`/puntos-criticos/${id}`);
export const createPunto = (data) => api.post('/puntos-criticos', data);
export const updatePunto = (id, data) => api.put(`/puntos-criticos/${id}`, data);
export const deletePunto = (id) => api.delete(`/puntos-criticos/${id}`);
export const getGeocercas = (params) => api.get('/geocercas', { params });
export const createGeocerca = (data) => api.post('/geocercas', data);
export const toggleGeocerca = (id) => api.put(`/geocercas/${id}/toggle`);
