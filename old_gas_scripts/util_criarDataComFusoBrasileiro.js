function criarDataComFusoBrasileiro(dia, mes, ano) {
  // Gera a data no fuso do Brasil (UTC-3) às 03:00 da manhã para evitar problemas de transição
  return new Date(Date.UTC(ano, mes - 1, dia, 3));
}

