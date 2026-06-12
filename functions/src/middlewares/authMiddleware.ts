import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "401",
      message: "Acesso não autorizado. Token ausente ou inválido."
    });
  }

  const token = authHeader.split(" ")[1];
  const serverApiKey = process.env.API_KEY;

  if (!serverApiKey || token !== serverApiKey) {
    return res.status(401).json({
      status: "401",
      message: "Acesso não autorizado. Token inválido."
    });
  }

  return next();
};
