import api from './api';

export const classementService = {
    getAll: () => api.get('/classements/saison/1'),
    getBySaison: (saisonId) => api.get(`/classements/saison/${saisonId}`),
};