import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../lib/auth-client";
import type { Game } from "../schemas/game.schema";

export function GamesListPage() {
  const { data: session } = useSession();
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "6",
    });

    if (search.trim()) params.set("search", search.trim());
    if (genre.trim()) params.set("genre", genre.trim());
    if (onlyMine && session?.user?.id) params.set("userId", session.user.id);

    fetch(`/api/games?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        setGames(Array.isArray(resData.data) ? resData.data : []);
        setTotalPages(resData.pagination?.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, genre, onlyMine, session?.user?.id]);

  // Al cambiar cualquier filtro, volvemos a la página 1
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleGenreChange = (value: string) => {
    setGenre(value);
    setPage(1);
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h1>Marketplace de Videojuegos</h1>
        {session?.user && (
          <Link to="/admin" className="btn btn-primary">
            + Publicar / Mis Juegos
          </Link>
        )}
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div
        className="card"
        style={{
          padding: "1rem",
          marginTop: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Buscar por título o desarrollador..."
          className="form-control"
          style={{ flex: "1 1 220px" }}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <input
          type="text"
          placeholder="Filtrar por género (ej. RPG, Acción)..."
          className="form-control"
          style={{ flex: "1 1 200px" }}
          value={genre}
          onChange={(e) => handleGenreChange(e.target.value)}
        />

        {session?.user && (
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => {
                setOnlyMine(e.target.checked);
                setPage(1);
              }}
            />
            Solo mis juegos
          </label>
        )}
      </div>

      {loading ? (
        <p style={{ marginTop: "1.5rem" }}>Cargando videojuegos...</p>
      ) : games.length === 0 ? (
        <p style={{ marginTop: "1.5rem", color: "#94a3b8" }}>
          No se encontraron videojuegos con esos filtros.
        </p>
      ) : (
        <>
          <div className="grid">
            {games.map((game) => (
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
                  <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                    Publicado por: <strong>{game.sellerName || "Tienda Oficial"}</strong>
                  </p>
                  <div style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
                    <Link to={`/games/${game._id}`} className="btn btn-primary" style={{ width: "100%" }}>
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem" }}>
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Anterior
              </button>
              <span style={{ color: "#94a3b8" }}>
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
              </span>
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}