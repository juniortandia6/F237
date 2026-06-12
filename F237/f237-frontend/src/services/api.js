const API_BASE_URL = 'http://localhost:5257/api';

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`Erreur: ${response.status}`);
        return response.json();
    }
};

export default api;