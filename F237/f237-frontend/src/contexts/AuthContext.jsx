/* eslint-disable react-refresh/only-export-components */
// f237-frontend/src/contexts/AuthContext.jsx

import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    authService.estConnecte() ? authService.getUser() : null
  );

  const login = async (email, motDePasse) => {
    const data = await authService.login(email, motDePasse);
    setUser({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      soldePoints: data.soldePoints,
    });
    return data;
  };

  const register = async (nom, prenom, email, motDePasse) => {
    const data = await authService.register(nom, prenom, email, motDePasse);
    setUser({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      soldePoints: data.soldePoints,
    });
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateSolde = (nouveauSolde) => {
    setUser(prev => prev ? { ...prev, soldePoints: nouveauSolde } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateSolde }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return context;
}