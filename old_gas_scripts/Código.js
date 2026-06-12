// CONFIGURAÇÃO DO WEBHOOK DO BACKEND FIREBASE
// Para desenvolvimento local com o emulador, substitua pela URL do ngrok/localtunnel.
// Exemplo: "https://seu-subdominio.ngrok-free.app/api/api/webhook/sheet-update"
var WEBHOOK_URL = "https://us-central1-temporada-14b29.cloudfunctions.net/api/api/webhook/sheet-update";
var API_KEY = "notria_onaicul"; // Token de autenticação estático (Bearer Token)

/**
 * Função a ser acionada por um Gatilho Instalável do tipo "Ao Editar" (On Edit).
 * Ela captura edições na planilha e envia uma notificação para o nosso backend Firebase.
 */
function aoEditar(e) {
  if (!e) return;

  try {
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();

    // Apenas monitoramos as abas Reserva e Estadia
    if (sheetName !== "Reserva" && sheetName !== "Estadia") {
      return;
    }

    var row = e.range.getRow();
    var column = e.range.getColumn();
    var value = e.value !== undefined ? e.value : e.range.getValue();

    // Ignora alterações na linha de cabeçalho (linha 1)
    if (row === 1) return;

    var payload = {
      sheetName: sheetName,
      row: row,
      column: column,
      value: value
    };

    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + API_KEY
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    console.log("Enviando webhook de edição para:", WEBHOOK_URL);
    var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    console.log("Resposta do webhook:", response.getContentText());
  } catch (error) {
    console.error("Erro ao enviar webhook de edição:", error.toString());
  }
}
