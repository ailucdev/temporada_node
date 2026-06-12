import { google } from "googleapis";
import * as path from "path";
import * as fs from "fs";

// Caminho absoluto para a chave da Conta de Serviço (para ambiente local)
const keyPath = path.join(__dirname, "../../secrets/service-account.json");

let authClient: any = null;

export const getGoogleAuth = () => {
  if (authClient) return authClient;

  if (fs.existsSync(keyPath)) {
    // Localmente usamos JWT para evitar o erro 403 de Service Usage/Quota Project
    const credentials = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    authClient = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/calendar"
      ]
    );
  } else {
    // Em produção usamos GoogleAuth (Application Default Credentials - ADC)
    authClient = new google.auth.GoogleAuth({
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/calendar"
      ]
    });
  }

  return authClient;
};
