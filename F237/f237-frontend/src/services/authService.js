// f237-frontend/src/services/authService.js

const BASE_URL = "http://localhost:5257/api";
const TOKEN_KEY = "f237_token";
const USER_KEY = "f237_user";

// ── Helpers stockage ──────────────────────────────────────────────────────────

const sauvegarderSession = (data) => {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    soldePoints: data.soldePoints,
    expiration: data.expiration,
  }));
};

const supprimerSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

const estConnecte = () => {
  const token = getToken();
  const user = getUser();
  if (!token || !user) return false;

  // Vérifier expiration
  const expiration = new Date(user.expiration);
  if (expiration < new Date()) {
    supprimerSession();
    return false;
  }
  return true;
};

// ── Requêtes API ──────────────────────────────────────────────────────────────

const register = async (nom, prenom, email, motDePasse) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom, prenom, email, motDePasse }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur lors de l'inscription");

  sauvegarderSession(data);
  return data;
};

const login = async (email, motDePasse) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, motDePasse }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Email ou mot de passe incorrect");

  sauvegarderSession(data);
  return data;
};

const logout = () => {
  supprimerSession();
};

const getProfil = async () => {
  const token = getToken();
  if (!token) throw new Error("Non connecté");

  const response = await fetch(`${BASE_URL}/auth/profil`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Erreur lors de la récupération du profil");
  return response.json();
};

// Header Authorization pour les autres services
const getAuthHeader = () => {
  const token = getToken();
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const authService = {
  register,
  login,
  logout,
  getProfil,
  getToken,
  getUser,
  estConnecte,
  getAuthHeader,
};