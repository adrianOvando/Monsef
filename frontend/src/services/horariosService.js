import api from './api.js';

export const getHorarios = () => api.get('/horarios');
export const updateHorario = (id, data) => api.put(`/horarios/${id}`, data);
