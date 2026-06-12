function verificaCobertura(externalEvents, idEvento, origensEsperadas) {
  if (!origensEsperadas || !Array.isArray(origensEsperadas) || origensEsperadas.length === 0) {
    return "SEM ANÁLISE DE COBERTURA";
  }
  // confia sempre no AIRBNB
  origensEsperadas = ["airbnb"];
  const hoje = new Date();
  const origemMatch = idEvento.match(/[a-z]+$/i);
  if (!origemMatch) return "DESCOBERTA";

  const origem = origemMatch[0];
  const idSemOrigem = idEvento.slice(0, -origem.length);
  const endMillis = parseInt(idSemOrigem.slice(-13));
  const startMillis = parseInt(idSemOrigem.slice(-26, -13));
  const startEvento = new Date(startMillis);
  const endEvento = new Date(endMillis);

  const inicioVerificacao = hoje > startEvento ? hoje : startEvento;

  for (const eventoCobertura of externalEvents) {
    if (eventoCobertura.origem.toLowerCase() === "proprio") continue;
    const start = new Date(eventoCobertura.start);
    const end = new Date(eventoCobertura.end);
    if (start <= inicioVerificacao && end >= endEvento) return "COBERTA"
  }
  return `DESCOBERTA`;
}
