import api from './api';

export const equipeService = {
    getAll: () => api.get('/equipes'),
    getById: (id) => api.get(`/equipes/${id}`),
};