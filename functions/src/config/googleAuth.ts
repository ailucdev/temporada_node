import { google } from "googleapis";
import * as path from "path";
import * as fs from "fs";

// Caminho absoluto para a chave da Conta de Serviço (para ambiente local)
const keyPath = path.join(__dirname, "../../secrets/service-account.json");

let authClient: any = null;

export const getGoogleAuth = () => {
  if (authClient) return authClient;

  // Se o arquivo de credenciais local existe, configuramos GOOGLE_APPLICATION_CREDENTIALS
  // para que a biblioteca GoogleAuth o detecte automaticamente.
  if (fs.existsSync(keyPath)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
  }

  // Instanciar o cliente GoogleAuth (Application Default Credentials - ADC)
  authClient = new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/calendar"
    ]
  });

  return authClient;
};
