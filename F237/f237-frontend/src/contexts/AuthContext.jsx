/* eslint-disable react-refresh/only-export-components */
// f237-frontend/src/contexts/AuthContext.jsx

import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

// Utilisateur de la session + son rôle (lu dans le token JWT)
const depuisSession = (data) => ({
  nom: data.nom,
  prenom: data.prenom,
  email: data.email,
  soldePoints: data.soldePoints,
  role: authService.getRole(),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    authService.estConnecte() ? depuisSession(authService.getUser()) : null
  );

  const login = async (email, motDePasse) => {
    const data = await authService.login(email, motDePasse);
    setUser(depuisSession(data));
    return data;
  };

  const register = async (nom, prenom, email, motDePasse) => {
    const data = await authService.register(nom, prenom, email, motDePasse);
    setUser(depuisSession(data));
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateSolde = (nouveauSolde) => {
    setUser(prev => prev ? { ...prev, soldePoints: nouveauSolde } : prev);
  };

  // Sert seulement à l'affichage : l'API vérifie elle-même le rôle à chaque requête
  const estAdmin = user?.role === "Admin";

  return (
    <AuthContext.Provider value={{ user, estAdmin, login, register, logout, updateSolde }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return context;
}