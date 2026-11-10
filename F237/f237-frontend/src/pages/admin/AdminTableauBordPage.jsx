// f237-frontend/src/pages/admin/AdminTableauBordPage.jsx
// Tableau de bord admin :
// - quota API-Football du jour
// - état de la saison en cours (Elite One / Elite Two) : matchs, reportés, buts inconnus...
// - totaux du site
// - imports de saison en un clic (remplace les requêtes Postman)

import { useEffect, useState } from 'react';
import { Gauge, RefreshCw, AlertTriangle, CheckCircle2, Download, Newspaper, Users, Shield, CalendarClock } from 'lucide-react';
import { adminService, LIGUES_API } from '../../services/adminService';
import { SAISONS_DB, SAISON_EN_COURS, COMPETITIONS, libelleSaison } from '../../data/saisons';
import { locale } from '../../i18n';
import { CLAIR, CHIFFRES, CARTE, TITRE_CARTE } from './styleAdmin';

const IDS_EN_COURS = Object.values(SAISONS_DB[SAISON_EN_COURS] ?? {});

// Saisons importées, de la plus récente à la plus ancienne : [{ annee, cle, label, saisonId }]
const IMPORTS = Object.keys(SAISONS_DB).map(Number).sort((a, b) => b - a)
  .flatMap(annee => COMPETITIONS
    .filter(c => SAISONS_DB[annee][c.cle] != null)
    .map(c => ({ annee, cle: c.cle, label: c.label, saisonId: SAISONS_DB[annee][c.cle] })));

const formatDate = (d) => new Date(d).toLocaleString(locale(), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// ── Petits blocs ────────────────────────────────────────────────────────
function Chiffre({ valeur, label, alerte }) {
  const couleur = alerte === 'rouge' ? CLAIR.rouge : alerte === 'orange' ? CLAIR.orange : CLAIR.texte;
  return (
    <div style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: alerte === 'rouge' ? CLAIR.rougeClair : alerte === 'orange' ? CLAIR.orangeClair : CLAIR.tuile }}>
      <div style={{ fontFamily: CHIFFRES, fontSize: '30px', fontWeight: 800, color: couleur, lineHeight: 1 }}>{valeur ?? '–'}</div>
      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: alerte ? couleur : CLAIR.doux, marginTop: '6px' }}>{label}</div>
    </div>
  );
}

