// Regroupement des buts par buteur, partagé par l'accueil et la page Classement.
// - but relié à l'effectif (joueurId) : regroupé par joueur, même si le nom est écrit
//   de deux façons ("S. Tagbor" / "Samuel Tagbor") ;
// - but pas encore relié : regroupé par nom + équipe, comme avant.
// Les CSC et les buteurs inconnus ne comptent pas.

// Valeur la plus fréquente (égalité : ordre alphabétique, pour un résultat stable d'une page à l'autre)
const plusFrequent = (compteur) =>
  [...compteur.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];

const compter = (compteur, valeur) => compteur.set(valeur, (compteur.get(valeur) ?? 0) + 1);

/** -> [{ cle, joueurId, nom, equipe, buts, penaltys, matchs }] (non trié) */
export function regrouperButeurs(matchs = []) {
  const groupes = new Map();
  for (const m of matchs) {
    for (const b of m.buts ?? []) {
      if (b.estButCSC) continue;
      const nom = (b.nomJoueur ?? '').trim();
      if (!nom || nom === 'Inconnu') continue;
      const cle = b.joueurId ? `j${b.joueurId}` : `${nom}|${b.nomEquipe}`;
      let g = groupes.get(cle);
      if (!g) {
        g = { joueurId: b.joueurId ?? null, noms: new Map(), equipes: new Map(), buts: 0, penaltys: 0, matchs: new Set() };
        groupes.set(cle, g);
      }
      compter(g.noms, nom);
      compter(g.equipes, b.nomEquipe);
      g.buts += 1;
      if (b.estPenalty) g.penaltys += 1;
      g.matchs.add(m.id);
    }
  }
  return [...groupes.entries()].map(([cle, g]) => ({
    cle,
    joueurId: g.joueurId,
    nom: plusFrequent(g.noms),
    equipe: plusFrequent(g.equipes),
    buts: g.buts,
    penaltys: g.penaltys,
    matchs: g.matchs.size,
  }));
}

/** Plus de buts > moins de penaltys > ordre alphabétique */
export const classerButeurs = (joueurs) =>
  [...joueurs].sort((a, b) => b.buts - a.buts || a.penaltys - b.penaltys || a.nom.localeCompare(b.nom));