import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../lib/auth-client";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="container">Verificando permisos...</div>;
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.role !== "admin") {
    return (
      <div className="container">
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Acceso denegado (403)</h2>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
            No tenés permisos de administrador para ver esta sección.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}