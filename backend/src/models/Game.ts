import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  title: string;
  developer: string;
  genre: string;
  price: number;
  releaseDate: Date;
  isMultiplayer: boolean;
  coverUrl?: string;
}

const gameSchema = new Schema<IGame>(
  {
    title: { type: String, required: true, trim: true },
    developer: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    releaseDate: { type: Date, required: true },
    isMultiplayer: { type: Boolean, default: false },
    coverUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Game = mongoose.model<IGame>("Game", gameSchema);