function CarteQuota({ quota, erreur }) {
  const pct = quota ? Math.min(100, Math.round((quota.requetesDuJour / Math.max(1, quota.limiteParJour)) * 100)) : 0;
  return (
    <div style={CARTE}>
      <div style={TITRE_CARTE}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Gauge size={18} color={CLAIR.vert} /> Quota API-Football</span>
        {quota?.plan && <span style={{ fontSize: '11px', fontWeight: 800, color: CLAIR.doux, textTransform: 'uppercase' }}>Plan {quota.plan}</span>}
      </div>
      <div style={{ padding: '18px' }}>
        {erreur ? (
          <p style={{ color: CLAIR.rouge, fontSize: '14px' }}>{erreur}</p>
        ) : !quota ? (
          <p style={{ color: CLAIR.doux, fontSize: '14px' }}>Chargement…</p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: CHIFFRES, fontSize: '40px', fontWeight: 800, color: CLAIR.vert, lineHeight: 1 }}>{quota.restantes.toLocaleString(locale())}</span>
              <span style={{ fontSize: '14px', color: CLAIR.doux }}>requêtes restantes aujourd'hui</span>
            </div>
            <div style={{ height: '8px', borderRadius: '999px', backgroundColor: CLAIR.tuile, margin: '14px 0 8px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', backgroundColor: pct > 85 ? CLAIR.rouge : pct > 60 ? CLAIR.orange : CLAIR.vert }} />
            </div>
            <div style={{ fontSize: '12px', color: CLAIR.doux }}>
              {quota.requetesDuJour.toLocaleString(locale())} / {quota.limiteParJour.toLocaleString(locale())} utilisées ({pct} %)
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CarteSaison({ s }) {
  const aCorriger = s.enRetard > 0 || s.butsInconnus > 0;
  return (
    <div style={CARTE}>
      <div style={TITRE_CARTE}>
        <span>{s.nom}</span>
        {aCorriger
          ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: CLAIR.orange }}><AlertTriangle size={15} /> À vérifier</span>
          : <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: CLAIR.vert }}><CheckCircle2 size={15} /> À jour</span>}
      </div>
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
        <Chiffre valeur={s.termines} label="Terminés" />
        <Chiffre valeur={s.aVenir} label="À venir" />
        <Chiffre valeur={s.reportes} label="Reportés" alerte={s.reportes ? 'orange' : null} />
        <Chiffre valeur={s.annules} label="Annulés" />
        <Chiffre valeur={s.buts} label="Buts" />
        <Chiffre valeur={s.butsInconnus} label="Buteurs inconnus" alerte={s.butsInconnus ? 'rouge' : null} />
        <Chiffre valeur={s.enRetard} label="Non mis à jour" alerte={s.enRetard ? 'rouge' : null} />
        <Chiffre valeur={s.matchs} label="Matchs au total" />
      </div>
      <div style={{ padding: '0 18px 16px', fontSize: '13px', color: CLAIR.doux, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CalendarClock size={15} />
        {s.prochainMatch ? <>Prochain match : <strong style={{ color: CLAIR.texte, textTransform: 'capitalize' }}>{formatDate(s.prochainMatch)}</strong></> : 'Aucun match à venir'}
        {s.enRetard > 0 && <span style={{ color: CLAIR.rouge }}> · relance l'import de la saison</span>}
      </div>
    </div>
  );
}

// Résumé d'un import sous la ligne
function texteResultat(r) {
  if (r.erreur) return r.erreur;
  const morceaux = [`${r.matchs} matchs`];
  if (r.butsFournis === false) morceaux.push('buteurs non fournis par l\'API');
  else {
    morceaux.push(`${r.butsImportes} buts importés`);
    if (!r.termine && r.matchsSansButsRestants) morceaux.push(`${r.matchsSansButsRestants} matchs sans buts (relance plus tard)`);
  }
  morceaux.push(`${r.requetesUtilisees} requêtes`);
  return morceaux.join(' · ');
}

// Une saison importable. Saison terminée : un 1er clic demande confirmation
// (le bouton devient "Confirmer"), pour éviter les réimports par erreur.
function LigneImport({ imp, enCours, bloque, resultat, aConfirmer, onDemander, onAnnuler, onImporter }) {
  const actuelle = imp.annee === SAISON_EN_COURS;
  const clic = () => (actuelle || aConfirmer ? onImporter() : onDemander());
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: '14px', padding: '12px 18px', borderTop: `1px solid ${CLAIR.bord}`, backgroundColor: actuelle ? '#f7fbf8' : 'transparent' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: CLAIR.texte }}>
          MTN {imp.label} · {libelleSaison(imp.annee)}
          {actuelle && <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', backgroundColor: CLAIR.vertClair, color: CLAIR.vert, padding: '3px 8px', borderRadius: '999px' }}>En cours</span>}
        </div>
        {resultat && (
          <div style={{ fontSize: '12px', marginTop: '4px', color: resultat.erreur ? CLAIR.rouge : CLAIR.doux }}>
            {texteResultat(resultat)}
          </div>
        )}
        {aConfirmer && !enCours && (
          <div style={{ fontSize: '12px', marginTop: '4px', color: CLAIR.orange, fontWeight: 600 }}>
            Saison terminée : un réimport n'est utile que si l'API a corrigé des données.
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {aConfirmer && !enCours && (
        <button onClick={onAnnuler}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: CLAIR.doux }}>
          Annuler
        </button>
      )}
      <button onClick={clic} disabled={bloque}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '999px', border: 'none',
          cursor: bloque ? 'default' : 'pointer', fontSize: '13px', fontWeight: 700,
          backgroundColor: enCours ? CLAIR.tuile : aConfirmer ? CLAIR.orange : actuelle ? CLAIR.vert : CLAIR.carte,
          color: enCours ? CLAIR.doux : actuelle || aConfirmer ? '#fff' : CLAIR.vert,
          boxShadow: actuelle || enCours || aConfirmer ? 'none' : `inset 0 0 0 1px ${CLAIR.bord}`,
          opacity: bloque && !enCours ? 0.5 : 1,
        }}>
        {enCours ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
        {enCours ? 'Import…' : aConfirmer ? 'Confirmer' : 'Importer'}
      </button>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────
export default function AdminTableauBordPage() {
  const [version, setVersion] = useState(0);            // +1 = recharger les chiffres
  const [stats, setStats] = useState(null);
  const [erreurStats, setErreurStats] = useState(null);
  const [quota, setQuota] = useState(null);
  const [erreurQuota, setErreurQuota] = useState(null);
  const [importEnCours, setImportEnCours] = useState(null); // `${annee}-${cle}`
  const [resultats, setResultats] = useState({});           // clé -> résultat d'import
  const [aConfirmer, setAConfirmer] = useState(null);       // saison terminée en attente de confirmation

  useEffect(() => {
    let ignore = false;
    adminService.tableauDeBord(IDS_EN_COURS)
      .then(d => { if (!ignore) { setStats(d); setErreurStats(null); } })
      .catch(e => { if (!ignore) setErreurStats(e.statut === 403 || e.statut === 401 ? 'Session expirée ou rôle insuffisant : reconnecte-toi.' : e.message); });
    adminService.quota()
      .then(q => { if (!ignore) { setQuota(q); setErreurQuota(null); } })
      .catch(e => { if (!ignore) setErreurQuota(e.message); });
    return () => { ignore = true; };
  }, [version]);

  const importer = async (imp) => {
    const cle = `${imp.annee}-${imp.cle}`;
    setAConfirmer(null);
    setImportEnCours(cle);
    try {
      const r = await adminService.importerSaison(LIGUES_API[imp.cle], imp.annee);
      setResultats(prev => ({ ...prev, [cle]: r }));
    } catch (e) {
      setResultats(prev => ({ ...prev, [cle]: { erreur: e.message } }));
    } finally {
      setImportEnCours(null);
      setVersion(v => v + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: CLAIR.texte }}>Tableau de bord</h2>
        <button onClick={() => setVersion(v => v + 1)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '999px', border: `1px solid ${CLAIR.bord}`, backgroundColor: CLAIR.carte, color: CLAIR.texte, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {erreurStats && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: CLAIR.rougeClair, color: CLAIR.rouge, fontSize: '14px', fontWeight: 600 }}>{erreurStats}</div>
      )}

      {/* Quota + totaux du site */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '18px' }}>
        <CarteQuota quota={quota} erreur={erreurQuota} />
        <div style={CARTE}>
          <div style={TITRE_CARTE}>Le site en chiffres</div>
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            {[
              { Icone: Newspaper, valeur: stats?.articlesPublies, label: 'Articles publiés' },
              { Icone: Newspaper, valeur: stats?.articlesBrouillons, label: 'Brouillons' },
              { Icone: Users, valeur: stats?.utilisateurs, label: 'Utilisateurs' },
              { Icone: Shield, valeur: stats?.equipes, label: 'Équipes' },
            ].map(({ Icone, valeur, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', backgroundColor: CLAIR.tuile }}>
                <Icone size={18} color={CLAIR.vert} />
                <div>
                  <div style={{ fontFamily: CHIFFRES, fontSize: '24px', fontWeight: 800, color: CLAIR.texte, lineHeight: 1 }}>{valeur ?? '–'}</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase', color: CLAIR.doux, marginTop: '3px' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saison en cours */}
      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: CLAIR.texte, marginBottom: '12px' }}>Saison {libelleSaison(SAISON_EN_COURS)}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stats
            ? stats.saisons.map(s => <CarteSaison key={s.saisonId} s={s} />)
            : !erreurStats && <p style={{ color: CLAIR.doux, fontSize: '14px' }}>Chargement…</p>}
        </div>
      </div>

      {/* Imports */}
      <div style={CARTE}>
        <div style={TITRE_CARTE}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={18} color={CLAIR.vert} /> Importer depuis API-Football</span>
        </div>
        <p style={{ padding: '12px 18px', fontSize: '13px', color: CLAIR.doux, lineHeight: 1.5 }}>
          Met à jour les matchs, statuts, classements et buteurs d'une saison. Relançable sans risque : les corrections faites à la main
          (heures, logos, buteurs) sont conservées. L'import automatique le fait déjà toutes les 6 h pour la saison en cours ;
          les saisons terminées demandent une confirmation. Un import à la fois.
        </p>
        {IMPORTS.map(imp => {
          const cle = `${imp.annee}-${imp.cle}`;
          return (
            <LigneImport key={cle} imp={imp} resultat={resultats[cle]}
              enCours={importEnCours === cle} bloque={importEnCours != null}
              aConfirmer={aConfirmer === cle}
              onDemander={() => setAConfirmer(cle)}
              onAnnuler={() => setAConfirmer(null)}
              onImporter={() => importer(imp)} />
          );
        })}
      </div>
    </div>
  );
}