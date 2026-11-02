// f237-frontend/src/data/actualites.js
// Source unique des actualités : utilisée par le hero de l'accueil (barres de
// progression), la section "Dernières nouvelles", la page /actualites et la
// page article /actualites/:slug.
//
// ⚠️ CONTENU DE DÉMONSTRATION : les textes ci-dessous sont des exemples
// rédigés pour la maquette, pas des faits vérifiés. Remplace-les par de vraies
// actualités (ou, plus tard, par un endpoint /api/actualites côté .NET).
//
// Version anglaise : le bloc `en` de chaque article (titre, resume, contenu).
// S'il manque, le texte français est affiché.

import img1 from '../assets/accueil1.jpg';
import img2 from '../assets/accueil2.jpg';
import img3 from '../assets/accueil3.jpg';
import img4 from '../assets/accueil4.jpg';
import img5 from '../assets/accueil5.jpg';
import i18n, { locale } from '../i18n';

export const ACTUALITES = [
  {
    slug: 'colombe-en-tete-du-classement',
    img: img1,
    tag: 'Elite One',
    date: '2026-07-01',
    titre: "Colombe s'envole en tête du classement après une saison exceptionnelle",
    resume: "Retour sur la régularité qui a porté Colombe en haut du classement de la MTN Elite One.",
    contenu: [
      "Texte de démonstration — remplace ce paragraphe par le contenu réel de l'article.",
      "Tu peux ajouter autant de paragraphes que nécessaire : chaque élément du tableau devient un paragraphe sur la page article.",
    ],
    en: {
      titre: "Colombe soar to the top of the table after an exceptional season",
      resume: "A look back at the consistency that carried Colombe to the top of the MTN Elite One table.",
      contenu: [
        "Demo text — replace this paragraph with the article's real content.",
        "You can add as many paragraphs as you need: each item in the array becomes a paragraph on the article page.",
      ],
    },
  },
  {
    slug: 'dynamo-douala-serie-de-victoires',
    img: img2,
    tag: 'Elite One',
    date: '2026-06-28',
    titre: 'Dynamo de Douala confirme ses ambitions avec une série de victoires',
    resume: "Le Dynamo enchaîne les bons résultats et s'installe dans le haut du tableau.",
    contenu: [
      "Texte de démonstration — remplace ce paragraphe par le contenu réel de l'article.",
    ],
    en: {
      titre: "Dynamo de Douala confirm their ambitions with a winning streak",
      resume: "Dynamo keep piling up good results and are settling into the top of the table.",
      contenu: [
        "Demo text — replace this paragraph with the article's real content.",
      ],
    },
  },
  {
    slug: 'apejes-domine-le-groupe-a',
    img: img3,
    tag: 'Elite Two',
    date: '2026-06-25',
    titre: 'APEJES Academy domine le Groupe A et vise la montée en Elite One',
    resume: "En Elite Two, APEJES Academy fait la course en tête dans son groupe.",
    contenu: [
      "Texte de démonstration — remplace ce paragraphe par le contenu réel de l'article.",
    ],
    en: {
      titre: "APEJES Academy dominate Group A and aim for promotion to Elite One",
      resume: "In Elite Two, APEJES Academy are setting the pace in their group.",
      contenu: [
        "Demo text — replace this paragraph with the article's real content.",
      ],
    },
  },
  {
    slug: 'unisport-bafang-dans-la-course',
    img: img4,
    tag: 'Elite One',
    date: '2026-06-22',
    titre: 'Unisport Bafang reste dans la course au titre malgré la concurrence',
    resume: "Unisport Bafang s'accroche au peloton de tête jusqu'aux dernières journées.",
    contenu: [
      "Texte de démonstration — remplace ce paragraphe par le contenu réel de l'article.",
    ],
    en: {
      titre: "Unisport Bafang stay in the title race despite the competition",
      resume: "Unisport Bafang are hanging on to the leading pack right up to the final matchdays.",
      contenu: [
        "Demo text — replace this paragraph with the article's real content.",
      ],
    },
  },
  {
    slug: 'mercato-clubs-camerounais',
    img: img5,
    tag: 'Transfert',
    date: '2026-06-20',
    titre: "Le mercato s'agite dans les clubs camerounais en vue de la prochaine saison",
    resume: "Arrivées, départs, prolongations : tour d'horizon des mouvements à surveiller.",
    contenu: [
      "Texte de démonstration — remplace ce paragraphe par le contenu réel de l'article.",
    ],
    en: {
      titre: "The transfer window heats up at Cameroonian clubs ahead of next season",
      resume: "Arrivals, departures, contract extensions: a roundup of the moves to watch.",
      contenu: [
        "Demo text — replace this paragraph with the article's real content.",
      ],
    },
  },
  {
    slug: 'cotonsport-bilan-de-saison',
    img: img2,
    tag: 'Elite One',
    date: '2026-06-18',
    titre: 'Cotonsport : le bilan d’une saison en dents de scie',
    resume: "Analyse de la saison du club de Garoua, entre coups d'éclat et regrets.",
    contenu: [
      "Texte de démonstration — remplace ce paragraphe par le contenu réel de l'article.",
    ],
    en: {
      titre: "Cotonsport: looking back on an up-and-down season",
      resume: "An analysis of the Garoua club's season, between moments of brilliance and regrets.",
      contenu: [
        "Demo text — replace this paragraph with the article's real content.",
      ],
    },
  },
  {
    slug: 'jeunes-talents-a-suivre',
    img: img1,
    tag: 'Talents',
    date: '2026-06-15',
    titre: 'Cinq jeunes talents à suivre la saison prochaine',
    resume: "Ils ont marqué les esprits cette saison : portraits de joueurs prometteurs.",
    contenu: [
      "Texte de démonstration — remplace ce paragraphe par le contenu réel de l'article.",
    ],
    en: {
      titre: "Five young talents to watch next season",
      resume: "They made their mark this season: profiles of promising players.",
      contenu: [
        "Demo text — replace this paragraph with the article's real content.",
      ],
    },
  },
  {
    slug: 'calendrier-saison-prochaine',
    img: img3,
    tag: 'Compétition',
    date: '2026-06-12',
    titre: 'Ce que l’on sait du calendrier de la prochaine saison',
    resume: "Dates de reprise, format, nombre de journées : les premières informations.",
    contenu: [
      "Texte de démonstration — remplace ce paragraphe par le contenu réel de l'article.",
    ],
    en: {
      titre: "What we know about next season's schedule",
      resume: "Restart dates, format, number of matchdays: the first details.",
      contenu: [
        "Demo text — replace this paragraph with the article's real content.",
      ],
    },
  },
];

// Les 5 premières alimentent le hero et ses barres de progression
export const ACTUS_HERO = ACTUALITES.slice(0, 5);

/** Texte d'un article dans la langue active (repli sur le français). champ : 'titre' | 'resume' | 'contenu' */
export const texteActu = (a, champ) =>
  (i18n.resolvedLanguage === 'en' && a?.en?.[champ]) || a?.[champ];

export const getActualite = (slug) => ACTUALITES.find(a => a.slug === slug);

export const formatDateActu = (iso) =>
  new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' });