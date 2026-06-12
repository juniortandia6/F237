import api from './api';

export const matchService = {
    getAll: () => api.get('/matchs/saison/1'),
    getBySaison: (saisonId) => api.get(`/matchs/saison/${saisonId}`),
    getById: (id) => api.get(`/matchs/${id}`),
};