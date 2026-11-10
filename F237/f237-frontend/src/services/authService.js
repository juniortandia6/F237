// f237-frontend/src/services/authService.js

const API_URL = (import.meta.env?.VITE_API_URL ?? "http://localhost:5257").replace(/\/$/, "");
const BASE_URL = `${API_URL}/api`;
const TOKEN_KEY = "f237_token";
const USER_KEY = "f237_user";

// Nom du claim de rôle écrit par .NET (ClaimTypes.Role)
const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

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

// Contenu (payload) du JWT, sans vérifier la signature : sert seulement à
// l'AFFICHAGE (lien Admin, accès aux pages). La vraie protection reste côté API
// avec [Authorize(Roles = "Admin")] : un faux token serait refusé par le serveur.
const lirePayload = (token) => {
  try {
    const partie = token.split(".")[1];
    const base64 = partie.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Rôle de l'utilisateur connecté ("Utilisateur", "Admin") ou null. */
const getRole = () => {
  const token = getToken();
  if (!token) return null;
  const payload = lirePayload(token);
  const role = payload?.[CLAIM_ROLE] ?? payload?.role ?? null;
  return Array.isArray(role) ? (role.includes("Admin") ? "Admin" : role[0]) : role;
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
  getRole,
  estConnecte,
  getAuthHeader,
};