import { z } from "zod";

export const createGameSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),
  developer: z.string().min(1, "El estudio desarrollador es obligatorio"),
  genre: z.string().min(1, "El género es obligatorio"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  releaseDate: z.coerce.date({ message: "Fecha de lanzamiento inválida" }),
  isMultiplayer: z.boolean().default(false),
  coverUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export const updateGameSchema = createGameSchema.partial();