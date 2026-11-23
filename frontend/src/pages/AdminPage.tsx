import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gameFormSchema } from "../schemas/game.schema";
import type { Game, GameFormData } from "../schemas/game.schema";

export function AdminPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: "",
      developer: "",
      genre: "",
      price: 0,
      releaseDate: "",
      isMultiplayer: false,
      coverUrl: "",
    },
  });

  const loadGames = async () => {
    const res = await fetch("/api/games");
    const data = await res.json();
    setGames(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadGames();
  }, []);

  const onSubmit = async (data: GameFormData) => {
    setServerError("");
    const url = editingId ? `/api/games/${editingId}` : "/api/games";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setServerError(err.message || "Error al guardar el videojuego");
      return;
    }

    setEditingId(null);
    reset({
      title: "",
      developer: "",
      genre: "",
      price: 0,
      releaseDate: "",
      isMultiplayer: false,
      coverUrl: "",
    });
    loadGames();
  };

  const handleEdit = (game: Game) => {
    setEditingId(game._id);
    reset({
      title: game.title,
      developer: game.developer,
      genre: game.genre,
      price: game.price,
      releaseDate: game.releaseDate.split("T")[0],
      isMultiplayer: game.isMultiplayer,
      coverUrl: game.coverUrl || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este videojuego?")) return;

    const res = await fetch(`/api/games/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      loadGames();
    }
  };

  return (
    <div className="container">
      <h1>Panel de Administración - Videojuegos</h1>

      <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>
          {editingId ? "Editar Videojuego" : "Agregar Nuevo Videojuego"}
        </h3>

        {serverError && <p className="error-text" style={{ marginBottom: "1rem" }}>{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div className="form-group">
              <label>Título</label>
              <input {...register("title")} className="form-control" />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            <div className="form-group">
              <label>Desarrollador</label>
              <input {...register("developer")} className="form-control" />
              {errors.developer && <p className="error-text">{errors.developer.message}</p>}
            </div>

            <div className="form-group">
              <label>Género</label>
              <input {...register("genre")} className="form-control" />
              {errors.genre && <p className="error-text">{errors.genre.message}</p>}
            </div>

            <div className="form-group">
              <label>Precio (USD)</label>
              <input type="number" step="0.01" {...register("price")} className="form-control" />
              {errors.price && <p className="error-text">{errors.price.message}</p>}
            </div>

            <div className="form-group">
              <label>Fecha de lanzamiento</label>
              <input type="date" {...register("releaseDate")} className="form-control" />
              {errors.releaseDate && <p className="error-text">{errors.releaseDate.message}</p>}
            </div>

            <div className="form-group">
              <label>URL de Portada (opcional)</label>
              <input {...register("coverUrl")} className="form-control" placeholder="https://..." />
              {errors.coverUrl && <p className="error-text">{errors.coverUrl.message}</p>}
            </div>
          </div>

          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" id="isMultiplayer" {...register("isMultiplayer")} />
            <label htmlFor="isMultiplayer" style={{ marginBottom: 0 }}>¿Tiene modo multijugador?</label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {editingId ? "Guardar cambios" : "Crear videojuego"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  reset();
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Género</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game._id}>
                <td>{game.title}</td>
                <td>{game.genre}</td>
                <td>${game.price}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleEdit(game)} className="btn btn-secondary">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(game._id)} className="btn btn-danger">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}