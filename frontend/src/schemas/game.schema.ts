import { z } from "zod";

export interface Game {
  _id: string;
  title: string;
  developer: string;
  genre: string;
  price: number;
  releaseDate: string;
  isMultiplayer: boolean;
  coverUrl?: string;
  userId?: string;
  sellerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const gameFormSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  developer: z.string().min(2, "El desarrollador es obligatorio"),
  genre: z.string().min(2, "El género es obligatorio"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  releaseDate: z.string().min(1, "La fecha de lanzamiento es obligatoria"),
  isMultiplayer: z.boolean().default(false),
  coverUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export type GameFormData = z.infer<typeof gameFormSchema>;