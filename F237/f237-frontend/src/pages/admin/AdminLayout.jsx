// f237-frontend/src/pages/admin/AdminLayout.jsx
// Mise en page de l'espace admin : bandeau vert + menu latéral + page choisie.
// Les sections pas encore construites sont affichées "Bientôt" (non cliquables).

import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Newspaper, CalendarDays, Shield, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../theme';
import { CLAIR } from './styleAdmin';

const CONTENEUR = { maxWidth: '1150px', margin: '0 auto', padding: '0 60px', boxSizing: 'content-box' };

const SECTIONS = [
  { to: '/admin', label: 'Tableau de bord', Icone: LayoutDashboard, fin: true },
  { to: '/admin/articles', label: 'Articles', Icone: Newspaper },
  { to: '/admin/matchs', label: 'Matchs et buteurs', Icone: CalendarDays },
  { to: '/admin/equipes', label: 'Équipes', Icone: Shield, bientot: true },
  { to: '/admin/effectifs', label: 'Effectifs', Icone: Users, bientot: true },
];

function LienSection({ section }) {
  const { to, label, Icone, fin, bientot } = section;
  const base = {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 700, textDecoration: 'none',
  };
  if (bientot) {
    return (
      <span style={{ ...base, color: '#a3aaa6', cursor: 'default' }} aria-disabled="true">
        <Icone size={18} />
        <span style={{ flex: 1 }}>{label}</span>
        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', backgroundColor: CLAIR.tuile, color: CLAIR.doux, padding: '3px 7px', borderRadius: '999px' }}>
          Bientôt
        </span>
      </span>
    );
  }
  return (
    <NavLink to={to} end={fin}
      style={({ isActive }) => ({
        ...base,
        color: isActive ? '#fff' : CLAIR.texte,
        backgroundColor: isActive ? CLAIR.vert : 'transparent',
      })}>
      <Icone size={18} />
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div>
      {/* Bandeau */}
      <section style={{ background: `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`, padding: '40px 0 44px' }}>
        <div style={CONTENEUR}>
          <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: theme.yellow, border: `1px solid ${theme.yellow}55`, padding: '5px 12px', borderRadius: '999px' }}>
            Espace admin
          </span>
          <h1 style={{ color: '#fff', fontSize: '44px', fontWeight: 400, margin: '12px 0 6px', fontFamily: 'var(--font-titres)' }}>
            Gestion de F237
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
            Bonjour {user?.prenom}. Imports, contenus et corrections du site, au même endroit.
          </p>
        </div>
      </section>

      {/* Menu + page */}
      <section style={{ backgroundColor: CLAIR.fond, minHeight: '520px', padding: '32px 0 64px' }}>
        <div style={{ ...CONTENEUR, display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)', gap: '28px', alignItems: 'start' }}>
          <nav style={{ backgroundColor: CLAIR.carte, border: `1px solid ${CLAIR.bord}`, borderRadius: '14px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '90px' }}>
            {SECTIONS.map(s => <LienSection key={s.to} section={s} />)}
          </nav>
          <div style={{ minWidth: 0 }}>
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  );
}