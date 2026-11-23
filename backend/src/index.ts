import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { connectDB } from "./config/db.js";
import { auth } from "./config/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. CORS: fundamental credentials: true para que viajen las cookies de sesión de Better Auth
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// 2. Rutas de Better Auth (IMPORTANTE: van ANTES de express.json())
app.all("/api/auth/*splat", toNodeHandler(auth));

// 3. Parseo de JSON para el resto de nuestras rutas
app.use(express.json());

// Ruta de prueba rápida
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "API de Videojuegos funcionando" });
});

// Arrancar servidor después de conectar a Mongo
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
});