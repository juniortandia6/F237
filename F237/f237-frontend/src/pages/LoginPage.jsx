// f237-frontend/src/pages/LoginPage.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
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
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-black text-gray-900 mb-2" style={{ fontSize: "36px" }}>
            Connexion
          </h1>
          <p className="text-gray-500">Connectez-vous pour parier sur les matchs</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: "1px solid #f0f0e8" }}>
          {erreur && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <span className="text-red-600 text-sm font-medium">{erreur}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide" style={{ fontSize: "12px" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="junior@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-gray-900 outline-none transition-all"
                style={{ border: "1px solid #e0e0d8", backgroundColor: "#fafaf8", fontSize: "15px" }}
                onFocus={(e) => e.target.style.borderColor = "#1a7a3c"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0d8"}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide" style={{ fontSize: "12px" }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-gray-900 outline-none transition-all"
                style={{ border: "1px solid #e0e0d8", backgroundColor: "#fafaf8", fontSize: "15px" }}
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
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-5" style={{ fontSize: "14px" }}>
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-bold" style={{ color: "#1a7a3c" }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
