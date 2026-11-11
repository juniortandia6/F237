import api from './api';

export const equipeService = {
    getAll: () => api.get('/equipes'),
    getById: (id) => api.get(`/equipes/${id}`),
    // Effectif saisi dans l'admin (joueurs actifs) ; [] si rien n'a été saisi
    getEffectif: (id) => api.get(`/clubs/${id}/effectif`),
};