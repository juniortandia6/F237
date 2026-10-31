// f237-frontend/src/pages/RegisterPage.jsx
// Inscription, même style que la Connexion :
// bande sombre avec le message à gauche, formulaire dans une carte blanche à droite.

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, AlertCircle, Eye, EyeOff, Mail, Lock, User, Coins, Check, ArrowRight } from "lucide-react";
import theme from "../theme";

const CLAIR = {
  texte: "#141414",
  doux: "#6b7470",
  bord: "#dfe5e1",
  champ: "#f6f8f7",
  vert: "#14532f",
};

// Même règle que le backend (AuthController) : 8 caractères minimum
const LONGUEUR_MIN = 8;

const FOND_BANDE = `linear-gradient(120deg, ${theme.greenDeep} 0%, #12462c 45%, #0f3a25 100%)`;

function EclatsBande() {
  return (
    <svg viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <polygon points="0,600 0,380 260,0 420,0" fill="#1f9d55" opacity="0.22" />
      <polygon points="160,600 520,0 640,0 330,600" fill="#3ccf7a" opacity="0.10" />
      <polygon points="1440,0 1440,260 1180,600 1010,600" fill="#e1252b" opacity="0.16" />
      <polygon points="1300,0 1440,0 1440,90 1240,420" fill="#fcd116" opacity="0.10" />
      <polygon points="760,600 980,180 1060,180 900,600" fill="#1f9d55" opacity="0.10" />
    </svg>
  );
}

// Champ de formulaire avec icône (et contenu optionnel à droite, ex. bouton œil)
function Champ({ label, icone: Icone, droite, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: "block", minWidth: 0 }}>
      <span style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#3d4441", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "7px" }}>
        {label}
      </span>
      <span style={{
        display: "flex", alignItems: "center", gap: "10px", padding: "0 14px",
        backgroundColor: focus ? "#fff" : CLAIR.champ, borderRadius: "12px",
        border: `1.5px solid ${focus ? theme.green : CLAIR.bord}`,
        boxShadow: focus ? "0 0 0 4px rgba(31,157,85,0.12)" : "none",
        transition: "all 0.15s ease",
      }}>
        <Icone size={17} color={focus ? theme.green : CLAIR.doux} style={{ flexShrink: 0 }} />
        <input
          {...props}
          required
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", padding: "13px 0", fontSize: "15px", color: CLAIR.texte }}
        />
        {droite}
      </span>
    </label>
  );
}

// Petit indicateur de règle (✓ vert quand la règle est respectée)
function Regle({ ok, children }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: ok ? theme.green : CLAIR.doux }}>
      <span style={{
        width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
        backgroundColor: ok ? theme.green : "#e6eae8",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {ok && <Check size={11} color="#fff" strokeWidth={3} />}
      </span>
      {children}
    </span>
  );
}

const ETAPES = [
  "Crée ton compte en 30 secondes",
  "Reçois 1 000 points de bienvenue",
  "Pronostique les matchs d'Elite One et d'Elite Two",
];

