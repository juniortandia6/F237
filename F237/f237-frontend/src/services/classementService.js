import api from './api';

export const classementService = {
    getAll: () => api.get('/classements'),
    getBySaison: (saisonId) => api.get(`/classements?saisonId=${saisonId}`),
};