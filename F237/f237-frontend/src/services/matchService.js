import api from './api';

export const matchService = {
    getAll: () => api.get('/matchs'),
    getById: (id) => api.get(`/matchs/${id}`),
};