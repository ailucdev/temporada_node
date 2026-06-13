import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Verificar cabeçalho Authorization (Bearer)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Verificar cabeçalho X-API-Key (para evitar interceptações do Google Frontend no Cloud Run)
  const xApiKey = req.headers["x-api-key"];
  if (!token && typeof xApiKey === "string") {
    token = xApiKey;
  }

  // 3. Verificar parâmetro de query (útil para clientes SSE/EventSource nativos)
  const queryApiKey = req.query.apiKey;
  if (!token && typeof queryApiKey === "string") {
    token = queryApiKey;
  }

  if (!token) {
    return res.status(401).json({
      status: "401",
      message: "Acesso não autorizado. Token ausente."
    });
  }

  const serverApiKey = process.env.API_KEY;

  if (!serverApiKey || token !== serverApiKey) {
    return res.status(401).json({
      status: "401",
      message: "Acesso não autorizado. Token inválido."
    });
  }

  return next();
};
