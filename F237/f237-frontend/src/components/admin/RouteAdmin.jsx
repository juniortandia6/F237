// f237-frontend/src/components/admin/RouteAdmin.jsx
// Garde des pages /admin : non connecté -> page de connexion ; connecté sans le
// rôle Admin -> message "accès réservé". (L'API vérifie aussi le rôle : même en
// contournant cette garde, aucune donnée admin n'est renvoyée sans le bon token.)

import { Link, Navigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RouteAdmin({ children }) {
  const { user, estAdmin } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (!estAdmin) {
    return (
      <section style={{ backgroundColor: '#eef1ef', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <span style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fde8e8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <Lock size={26} color="#c62828" />
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#141414', marginBottom: '8px' }}>Accès réservé</h1>
          <p style={{ color: '#6b7470', fontSize: '15px', lineHeight: 1.5, marginBottom: '18px' }}>
            Cette page est réservée aux administrateurs de F237.
          </p>
          <Link to="/" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '999px', backgroundColor: '#14532f', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            Retour à l'accueil
          </Link>
        </div>
      </section>
    );
  }

  return children;
}