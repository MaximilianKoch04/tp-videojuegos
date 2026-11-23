import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { Game } from "../models/Game.js";
import { createGameSchema, updateGameSchema } from "../schemas/game.schema.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/games (Público - Listado)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
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

// POST /api/games (Solo Admin - Crear)
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const parsed = createGameSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Error de validación",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const newGame = await Game.create(parsed.data);
      res.status(201).json(newGame);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el videojuego" });
    }
  }
);

// PUT /api/games/:id (Solo Admin - Editar)
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req: Request, res: Response) => {
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
      const updatedGame = await Game.findByIdAndUpdate(id, parsed.data, {
        new: true,
        runValidators: true,
      });

      if (!updatedGame) {
        res.status(404).json({ message: "Videojuego no encontrado" });
        return;
      }

      res.json(updatedGame);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el videojuego" });
    }
  }
);

// DELETE /api/games/:id (Solo Admin - Eliminar)
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: "Videojuego no encontrado (ID inválido)" });
      return;
    }

    try {
      const deletedGame = await Game.findByIdAndDelete(id);

      if (!deletedGame) {
        res.status(404).json({ message: "Videojuego no encontrado" });
        return;
      }

      res.json({ message: "Videojuego eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el videojuego" });
    }
  }
);

export default router;