function ajustarJsonReservasComplementar(dadosEntrada) {
  // Decodificar caso os dados venham como string codificada
  let dados;
  try {
    if (typeof dadosEntrada === 'string') {
      let decoded = dadosEntrada;

      // Decodifica uma ou duas vezes se parecer codificado
      if (/%[0-9A-F]{2}/i.test(decoded)) {
        decoded = decodeURIComponent(decoded);
        if (/%[0-9A-F]{2}/i.test(decoded)) {
          decoded = decodeURIComponent(decoded);
        }
      }

      dados = JSON.parse(decoded);
    } else {
      dados = dadosEntrada;
    }
  } catch (e) {
    console.error('Erro ao processar dados:', e);
    return [];
  }

  // Remover duplicatas
  const vistos = new Set();
  const resultado = [];

  for (const obj of dados) {
    const chave = `${obj.idPropriedade}-${obj.periodo}-${obj.valorReserva}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);

    const { start, end } = parsePeriodo(obj.periodo);

    const valorNumerico = parseValorReserva(obj.valorReserva);

    function normalizarDataUTC(data) {
      const d = new Date(data);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }

    function parseValorReserva(valorStr) {
      if (!valorStr) return 0;

      // Decodifica %20 e similares
      let valor = decodeURIComponent(valorStr);

      // Remove tudo que não for número, vírgula, ponto ou sinal
      valor = valor.replace(/[^\d,.\-]/g, '');

      // Se tiver vírgula, assume que é decimal (padrão BR)
      if (valor.includes(',')) {
        // Remove pontos (milhar), troca vírgula por ponto
        valor = valor.replace(/\./g, '').replace(',', '.');
      }

      // Converte para float
      const valorNumerico = parseFloat(valor);

      // Retorna 0 se conversão falhar
      return isNaN(valorNumerico) ? 0 : valorNumerico;
    }

    const idEvento =
      obj.idPropriedade.toLowerCase() +
      normalizarDataUTC(start).getTime().toString() +
      normalizarDataUTC(end).getTime().toString() +
      obj.origem.toLowerCase();

    resultado.push({
      ...obj,
      valorReserva: valorNumerico,
      start,
      end,
      id: idEvento
    });
  }

  // Função para normalizar o período
  function parsePeriodo(periodoStr) {
    const meses = {
      jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
      jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11
    };

    const match = periodoStr.match(
      /(\d{1,2})(?:\s*de\s*(\w+)\.?)?\s*(?:[-–a]\s*|\s*–\s*)(\d{1,2})\s*de\s*(\w+)\.?(?:\s*de\s*(\d{4}))?/i
    );

    if (!match) return { start: null, end: null };

    const [
      _,
      diaInicio,
      mesInicioOpcional, // pode estar ausente se mês for único (ex: 4–11 de out.)
      diaFim,
      mesFim,
      anoStr
    ] = match;

    const hoje = new Date();
    const ano = anoStr ? parseInt(anoStr) : hoje.getFullYear();

    // se mês inicial estiver ausente, usa o mês final
    const mesInicio = mesInicioOpcional || mesFim;

    const mesInicioIndex = meses[mesInicio.toLowerCase()];
    const mesFimIndex = meses[mesFim.toLowerCase()];

    if (mesInicioIndex === undefined || mesFimIndex === undefined)
      return { start: null, end: null };

    const start = new Date(ano, mesInicioIndex, parseInt(diaInicio));
    const end = new Date(ano, mesFimIndex, parseInt(diaFim));

    return { start, end };
  }

  return resultado;
}