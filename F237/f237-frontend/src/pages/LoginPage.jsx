// f237-frontend/src/pages/LoginPage.jsx
// Connexion, dans le style des autres pages :
// bande sombre (dégradé vert + éclats) avec le texte à gauche et le formulaire
// dans une carte blanche à droite.

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, AlertCircle, Eye, EyeOff, Mail, Lock, Trophy, Target, Coins, ArrowRight } from "lucide-react";
import theme from "../theme";

const CLAIR = {
  texte: "#141414",
  doux: "#6b7470",
  bord: "#dfe5e1",
  champ: "#f6f8f7",
  vert: "#14532f",
};

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

// Champ de formulaire avec icône (et bouton œil pour le mot de passe)
function Champ({ label, icone: Icone, type, value, onChange, placeholder, autoComplete, droite }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: "block" }}>
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
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
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

const AVANTAGES = [
  { icone: Coins, titre: "1 000 points offerts", texte: "Ton capital de départ pour parier dès l'inscription." },
  { icone: Target, titre: "Pronostics sur chaque match", texte: "Elite One et Elite Two, avant le coup d'envoi." },
  { icone: Trophy, titre: "Grimpe au classement", texte: "Affronte les autres fans de football camerounais." },
];

function LoginPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    try {
      await login(email, motDePasse);
      navigate("/jouer");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ position: "relative", overflow: "hidden", background: FOND_BANDE, minHeight: "calc(100vh - 100px)", display: "flex", alignItems: "center", padding: "56px 0" }}>
      <EclatsBande />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px]"
        style={{ position: "relative", width: "100%", maxWidth: "1150px", margin: "0 auto", padding: "0 60px", boxSizing: "content-box", alignItems: "center" }}>

        {/* ── Gauche : message + avantages ─────────────────────────────── */}
        <div>
          <p style={{ color: theme.yellow, fontSize: "13px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
            Espace membre
          </p>
          <h1 style={{ color: "#fff", fontSize: "60px", fontWeight: 400, lineHeight: 1.05, marginBottom: "14px", fontFamily: '"Permanent Marker", "Raleway", Arial, sans-serif' }}>
            Content de te revoir
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "17px", lineHeight: 1.55, maxWidth: "460px", marginBottom: "32px" }}>
            Connecte-toi pour parier sur les matchs, suivre tes pronostics et défier les autres fans.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {AVANTAGES.map(({ icone: Icone, titre, texte }) => (
              <div key={titre} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{
                  width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                  backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icone size={20} color={theme.greenBright} />
                </span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px" }}>{titre}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>{texte}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Droite : carte du formulaire ─────────────────────────────── */}
        <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "34px 32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: CLAIR.texte, marginBottom: "4px" }}>Connexion</h2>
          <p style={{ fontSize: "14px", color: CLAIR.doux, marginBottom: "24px" }}>Entre ton email et ton mot de passe.</p>

          {erreur && (
            <div role="alert" style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", marginBottom: "18px",
              borderRadius: "12px", backgroundColor: "#fdecec", border: "1px solid #f6c9ca", color: "#b4161b", fontSize: "14px", fontWeight: 600,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Champ
              label="Email" icone={Mail} type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="junior@example.com" autoComplete="email"
            />
            <Champ
              label="Mot de passe" icone={Lock} type={voirMdp ? "text" : "password"} value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              droite={
                <button type="button" onClick={() => setVoirMdp(v => !v)}
                  aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", display: "flex", color: CLAIR.doux }}>
                  {voirMdp ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />

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
                ? <><Loader2 size={18} className="animate-spin" /> Connexion...</>
                : <>Se connecter <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Séparateur + lien d'inscription */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 18px" }}>
            <span style={{ flex: 1, height: "1px", backgroundColor: CLAIR.bord }} />
            <span style={{ fontSize: "12px", color: CLAIR.doux, fontWeight: 600 }}>Nouveau sur F237 ?</span>
            <span style={{ flex: 1, height: "1px", backgroundColor: CLAIR.bord }} />
          </div>

          <Link to="/register"
            className="transition-colors"
            style={{
              display: "block", textAlign: "center", padding: "13px", borderRadius: "999px",
              border: `1.5px solid ${CLAIR.vert}`, color: CLAIR.vert, fontWeight: 800, fontSize: "15px", textDecoration: "none",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#e8f3ec"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            Créer un compte · 1 000 points offerts
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;