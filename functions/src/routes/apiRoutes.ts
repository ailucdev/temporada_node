import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  criarReserva,
  alterarReserva,
  cancelarReserva,
  tratarWebhookWhatsApp,
  tratarUpdatePlanilha
} from "../controllers/reservaController";
import { simularReserva } from "../controllers/simulacaoController";
import { lancarDebito } from "../controllers/financeiroController";

export const apiRoutes = Router();

// Endpoint de Status / Health Check (Livre de Autenticação)
apiRoutes.get("/status", (req, res) => {
  res.json({ status: "200", message: "API Temporada Node Online" });
});

// Middleware de Autenticação de API (Aplicado em todas as rotas abaixo)
apiRoutes.use(authMiddleware);

// POST /api/webhook/whatsapp (MacroDroid/WhatsApp)
apiRoutes.post("/webhook/whatsapp", tratarWebhookWhatsApp);

// POST /api/webhook/sheet-update (Gatilho de edição manual do Google Sheets)
apiRoutes.post("/webhook/sheet-update", tratarUpdatePlanilha);

// GET /api/simulacao (Simular datas e preços)
apiRoutes.get("/simulacao", simularReserva);

// Operações sobre Reservas (FlutterFlow)
apiRoutes.post("/reservas", criarReserva);
apiRoutes.put("/reservas/:idConsulta", alterarReserva);
apiRoutes.delete("/reservas/:idConsulta", cancelarReserva);

// Operações Financeiras
apiRoutes.post("/financeiro/debito", lancarDebito);
