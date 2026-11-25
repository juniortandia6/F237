// f237-frontend/src/pages/admin/visuelEquipeType.js
// Dessin du visuel « Équipe type de la journée » sur un <canvas> (1200 × 675, format réseaux sociaux).
// Tout est dessiné à la main (Canvas 2D) : pas de bibliothèque, et le PNG exporté est
// identique à l'aperçu. Aucune photo de joueur : noms, clubs et maillots aux couleurs des clubs.

export const LARGEUR = 1200;
export const HAUTEUR = 675;

// Systèmes de jeu : nombre de joueurs par ligne, du gardien vers l'attaque
export const FORMATIONS = {
  '4-3-3': [1, 4, 3, 3],
  '4-4-2': [1, 4, 4, 2],
  '4-2-3-1': [1, 4, 2, 3, 1],
  '4-1-4-1': [1, 4, 1, 4, 1],
  '4-5-1': [1, 4, 5, 1],
  '3-5-2': [1, 3, 5, 2],
  '3-4-3': [1, 3, 4, 3],
  '5-3-2': [1, 5, 3, 2],
  '5-4-1': [1, 5, 4, 1],
};

/** Libellé de chaque ligne d'une formation : Gardien, Défense, Milieu(x), Attaque. */
export function libellesLignes(lignes) {
  const n = lignes.length;
  return lignes.map((_, i) => {
    if (i === 0) return 'Gardien';
    if (i === 1) return 'Défense';
    if (i === n - 1) return 'Attaque';
    return n > 4 ? (i === 2 ? 'Milieu défensif' : 'Milieu offensif') : 'Milieu';
  });
}

const POLICE_TEXTE = '"Outfit", "Segoe UI", Arial, sans-serif';
const POLICE_CHIFFRES = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';
const VERT = '#1f8a3c', ROUGE = '#d62828', JAUNE = '#f2c230';

/** Attend que les polices du site soient prêtes (sinon le canvas dessine avec Arial). */
export async function chargerPolices() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`900 84px ${POLICE_CHIFFRES}`),
      document.fonts.load(`800 15px ${POLICE_TEXTE}`),
      document.fonts.load(`600 13px ${POLICE_TEXTE}`),
    ]);
  } catch { /* police indisponible : on dessine avec la police de secours */ }
}

function rectArrondi(ctx, x, y, l, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + l, y, x + l, y + h, r);
  ctx.arcTo(x + l, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + l, y, r);
  ctx.closePath();
}

/** Coupe un texte trop long et ajoute « … ». */
function tronquer(ctx, texte, largeurMax) {
  if (ctx.measureText(texte).width <= largeurMax) return texte;
  let t = texte;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > largeurMax) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** Découpe un texte en lignes de largeur maximale. */
function couperLignes(ctx, texte, largeurMax) {
  const mots = texte.split(/\s+/).filter(Boolean);
  const lignes = [];
  let courante = '';
  for (const mot of mots) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeurMax && courante) { lignes.push(courante); courante = mot; }
    else courante = essai;
  }
  if (courante) lignes.push(courante);
  return lignes;
}

// Maillot (même dessin que l'ancien générateur HTML), dans un carré de 100 × 100
const CORPS = new Path2D('M30 10 L42 6 Q50 14 58 6 L70 10 L94 26 L84 46 L74 40 L74 94 L26 94 L26 40 L16 46 L6 26 Z');
const MANCHES = new Path2D('M6 26 L30 10 L26 40 L16 46 Z M94 26 L70 10 L74 40 L84 46 Z');
const COL = new Path2D('M42 6 Q50 14 58 6');

function dessinerMaillot(ctx, cx, haut, taille, principale, secondaire) {
  const k = taille / 100;
  ctx.save();
  ctx.translate(cx - taille / 2, haut);
  ctx.scale(k, k);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10 / k; ctx.shadowOffsetY = 6 / k;
  ctx.fillStyle = principale; ctx.fill(CORPS);
  ctx.shadowColor = 'transparent';
  ctx.lineJoin = 'round'; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke(CORPS);
  ctx.globalAlpha = 0.95; ctx.fillStyle = secondaire; ctx.fill(MANCHES);
  ctx.globalAlpha = 1; ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = secondaire; ctx.stroke(COL);
  ctx.restore();
}

