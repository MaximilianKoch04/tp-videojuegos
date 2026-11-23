import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Game } from "../models/Game.js";
import { createGameSchema, updateGameSchema } from "../schemas/game.schema.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/games (Público - Listado con búsqueda, filtros y paginación)
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.max(1, Math.min(50, parseInt(String(req.query.limit || "6"), 10)));
    const search = String(req.query.search || "").trim();
    const genre = String(req.query.genre || "").trim();
    const isMultiplayer = String(req.query.isMultiplayer || "").trim();
    const userId = String(req.query.userId || "").trim();

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { developer: { $regex: search, $options: "i" } },
      ];
    }

    if (genre) {
      filter.genre = { $regex: `^${genre}$`, $options: "i" };
    }

    if (isMultiplayer === "true" || isMultiplayer === "false") {
      filter.isMultiplayer = isMultiplayer === "true";
    }

    if (userId) {
      filter.userId = userId;
    }

    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      Game.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Game.countDocuments(filter),
    ]);

    res.json({
      data: games,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los videojuegos" });
  }
});

// GET /api/games/:id (Público - Detalle)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: "Videojuego no encontrado (ID inválido)" });
      return;
    }

    const game = await Game.findById(id);
    if (!game) {
      res.status(404).json({ message: "Videojuego no encontrado" });
      return;
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el videojuego" });
  }
});

// POST /api/games (Usuarios autenticados - Publicar juego propio)
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const parsed = createGameSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Error de validación",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const user = req.user!;
    const newGame = await Game.create({
      ...parsed.data,
      userId: user.id,
      sellerName: user.name || user.email || "Usuario",
    });
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el videojuego" });
  }
});

// PUT /api/games/:id (Dueño del registro o Admin - Editar)
router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ message: "Videojuego no encontrado (ID inválido)" });
    return;
  }

  const parsed = updateGameSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Error de validación",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const game = await Game.findById(id);
    if (!game) {
      res.status(404).json({ message: "Videojuego no encontrado" });
      return;
    }

    const user = req.user!;
    const isOwner = Boolean(game.userId && game.userId === user.id);
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "No tienes permiso para editar este videojuego" });
      return;
    }

    const updatedGame = await Game.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });

    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el videojuego" });
  }
});

// DELETE /api/games/:id (Dueño del registro o Admin - Eliminar)
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ message: "Videojuego no encontrado (ID inválido)" });
    return;
  }

  try {
    const game = await Game.findById(id);
    if (!game) {
      res.status(404).json({ message: "Videojuego no encontrado" });
      return;
    }

    const user = req.user!;
    const isOwner = Boolean(game.userId && game.userId === user.id);
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "No tienes permiso para eliminar este videojuego" });
      return;
    }

    await Game.findByIdAndDelete(id);
    res.json({ message: "Videojuego eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el videojuego" });
  }
});

export default router;