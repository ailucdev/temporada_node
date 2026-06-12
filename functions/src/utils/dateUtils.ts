/**
 * Converte string no formato "DD/MM/YYYY" para um objeto Date.
 */
export const parseDataBrasil = (dataStr: string): Date => {
  const [dia, mes, ano] = dataStr.split("/").map(Number);
  // Usar fuso local ou UTC para cálculo seguro de datas
  const date = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
  return date;
};

/**
 * Calcula a diferença em dias entre duas datas (diárias de estadia).
 */
export const calcularDiasDiferenca = (inicio: Date, fim: Date): number => {
  const inicioMs = inicio.getTime();
  const fimMs = fim.getTime();
  const diferencaMs = fimMs - inicioMs;
  
  if (diferencaMs < 0) return 0;
  
  // 1 dia em milissegundos = 24 * 60 * 60 * 1000 = 86.400.000
  const dias = Math.round(diferencaMs / 86400000);
  return dias;
};