function avecEspacement(ctx, valeur) {
  // letterSpacing existe dans Chrome / Edge récents ; ailleurs, simplement ignoré
  if ('letterSpacing' in ctx) ctx.letterSpacing = valeur;
}

/**
 * Dessine le visuel complet.
 * donnees = { competition, journee, source, formation, joueurs: [{ nom, club, principale, secondaire }] (11) }
 * echelle = 2 pour un PNG net (2400 × 1350).
 */
export function dessinerEquipeType(canvas, donnees, echelle = 1) {
  canvas.width = LARGEUR * echelle;
  canvas.height = HAUTEUR * echelle;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(echelle, 0, 0, echelle, 0, 0);
  ctx.textBaseline = 'alphabetic';

  // ── Fond ──
  const fond = ctx.createLinearGradient(0, 0, LARGEUR, HAUTEUR);
  fond.addColorStop(0, '#0e2a1b'); fond.addColorStop(0.55, '#0b1f15'); fond.addColorStop(1, '#08150f');
  ctx.fillStyle = fond; ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  const halo = ctx.createRadialGradient(LARGEUR * 0.85, HAUTEUR * 0.1, 0, LARGEUR * 0.85, HAUTEUR * 0.1, 700);
  halo.addColorStop(0, 'rgba(242,194,48,0.10)'); halo.addColorStop(1, 'rgba(242,194,48,0)');
  ctx.fillStyle = halo; ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  // Bandes diagonales discrètes
  ctx.save();
  ctx.translate(LARGEUR / 2, HAUTEUR / 2); ctx.rotate(Math.PI / 4);
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let x = -1400; x < 1400; x += 160) ctx.fillRect(x, -1400, 70, 2800);
  ctx.restore();

  // ── Colonne titre ──
  const gauche = 44;
  ctx.font = `900 46px ${POLICE_CHIFFRES}`;
  avecEspacement(ctx, '1px');
  let x = gauche;
  [['F', '#ffffff'], ['2', VERT], ['3', ROUGE], ['7', JAUNE]].forEach(([c, couleur]) => {
    ctx.fillStyle = couleur; ctx.fillText(c, x, 44 + 40); x += ctx.measureText(c).width;
  });

  ctx.font = `700 15px ${POLICE_TEXTE}`;
  avecEspacement(ctx, '3px');
  ctx.fillStyle = JAUNE;
  ctx.fillText((donnees.competition || 'MTN Elite One').toUpperCase(), gauche, 152);

  ctx.font = `900 84px ${POLICE_CHIFFRES}`;
  avecEspacement(ctx, '0px');
  ctx.fillStyle = '#ffffff';
  // maxWidth : le titre ne déborde jamais sur le terrain (même si la police n'est pas chargée)
  ctx.fillText('ÉQUIPE', gauche, 236, 300);
  ctx.fillText('TYPE', gauche, 312, 300);

  // Pastille journée
  const journee = (donnees.journee || 'Journée ?').trim();
  ctx.font = `800 20px ${POLICE_TEXTE}`;
  const lJournee = Math.min(ctx.measureText(journee).width, 268) + 32;
  ctx.fillStyle = JAUNE;
  rectArrondi(ctx, gauche, 336, lJournee, 40, 20); ctx.fill();
  ctx.fillStyle = '#0b1f15';
  ctx.fillText(tronquer(ctx, journee, 268), gauche + 16, 363);

  ctx.font = `600 16px ${POLICE_TEXTE}`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(`Système ${donnees.formation}`, gauche, 408);

  // Légende (source) en bas à gauche
  ctx.font = `600 13px ${POLICE_TEXTE}`;
  const lignesSource = couperLignes(ctx, `${(donnees.source || '').trim().replace(/\.$/, '')}.`, 300).slice(0, 3);
  const lignesLegende = [...(donnees.source?.trim() ? lignesSource : []), 'Visuel F237'];
  lignesLegende.forEach((l, i) => {
    const derniere = i === lignesLegende.length - 1;
    ctx.fillStyle = derniere ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.8)';
    ctx.font = `${derniere ? 400 : 600} 13px ${POLICE_TEXTE}`;
    ctx.fillText(l, gauche, HAUTEUR - 40 - (lignesLegende.length - 1 - i) * 19);
  });

  // ── Terrain (horizontal : gardien à gauche, attaque à droite) ──
  const T = { x: 372, y: 34, l: 790, h: 600 };
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  rectArrondi(ctx, T.x, T.y, T.l, T.h, 18); ctx.fillStyle = '#1c7a3c'; ctx.fill();
  ctx.restore();
  ctx.save();
  rectArrondi(ctx, T.x, T.y, T.l, T.h, 18); ctx.clip();
  ctx.fillStyle = '#1a7037';
  for (let bx = T.x + 79; bx < T.x + T.l; bx += 158) ctx.fillRect(bx, T.y, 79, T.h);
  // Lignes du terrain
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(T.x + T.l / 2, T.y); ctx.lineTo(T.x + T.l / 2, T.y + T.h); ctx.stroke();
  ctx.beginPath(); ctx.arc(T.x + T.l / 2, T.y + T.h / 2, 75, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeRect(T.x - 3, T.y + 150, 123, 300);
  ctx.strokeRect(T.x + T.l - 120, T.y + 150, 123, 300);
  ctx.restore();
  rectArrondi(ctx, T.x + 1.5, T.y + 1.5, T.l - 3, T.h - 3, 17);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.stroke();

  // ── Joueurs ──
  const lignes = FORMATIONS[donnees.formation] ?? FORMATIONS['4-3-3'];
  const nbLignes = lignes.length;
  let index = 0;
  lignes.forEach((nb, i) => {
    const px = 10 + i * (77 / (nbLignes - 1));                 // de 10 % (gardien) à 87 % (attaque)
    // Ligne de 5 : maillots, noms et décalage adaptés pour que les joueurs ne se chevauchent pas
    const serre = nb >= 5;
    const taille = serre ? 40 : 54;
    for (let j = 0; j < nb; j++) {
      const joueur = donnees.joueurs[index++] ?? {};
      const py = 2 + (j + 1) * (96 / (nb + 1));
      const decalage = serre ? 6.5 : 3.5;
      const dx = nb >= 4 ? (j % 2 ? decalage : -decalage) : 0;  // 4 joueurs ou plus : décalage en zigzag pour aérer
      const cx = T.x + (T.l * (px + dx)) / 100;
      const cy = T.y + (T.h * py) / 100;
      const haut = cy - (serre ? 42 : 52);

      dessinerMaillot(ctx, cx, haut, taille, joueur.principale || '#9aa5a0', joueur.secondaire || '#ffffff');

      // Nom dans une pastille sombre
      const nom = (joueur.nom || '?').trim().toUpperCase();
      ctx.font = `800 ${serre ? 13 : 15}px ${POLICE_TEXTE}`;
      avecEspacement(ctx, '0.3px');
      const texteNom = tronquer(ctx, nom, serre ? 130 : 170);
      const lNom = ctx.measureText(texteNom).width + (serre ? 16 : 20);
      const hNom = serre ? 21 : 24;
      const yNom = haut + taille + 2;
      ctx.fillStyle = 'rgba(8,21,15,0.88)';
      rectArrondi(ctx, cx - lNom / 2, yNom, lNom, hNom, 7); ctx.fill();
      ctx.fillStyle = joueur.nom?.trim() ? '#ffffff' : 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(texteNom, cx, yNom + (serre ? 15 : 17.5));

      // Club
      if (joueur.club) {
        ctx.font = `600 ${serre ? 11 : 12}px ${POLICE_TEXTE}`;
        avecEspacement(ctx, '0px');
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1;
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.fillText(tronquer(ctx, joueur.club, serre ? 130 : 180), cx, yNom + hNom + (serre ? 13 : 16));
        ctx.restore();
      }
      ctx.textAlign = 'left';
    }
  });
  avecEspacement(ctx, '0px');

  // ── Bande tricolore ──
  const tiers = LARGEUR / 3;
  [[VERT, 0], [ROUGE, 1], [JAUNE, 2]].forEach(([c, k]) => { ctx.fillStyle = c; ctx.fillRect(k * tiers, HAUTEUR - 8, tiers + 1, 8); });
}