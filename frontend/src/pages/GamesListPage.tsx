import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Game } from "../schemas/game.schema";

export function GamesListPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        setGames(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h1>Catálogo de Videojuegos</h1>
        <input
          type="text"
          placeholder="Buscar por título o género..."
          className="form-control"
          style={{ maxWidth: "300px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ marginTop: "1.5rem" }}>Cargando videojuegos...</p>
      ) : filteredGames.length === 0 ? (
        <p style={{ marginTop: "1.5rem", color: "#94a3b8" }}>
          No hay videojuegos cargados todavía.
        </p>
      ) : (
        <div className="grid">
          {filteredGames.map((game) => (
            <div key={game._id} className="card">
              <img
                src={game.coverUrl || "https://placehold.co/600x400/1e293b/94a3b8?text=Sin+Portada"}
                alt={game.title}
                className="card-img"
              />
              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge">{game.genre}</span>
                  <strong>{game.price === 0 ? "Gratis" : `$${game.price}`}</strong>
                </div>
                <h3>{game.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{game.developer}</p>
                <div style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
                  <Link to={`/games/${game._id}`} className="btn btn-primary" style={{ width: "100%" }}>
                    Ver detalle
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}