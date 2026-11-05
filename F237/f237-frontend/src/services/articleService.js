// f237-frontend/src/services/articleService.js
// Actualités servies par l'API .NET (/api/articles).
// Adresse de l'API : VITE_API_URL dans ton .env (sinon l'API locale).

const API_URL = (import.meta.env?.VITE_API_URL ?? 'http://localhost:5257').replace(/\/$/, '');

async function lire(chemin) {
  const reponse = await fetch(`${API_URL}${chemin}`);
  if (reponse.status === 404) return null;
  if (!reponse.ok) throw new Error(`API ${reponse.status} sur ${chemin}`);
  return reponse.json();
}

export const articleService = {
  /** Articles publiés (sans le contenu), du plus récent au plus ancien. */
  getAll: (tag) => lire(`/api/articles${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`).then(l => l ?? []),

  /** Un article publié avec son contenu, ou null s'il n'existe pas. */
  getBySlug: (slug) => lire(`/api/articles/${encodeURIComponent(slug)}`),
};