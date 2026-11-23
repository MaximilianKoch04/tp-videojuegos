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
}

export const gameFormSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),
  developer: z.string().min(1, "El desarrollador es obligatorio"),
  genre: z.string().min(1, "El género es obligatorio"),
  price: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? NaN : Number(val)),
    z.number({ message: "Ingresá un número válido" }).min(0, "El precio no puede ser negativo")
  ),
  releaseDate: z.string().min(1, "La fecha de lanzamiento es obligatoria"),
  isMultiplayer: z.boolean(),
  coverUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export type GameFormData = z.infer<typeof gameFormSchema>;