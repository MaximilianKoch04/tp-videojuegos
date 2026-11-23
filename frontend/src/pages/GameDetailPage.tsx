import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Game } from "../schemas/game.schema";

export function GameDetailPage() {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/games/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setGame(data))
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="container">
        <h2>Videojuego no encontrado (404)</h2>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (!game) return <div className="container">Cargando detalle...</div>;

  return (
    <div className="container">
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: "1.5rem" }}>
        ← Volver al catálogo
      </Link>

      <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
        <img
          src={game.coverUrl || "https://placehold.co/800x400/1e293b/94a3b8?text=Sin+Portada"}
          alt={game.title}
          style={{ width: "100%", maxHeight: "320px", objectFit: "cover" }}
        />
        <div className="card-body" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span className="badge">{game.genre}</span>
            <span className="badge">{game.isMultiplayer ? "Multijugador" : "Un jugador"}</span>
          </div>
          <h1>{game.title}</h1>
          <p style={{ color: "#94a3b8" }}>Desarrollado por <strong>{game.developer}</strong></p>

          <hr style={{ borderColor: "#334155", margin: "1rem 0" }} />

          <p><strong>Precio:</strong> {game.price === 0 ? "Free-to-Play ($0)" : `$${game.price} USD`}</p>
          <p><strong>Fecha de lanzamiento:</strong> {new Date(game.releaseDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}