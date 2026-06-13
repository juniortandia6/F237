// f237-frontend/src/pages/EquipeDetailPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Trophy,
  Users,
  TrendingUp,
  Building2,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const BASE_URL = "http://localhost:5257/api";

// ── Helpers ────────────────────────────────────────────────────────────────────

const COULEURS_RESULTAT = {
  V: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", label: "V" },
  N: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", label: "N" },
  D: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "D" },
  "?": { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: "?" },
};

const POSTES_ORDRE = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
const POSTE_FR = {
  Goalkeeper: "Gardiens",
  Defender: "Défenseurs",
  Midfielder: "Milieux",
  Attacker: "Attaquants",
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

// ── Composants ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl p-3 text-center ${
        highlight ? "bg-[#1a7a3c] text-white" : "bg-white border border-gray-200"
      }`}
    >
      <div className={`text-2xl font-bold ${highlight ? "text-white" : "text-gray-800"}`}>
        {value ?? "—"}
      </div>
      <div className={`text-xs mt-0.5 font-medium uppercase tracking-wide ${highlight ? "text-green-100" : "text-gray-500"}`}>
        {label}
      </div>
    </div>
  );
}

function BadgeResultat({ resultat }) {
  const c = COULEURS_RESULTAT[resultat] ?? COULEURS_RESULTAT["?"];
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.label}
    </span>
  );
}

function Section({ titre, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Icon size={18} className="text-[#1a7a3c]" />
        <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">{titre}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function EquipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetch(`${BASE_URL}/equipes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Équipe introuvable");
        return r.json();
      })
      .then((d) => {
        if (!ignore) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!ignore) {
          setErreur(e.message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 size={36} className="animate-spin text-[#1a7a3c]" />
          <span className="text-sm font-medium">Chargement du club...</span>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle size={40} className="text-red-400 mx-auto" />
          <p className="text-gray-600 font-medium">{erreur}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-[#1a7a3c] text-sm font-semibold underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const infos = data.infos;
  const classement = data.classement;
  const derniersMatchs = data.derniersMatchs ?? [];
  const palmares = data.palmares ?? [];
  const effectif = data.effectif ?? [];

  // Grouper l'effectif par poste
  const effectifGroupe = POSTES_ORDRE.reduce((acc, poste) => {
    const joueurs = effectif.filter((j) => j.poste === poste);
    if (joueurs.length > 0) acc[poste] = joueurs;
    return acc;
  }, {});

  const sansPoste = effectif.filter((j) => !POSTES_ORDRE.includes(j.poste));

  return (
    <div className="min-h-screen bg-[#f5f5f0]" style={{ fontFamily: "Raleway, sans-serif" }}>

      {/* ── Header hero ──────────────────────────────────────────────────────── */}
      <div className="bg-[#1a7a3c] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Retour */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-green-200 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Toutes les équipes
          </button>

          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur p-2 flex-shrink-0 flex items-center justify-center">
              {!imgError && data.logoUrl ? (
                <img
                  src={data.logoUrl}
                  alt={data.nom}
                  className="w-full h-full object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="text-3xl font-black text-white/40">
                  {data.nom?.charAt(0)}
                </div>
              )}
            </div>

            {/* Nom + infos rapides */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-black tracking-tight">{data.nom}</h1>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    data.division === 0
                      ? "bg-[#FCD116] text-black"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {data.division === 0 ? "ELITE ONE" : "ELITE TWO"}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-green-100 text-sm">
                {infos?.ville && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {infos.ville}
                  </span>
                )}
                {infos?.anneeCreation && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    Fondé en {infos.anneeCreation}
                  </span>
                )}
                {infos?.stadeNom && (
                  <span className="flex items-center gap-1.5">
                    <Building2 size={14} />
                    {infos.stadeNom}
                    {infos.stadeCapacite && (
                      <span className="text-green-300">
                        ({infos.stadeCapacite.toLocaleString()} places)
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Image stade */}
          {infos?.stadeImage && (
            <div className="mt-5 rounded-xl overflow-hidden h-40 w-full">
              <img
                src={infos.stadeImage}
                alt={infos.stadeNom}
                className="w-full h-full object-cover opacity-70"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Contenu principal ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Stats saison */}
        {classement && (
          <Section titre="Saison 2026" icon={TrendingUp}>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              <StatBox label="Pos." value={`#${classement.position}`} highlight />
              <StatBox label="Pts" value={classement.points} highlight />
              <StatBox label="MJ" value={classement.matchsJoues} />
              <StatBox label="V" value={classement.victoires} />
              <StatBox label="N" value={classement.nuls} />
              <StatBox label="D" value={classement.defaites} />
              <StatBox label="BP" value={classement.butsPour} />
              <StatBox label="BC" value={classement.butsContre} />
            </div>
          </Section>
        )}

        {/* Derniers matchs */}
        {derniersMatchs.length > 0 && (
          <Section titre="5 Derniers matchs" icon={ChevronRight}>
            <div className="space-y-3">
              {derniersMatchs.map((m) => (
                <div
                  key={m.matchId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <BadgeResultat resultat={m.resultat} />

                  <span className="text-xs text-gray-400 w-14 flex-shrink-0 font-medium">
                    {formatDate(m.dateMatch)}
                  </span>

                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                      {m.logoDomicile && (
                        <img src={m.logoDomicile} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                      )}
                      <span className={`text-sm truncate ${m.estDomicile ? "font-bold text-gray-900" : "text-gray-500"}`}>
                        {m.equipeDomicile}
                      </span>
                    </div>

                    <span className="text-sm font-black text-gray-800 flex-shrink-0 w-14 text-center">
                      {m.scoreDomicile ?? "–"} - {m.scoreExterieur ?? "–"}
                    </span>

                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {m.logoExterieur && (
                        <img src={m.logoExterieur} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                      )}
                      <span className={`text-sm truncate ${!m.estDomicile ? "font-bold text-gray-900" : "text-gray-500"}`}>
                        {m.equipeExterieur}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Palmarès */}
        {palmares.length > 0 ? (
          <Section titre={`Palmarès (${palmares.length} titre${palmares.length > 1 ? "s" : ""})`} icon={Trophy}>
            <div className="space-y-3">
              {palmares.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                  <Trophy size={18} className="text-yellow-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{t.ligue}</p>
                    <p className="text-xs text-gray-500">{t.saison} · {t.pays}</p>
                  </div>
                  <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    🏆 {t.place}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        ) : (
          <Section titre="Palmarès" icon={Trophy}>
            <p className="text-sm text-gray-400 text-center py-4">
              Aucun titre enregistré dans l'API pour ce club.
            </p>
          </Section>
        )}

        {/* Effectif */}
        <Section titre={`Effectif (${effectif.length} joueurs)`} icon={Users}>
          {effectif.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Effectif non disponible dans l'API pour cette saison.
            </p>
          ) : (
            <div className="space-y-6">
              {POSTES_ORDRE.map((poste) => {
                const joueurs = effectifGroupe[poste];
                if (!joueurs) return null;
                return (
                  <div key={poste}>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#1a7a3c] mb-3 border-b border-green-100 pb-1">
                      {POSTE_FR[poste]} ({joueurs.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {joueurs.map((j) => (
                        <div key={j.apiId} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            {j.photo ? (
                              <img
                                src={j.photo}
                                alt={j.nom}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                                {j.nom?.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{j.nom}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {j.age && <span>{j.age} ans</span>}
                              {j.nationalite && <span>· {j.nationalite}</span>}
                            </div>
                          </div>

                          {j.numero && (
                            <span className="text-xs font-black text-gray-300 w-6 text-center flex-shrink-0">
                              #{j.numero}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {sansPoste.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                    Autres ({sansPoste.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sansPoste.map((j) => (
                      <div key={j.apiId} className="flex items-center gap-3 p-2.5 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold">
                          {j.nom?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-600 truncate">{j.nom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
