import { Link, useNavigate } from "react-router-dom";
import { useSession, signOut } from "../lib/auth-client";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        GameVault
      </Link>

      <div className="nav-links">
        <Link to="/">Catálogo</Link>

        {isAdmin && (
          <Link to="/admin" className="btn btn-secondary">
            Panel Admin
          </Link>
        )}

        {isPending ? (
          <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Cargando...</span>
        ) : session?.user ? (
          <>
            <span style={{ fontSize: "0.9rem" }}>
              Hola, <strong>{session.user.name}</strong>{" "}
              <span className={`badge ${isAdmin ? "badge-admin" : ""}`}>
                {session.user.role || "user"}
              </span>
            </span>
            <button onClick={handleLogout} className="btn btn-danger">
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Ingresar / Registrarse
          </Link>
        )}
      </div>
    </nav>
  );
}