function RegisterPage() {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", motDePasse: "", confirmer: "" });
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const assezLong = form.motDePasse.length >= LONGUEUR_MIN;
  const aChiffre = /\d/.test(form.motDePasse);
  const identiques = form.confirmer.length > 0 && form.motDePasse === form.confirmer;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    if (!assezLong) {
      setErreur(`Le mot de passe doit contenir au moins ${LONGUEUR_MIN} caractères.`);
      return;
    }
    if (form.motDePasse !== form.confirmer) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await register(form.nom, form.prenom, form.email, form.motDePasse);
      navigate("/jouer");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  const boutonOeil = (
    <button type="button" onClick={() => setVoirMdp(v => !v)}
      aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", display: "flex", color: CLAIR.doux }}>
      {voirMdp ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  return (
    <section style={{ position: "relative", overflow: "hidden", background: FOND_BANDE, minHeight: "calc(100vh - 100px)", display: "flex", alignItems: "center", padding: "56px 0" }}>
      <EclatsBande />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_480px]"
        style={{ position: "relative", width: "100%", maxWidth: "1150px", margin: "0 auto", padding: "0 60px", boxSizing: "content-box", alignItems: "center" }}>

        {/* ── Gauche : message + bonus ─────────────────────────────────── */}
        <div>
          <p style={{ color: theme.yellow, fontSize: "13px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
            Rejoins F237
          </p>
          <h1 style={{ color: "#fff", fontSize: "60px", fontWeight: 400, lineHeight: 1.05, marginBottom: "14px", fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
            Entre dans le jeu
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "17px", lineHeight: 1.55, maxWidth: "460px", marginBottom: "28px" }}>
            Crée ton compte gratuitement et commence à pronostiquer les matchs du football camerounais.
          </p>

          {/* Carte bonus */}
          <div style={{
            display: "flex", alignItems: "center", gap: "16px", maxWidth: "440px", padding: "18px 20px", marginBottom: "26px",
            borderRadius: "16px", backgroundColor: "rgba(252,209,22,0.10)", border: "1px solid rgba(252,209,22,0.35)",
          }}>
            <span style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: theme.yellow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Coins size={26} color="#3a2c00" />
            </span>
            <div>
              <div style={{ color: theme.yellow, fontFamily: '"Barlow Condensed", Arial, sans-serif', fontSize: "30px", fontWeight: 800, lineHeight: 1 }}>1 000 points</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", marginTop: "3px" }}>offerts dès ton inscription</div>
            </div>
          </div>

          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {ETAPES.map((texte, i) => (
              <li key={texte} style={{ display: "flex", alignItems: "center", gap: "12px", color: "rgba(255,255,255,0.85)", fontSize: "15px" }}>
                <span style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  border: `1.5px solid ${theme.greenBright}`, color: theme.greenBright,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800,
                }}>{i + 1}</span>
                {texte}
              </li>
            ))}
          </ol>
        </div>

        {/* ── Droite : carte du formulaire ─────────────────────────────── */}
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "34px 32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: CLAIR.texte, marginBottom: "4px" }}>Inscription</h2>
          <p style={{ fontSize: "14px", color: CLAIR.doux, marginBottom: "22px" }}>Quelques infos et c'est parti.</p>

          {erreur && (
            <div role="alert" style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", marginBottom: "18px",
              borderRadius: "12px", backgroundColor: "#fdecec", border: "1px solid #f6c9ca", color: "#b4161b", fontSize: "14px", fontWeight: 600,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Champ label="Prénom" icone={User} type="text" name="prenom" value={form.prenom} onChange={handleChange} placeholder="Junior" autoComplete="given-name" />
              <Champ label="Nom" icone={User} type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Tandia" autoComplete="family-name" />
            </div>

            <Champ label="Email" icone={Mail} type="email" name="email" value={form.email} onChange={handleChange} placeholder="junior@example.com" autoComplete="email" />

            <Champ label="Mot de passe" icone={Lock} type={voirMdp ? "text" : "password"} name="motDePasse"
              value={form.motDePasse} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" droite={boutonOeil} />

            <Champ label="Confirmer le mot de passe" icone={Lock} type={voirMdp ? "text" : "password"} name="confirmer"
              value={form.confirmer} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" />

            {/* Règles du mot de passe, mises à jour en direct */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: "-2px" }}>
              <Regle ok={assezLong}>{LONGUEUR_MIN} caractères minimum</Regle>
              <Regle ok={aChiffre}>Au moins un chiffre (conseillé)</Regle>
              <Regle ok={identiques}>Mots de passe identiques</Regle>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="transition-all hover:brightness-110"
              style={{
                marginTop: "6px", width: "100%", padding: "14px", borderRadius: "999px", border: "none",
                backgroundColor: theme.green, color: "#fff", fontSize: "16px", fontWeight: 800,
                cursor: loading ? "wait" : "pointer", opacity: loading ? 0.8 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 8px 20px rgba(31,157,85,0.35)",
              }}
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Inscription...</>
                : <>Créer mon compte <ArrowRight size={18} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: CLAIR.doux }}>
            Déjà un compte ?{" "}
            <Link to="/login" style={{ color: CLAIR.vert, fontWeight: 800 }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;