import api from './api.js';
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');
export const getUsuarios = () => api.get('/usuarios');
export const getRoles = () => api.get('/roles');
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const toggleUsuario = (id) => api.put(`/usuarios/${id}/toggle`);
