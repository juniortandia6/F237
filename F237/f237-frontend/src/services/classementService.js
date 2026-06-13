import api from './api';

export const classementService = {
    getAll: () => api.get('/classements/saison/3'),
    getBySaison: (saisonId) => api.get(`/classements/saison/${saisonId}`),
    getForme: (equipeId, saisonId) => api.get(`/matchs/equipe/${equipeId}/saison/${saisonId}/forme`),
};