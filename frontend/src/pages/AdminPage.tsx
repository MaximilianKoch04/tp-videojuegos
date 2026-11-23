import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient, useSession } from "../lib/auth-client";
import { gameFormSchema } from "../schemas/game.schema";
import type { Game, GameFormData } from "../schemas/game.schema";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export function AdminPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const [roleMessage, setRoleMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
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
    if (!session?.user) return;
    const params = new URLSearchParams({ limit: "50" });
    // Si no es admin, trae únicamente sus propios juegos
    if (!isAdmin) {
      params.set("userId", session.user.id);
    }
    const res = await fetch(`/api/games?${params.toString()}`);
    const resData = await res.json();
    setGames(Array.isArray(resData.data) ? resData.data : []);
  };

  const loadUsers = async () => {
    if (!isAdmin) return;
    const res = await authClient.admin.listUsers({ query: { limit: 50 } });
    if (res.data?.users) {
      setUsers(res.data.users as AppUser[]);
    }
  };

  useEffect(() => {
    loadGames();
    if (isAdmin) {
      loadUsers();
    }
  }, [session?.user?.id, isAdmin]);

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

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    setRoleMessage("");
    const res = await authClient.admin.setRole({
      userId,
      role: newRole,
    });

    if (res.error) {
      setRoleMessage(`Error: ${res.error.message}`);
      return;
    }

    setRoleMessage("Rol actualizado correctamente.");
    loadUsers();
  };

  return (
    <div className="container">
      <h1>{isAdmin ? "Panel de Administración" : "Mis Publicaciones"}</h1>

      {/* Formulario CRUD de Videojuegos */}
      <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>
          {editingId ? "Editar Videojuego" : "Publicar Nuevo Videojuego"}
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
              {editingId ? "Guardar cambios" : "Publicar videojuego"}
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

      {/* Tabla de Juegos (Propios para user, Todos para admin) */}
      <h3 style={{ marginTop: "2rem", marginBottom: "0.75rem" }}>
        {isAdmin ? "Todos los videojuegos del Marketplace" : "Mis videojuegos publicados"}
      </h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Género</th>
              <th>Precio</th>
              {isAdmin && <th>Vendedor</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game._id}>
                <td>{game.title}</td>
                <td>{game.genre}</td>
                <td>${game.price}</td>
                {isAdmin && <td>{game.sellerName || "Tienda Oficial"}</td>}
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

      {/* Gestión de Roles de Usuarios (Solo visible para Admin) */}
      {isAdmin && (
        <div style={{ marginTop: "2.5rem" }}>
          <h3>Gestión de Usuarios y Roles</h3>
          {roleMessage && <p style={{ color: "#34d399", marginTop: "0.5rem" }}>{roleMessage}</p>}
          <div className="table-wrapper" style={{ marginTop: "0.75rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol actual</th>
                  <th>Cambiar Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge">{u.role || "user"}</span>
                    </td>
                    <td>
                      {u.id === session?.user?.id ? (
                        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Tu cuenta</span>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          onClick={() =>
                            handleRoleChange(u.id, u.role === "admin" ? "user" : "admin")
                          }
                        >
                          Hacer {u.role === "admin" ? "User" : "Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}