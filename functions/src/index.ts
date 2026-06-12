import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRoutes } from "./routes/apiRoutes";

// Carregar variáveis de ambiente locais
dotenv.config();

const app = express();

// Configurações Globais de Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Roteador Principal da API
app.use("/", apiRoutes);

// Fallback de Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ status: "404", message: "Rota não encontrada" });
});

// Exporta o Express como Firebase Cloud Function com conta de serviço explícita
export const api = functions.runWith({
  serviceAccount: "temporada-service-account@temporada-14b29.iam.gserviceaccount.com"
}).https.onRequest(app);
