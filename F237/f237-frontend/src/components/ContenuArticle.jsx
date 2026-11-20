// f237-frontend/src/components/ContenuArticle.jsx
// Corps d'un article (fond blanc), utilisé par la page article ET l'aperçu de l'admin.
//
// Le contenu reste du texte simple : un bloc = un paragraphe séparé par une ligne vide.
// Quelques blocs spéciaux, à écrire seuls dans leur paragraphe :
//
//   ## Le tournant du match              -> intertitre (bandeau gris, comme sur FIBA)
//   ![Légende de la photo](/actualites/photo.jpg)   -> image avec légende
//   > Une citation                        -> citation
//
// Dans un paragraphe normal :  **texte en gras**   et   [un lien](https://...)
//
// Sécurité : aucun HTML n'est injecté (pas de dangerouslySetInnerHTML). Les liens et images
// n'acceptent que http(s) ou un chemin du site (/...).

import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { COULEURS_ARTICLE, ADRESSE_SURE, analyserBlocs, ancre } from '../data/contenuArticle';

const POLICE_TITRES = 'var(--font-titres)';

// **gras** et [lien](adresse) dans une ligne de texte
function TexteEnrichi({ texte }) {
  const morceaux = [];
  const motif = /\*\*(.+?)\*\*|\[([^\]]+)\]\((\S+?)\)/g;
  let dernier = 0;
  let m;
  while ((m = motif.exec(texte)) !== null) {
    if (m.index > dernier) morceaux.push(texte.slice(dernier, m.index));
    if (m[1] !== undefined) {
      morceaux.push(<strong key={m.index} style={{ fontWeight: 700, color: COULEURS_ARTICLE.texte }}>{m[1]}</strong>);
    } else if (ADRESSE_SURE.test(m[3])) {
      const style = { color: COULEURS_ARTICLE.vert, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' };
      morceaux.push(/^https?:/i.test(m[3])
        // Lien vers un autre site : nouvel onglet
        ? <a key={m.index} href={m[3]} target="_blank" rel="noopener noreferrer" style={style}>{m[2]}</a>
        // Page du site (/classement, /matchs/12...) : navigation sans recharger la page
        : <Link key={m.index} to={m[3]} style={style}>{m[2]}</Link>);
    } else {
      morceaux.push(m[2]); // adresse refusée : on garde juste le texte
    }
    dernier = motif.lastIndex;
  }
  if (dernier < texte.length) morceaux.push(texte.slice(dernier));
  return morceaux.map((x, i) => <Fragment key={i}>{x}</Fragment>);
}

/**
 * paragraphes : tableau de chaînes (un élément = un paragraphe).
 * compact : tailles réduites (aperçu de l'admin).
 */
export default function ContenuArticle({ paragraphes, compact = false }) {
  const blocs = analyserBlocs(paragraphes);
  const tailleCorps = compact ? '15px' : '18px';

  return (
    <div>
      {blocs.map((b, i) => {
        if (b.type === 'titre') {
          return (
            <h2 key={i} id={ancre(b.texte, i)} style={{
              backgroundColor: COULEURS_ARTICLE.bandeau, color: COULEURS_ARTICLE.texte, fontFamily: POLICE_TITRES,
              fontWeight: 400, fontSize: compact ? '19px' : '24px', lineHeight: 1.25,
              padding: compact ? '12px 14px' : '18px 20px', borderRadius: '4px',
              margin: compact ? '22px 0 14px' : '36px 0 20px', scrollMarginTop: '140px',
            }}>
              {b.texte}
            </h2>
          );
        }
        if (b.type === 'image') {
          return (
            <figure key={i} style={{ margin: compact ? '18px 0' : '28px 0' }}>
              <img src={b.src} alt={b.legende} loading="lazy"
                style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '10px', backgroundColor: '#e8ebe9' }} />
              {b.legende && (
                <figcaption style={{ marginTop: '8px', fontSize: compact ? '12px' : '14px', color: COULEURS_ARTICLE.doux }}>
                  {b.legende}
                </figcaption>
              )}
            </figure>
          );
        }
        if (b.type === 'citation') {
          return (
            <blockquote key={i} style={{
              margin: compact ? '18px 0' : '28px 0', padding: compact ? '4px 0 4px 14px' : '6px 0 6px 20px',
              borderLeft: `4px solid ${COULEURS_ARTICLE.vert}`, color: COULEURS_ARTICLE.texte,
              fontSize: compact ? '16px' : '21px', fontWeight: 600, lineHeight: 1.5, fontStyle: 'italic',
            }}>
              <TexteEnrichi texte={b.texte} />
            </blockquote>
          );
        }
        return (
          <p key={i} style={{ fontSize: tailleCorps, color: COULEURS_ARTICLE.corps, lineHeight: 1.7, margin: compact ? '0 0 12px' : '0 0 20px' }}>
            <TexteEnrichi texte={b.texte} />
          </p>
        );
      })}
    </div>
  );
}