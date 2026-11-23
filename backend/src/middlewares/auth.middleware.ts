import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";

// Extendemos el tipo Request de Express para guardar el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role?: string | null;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      res.status(401).json({ message: "No autenticado. Iniciá sesión primero." });
      return;
    }

    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Sesión inválida o expirada." });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "No autenticado." });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        message: `Acceso denegado. Se requiere rol '${role}'.`,
      });
      return;
    }

    next();
  };
};