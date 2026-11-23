import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../lib/auth-client";

export function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const res = await signUp.email({ name, email, password });
        if (res.error) throw new Error(res.error.message || "Error al registrarse");
      } else {
        const res = await signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message || "Credenciales inválidas");
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "github" | "google") => {
    await signIn.social({
      provider,
      callbackURL: window.location.origin,
    });
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "420px", margin: "2rem auto", padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>

        {error && (
          <div style={{ background: "#7f1d1d", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Procesando..." : isRegister ? "Registrarme" : "Entrar"}
          </button>
        </form>

        <div style={{ margin: "1rem 0", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
          o continuá con
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="btn"
            style={{ width: "100%", background: "#ffffff", color: "#0f172a", fontWeight: 600 }}
          >
            Continuar con Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            className="btn btn-github"
            style={{ width: "100%" }}
          >
            Continuar con GitHub
          </button>
        </div>

        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.9rem", color: "#94a3b8" }}>
          {isRegister ? "¿Ya tenés cuenta?" : "¿No tenés cuenta?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontWeight: 600 }}
          >
            {isRegister ? "Iniciá sesión" : "Registrate acá"}
          </button>
        </p>
      </div>
    </div>
  );
}