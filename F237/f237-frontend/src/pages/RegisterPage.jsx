// f237-frontend/src/pages/RegisterPage.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, AlertCircle, Trophy } from "lucide-react";

function RegisterPage() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    confirmer: "",
  });
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    if (form.motDePasse !== form.confirmer) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    if (form.motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
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

  const inputStyle = {
    border: "1px solid #e0e0d8",
    backgroundColor: "#fafaf8",
    fontSize: "15px",
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-black text-gray-900 mb-2" style={{ fontSize: "36px" }}>
            Inscription
          </h1>
          <p className="text-gray-500">Créez votre compte et recevez 1 000 points</p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
          style={{ backgroundColor: "#fdf9e8", border: "1px solid #f0e8a0" }}>
          <Trophy size={20} className="text-yellow-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-800" style={{ fontSize: "14px" }}>
              🎉 Bonus de bienvenue
            </p>
            <p className="text-gray-500" style={{ fontSize: "13px" }}>
              1 000 points offerts dès votre inscription !
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: "1px solid #f0f0e8" }}>
          {erreur && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <span className="text-red-600 text-sm font-medium">{erreur}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wide" style={{ fontSize: "12px" }}>
                  Nom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Tandia"
                  required
                  className="w-full px-4 py-3 rounded-xl text-gray-900 outline-none"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#1a7a3c"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0d8"}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wide" style={{ fontSize: "12px" }}>
                  Prénom
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="Junior"
                  required
                  className="w-full px-4 py-3 rounded-xl text-gray-900 outline-none"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#1a7a3c"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0d8"}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wide" style={{ fontSize: "12px" }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="junior@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-gray-900 outline-none"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#1a7a3c"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0d8"}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wide" style={{ fontSize: "12px" }}>
                Mot de passe
              </label>
              <input
                type="password"
                name="motDePasse"
                value={form.motDePasse}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-gray-900 outline-none"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#1a7a3c"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0d8"}
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wide" style={{ fontSize: "12px" }}>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmer"
                value={form.confirmer}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-gray-900 outline-none"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#1a7a3c"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0d8"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 mt-2"
              style={{ backgroundColor: "#1a7a3c", fontSize: "16px" }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Inscription...
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-5" style={{ fontSize: "14px" }}>
            Déjà un compte ?{" "}
            <Link to="/login" className="font-bold" style={{ color: "#1a7a3c" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
