export interface MensagemProcessada {
  comando: string | null;
  planilha: string;
  propriedade: string | null;
  propriedades: string[];
  local: string | null;
  periodo: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  nome: string | null;
  valor: string | null;
}

// Lista de propriedades do ecossistema
const PROPRIEDADES_LIST = [
  "ASB402",
  "AV22302",
  "AV80101",
  "CD112102",
  "MB06101",
  "MB06201",
  "MB07101",
  "VFB620"
];

// Lista de locais/regiões e seus prefixos correspondentes
const LOCAIS_MAPPING: { [key: string]: string } = {
  "MORRO BRANCO": "MB",
  "BEBERIBE": "MB",
  "AQUAVILLE": "AV",
  "PORTO DAS DUNAS": "AV",
  "RIO": "CD",
  "RIO DE JANEIRO": "CD",
  "LEBLON": "CD",
  "RIO QUENTE": "AS",
  "GOIAS": "AS",
  "BRASILIA": "VF",
  "SUDOESTE": "VF"
};

// Calendário estático de temporadas especiais para NLP
const PERIODOS_ESPECIAIS = [
  { nome: "REVEILLON", dataInicio: "26/12/2025", dataFim: "04/01/2026" },
  { nome: "FERIAS", dataInicio: "05/01/2026", dataFim: "01/02/2026" },
  { nome: "FEVEREIRO", dataInicio: "02/02/2026", dataFim: "13/02/2026" },
  { nome: "CARNAVAL", dataInicio: "14/02/2026", dataFim: "18/02/2026" },
  { nome: "FEVEREIRO", dataInicio: "19/02/2026", dataFim: "01/03/2026" },
  { nome: "DIA DE SAO JOSE", dataInicio: "19/03/2025", dataFim: "22/03/2026" },
  { nome: "DATA MAGNA CEARA", dataInicio: "23/03/2026", dataFim: "29/03/2026" },
  { nome: "SEMANA SANTA", dataInicio: "02/04/2026", dataFim: "05/04/2026" },
  { nome: "IMPRENSADO", dataInicio: "06/04/2026", dataFim: "09/04/2026" },
  { nome: "ANIVERSARIO FORTALEZA", dataInicio: "10/04/2026", dataFim: "13/04/2026" },
  { nome: "DIA DO TRABALHO", dataInicio: "01/05/2026", dataFim: "03/05/2026" },
  { nome: "CORPUS CHRISTI", dataInicio: "04/06/2026", dataFim: "07/06/2026" },
  { nome: "SAO JOAO", dataInicio: "19/06/2026", dataFim: "23/06/2026" },
  { nome: "FERIAS", dataInicio: "26/06/2026", dataFim: "02/08/2026" },
  { nome: "N SRA ASSUNCAO", dataInicio: "14/08/2026", dataFim: "16/08/2026" },
  { nome: "SEMANA DA PATRIA", dataInicio: "04/09/2026", dataFim: "07/09/2026" },
  { nome: "DIA DAS CRIANCAS", dataInicio: "09/10/2026", dataFim: "12/10/2026" },
  { nome: "N SRA APARECIDA DIA DO PROFESSOR", dataInicio: "15/10/2026", dataFim: "18/10/2026" },
  { nome: "DIA DO SERVIDOR PUBLICO", dataInicio: "28/10/2026", dataFim: "01/11/2026" },
  { nome: "PROCLAMACAO DA REPUBLICA", dataInicio: "15/11/2026", dataFim: "15/11/2026" },
  { nome: "CONSCIENCIA NEGRA", dataInicio: "20/11/2026", dataFim: "23/11/2026" },
  { nome: "TODOS OS SANTOS FINADOS", dataInicio: "30/11/2026", dataFim: "02/12/2026" },
  { nome: "NATAL", dataInicio: "18/12/2026", dataFim: "27/12/2026" },
  { nome: "REVEILLON", dataInicio: "28/12/2026", dataFim: "04/01/2027" },
  { nome: "FERIAS", dataInicio: "05/01/2027", dataFim: "02/02/2027" },
  { nome: "CARNAVAL", dataInicio: "05/02/2027", dataFim: "11/02/2027" }
];

const COMANDOS_MAP: { [key: string]: string[] } = {
  LISTAR: ["LISTAR", "LISTE", "MOSTRAR", "MOSTRE", "EXIBIR", "EXIBA", "RESERVAS", "ESTADIAS"],
  SIMULAR: ["SIMULAR", "SIMULE", "CONSULTE", "CONSULTAR", "CONSULTA", "COTAR", "COTACAO", "VEJA", "VER", "DISPONIBILIDADE", "DISPONIVEIS"],
  SINCRONIZAR: ["SINCRONIZAR", "SINCRONIZE", "ATUALIZAR", "ATUALIZE"],
  RESERVAR: ["RESERVAR", "RESERVE", "ALUGAR", "ALUGUE"],
  CANCELAR: ["CANCELAR", "CANCELE"],
  ALTERAR: ["ALTERAR", "ALTERE", "MUDAR", "MUDE"]
};

const PLANILHAS_MAP: { [key: string]: string } = {
  RESERVAS: "Reserva",
  RESERVA: "Reserva",
  ESTADIAS: "Estadia",
  ESTADIA: "Estadia",
  PROPRIEDADES: "Propriedade",
  PROPRIEDADE: "Propriedade"
};

export interface PeriodoSazonal {
  local: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
}

/**
 * Traduz mensagem do WhatsApp para payload estruturado usando Regex.
 */
export const processaMensagemZap = (
  texto: string,
  propriedadesList: string[] = PROPRIEDADES_LIST,
  temporadasList: PeriodoSazonal[] = []
): MensagemProcessada => {
  const dados: MensagemProcessada = {
    comando: null,
    planilha: "Reserva",
    propriedade: null,
    propriedades: [],
    local: null,
    periodo: null,
    dataInicio: null,
    dataFim: null,
    nome: null,
    valor: null
  };

  // Normalizar texto (remover acentos e colocar em maiúsculas)
  const msg = texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 1. Extração do Comando
  let comandoEncontrado = false;
  for (const comando in COMANDOS_MAP) {
    if (comandoEncontrado) break;
    for (const sinonimo of COMANDOS_MAP[comando]) {
      const regex = new RegExp(`\\b${sinonimo}\\b`);
      if (regex.test(msg)) {
        dados.comando = comando;
        dados.planilha = PLANILHAS_MAP[sinonimo] || "Reserva";
        comandoEncontrado = true;
        break;
      }
    }
  }

  // 2. Extração da Propriedade
  const regexPropriedade = new RegExp(`\\bHeader\\b|\\b(?:${propriedadesList.join("|")})\\b`);
  const matchProp = msg.match(regexPropriedade);
  if (matchProp) {
    dados.propriedade = matchProp[0];
  }

  // 3. Extração do Local/Região
  const localEncontrado = Object.keys(LOCAIS_MAPPING)
    .sort((a, b) => b.length - a.length)
    .find((local) => msg.includes(local));

  if (localEncontrado) {
    dados.local = localEncontrado;
    const prefixo = LOCAIS_MAPPING[localEncontrado];
    dados.propriedades = propriedadesList.filter((prop) => prop.startsWith(prefixo));
    if (!dados.propriedade) {
      dados.propriedade = dados.propriedades[0];
    }
  }

  // 4. Extração de Períodos
  const periodoInformado = extrairPeriodoTexto(msg);
  if (periodoInformado) {
    dados.dataInicio = periodoInformado.dataInicio;
    dados.dataFim = periodoInformado.dataFim;
  } else {
    // Busca por feriado/evento mapeado dinamicamente ou estaticamente
    const localPrefix = dados.propriedade ? dados.propriedade.substring(0, 2) : (dados.local ? LOCAIS_MAPPING[dados.local] : null);
    const evento = extrairEventoDinamico(msg, temporadasList, localPrefix);
    if (evento) {
      dados.periodo = evento.nome;
      dados.dataInicio = evento.dataInicio;
      dados.dataFim = evento.dataFim;
    }
  }

  console.log("Processamento NLP WhatsApp (Dinâmico):", { texto, dados });
  return dados;
};

/**
 * Auxiliar para extrair intervalo numérico ou textual de datas.
 */
function extrairPeriodoTexto(msg: string): { dataInicio: string; dataFim: string } | null {
  const meses: { [key: string]: number } = {
    JANEIRO: 1, FEVEREIRO: 2, MARCO: 3, ABRIL: 4, MAIO: 5, JUNHO: 6,
    JULHO: 7, AGOSTO: 8, SETEMBRO: 9, OUTUBRO: 10, NOVEMBRO: 11, DEZEMBRO: 12
  };

  let diaInicio: number | null = null;
  let diaFim: number | null = null;
  let mes: number | null = null;
  let ano: number | null = null;

  // Regex para formato: "19 A 21 DE JUNHO"
  const extenso = msg.match(
    /(\d{1,2})\s*A\s*(\d{1,2})[\s\/]*(?:DE\s+)?(JANEIRO|FEVEREIRO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)(?:[\s\/]*(?:DE\s+)?(\d{4}))?/i
  );

  if (extenso) {
    diaInicio = Number(extenso[1]);
    diaFim = Number(extenso[2]);
    mes = meses[extenso[3]];
    ano = extenso[4] ? Number(extenso[4]) : null;
  } else {
    // Regex para formato: "19 A 21/06" ou "19 A 21/06/2027"
    const numerico1 = msg.match(/(\d{1,2})\s*A\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/i);
    if (numerico1) {
      diaInicio = Number(numerico1[1]);
      diaFim = Number(numerico1[2]);
      mes = Number(numerico1[3]);
      ano = numerico1[4] ? Number(numerico1[4]) : null;
    } else {
      // Regex para formato: "19/06 A 21/06"
      const numerico2 = msg.match(
        /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\s*A\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/i
      );
      if (numerico2) {
        diaInicio = Number(numerico2[1]);
        mes = Number(numerico2[2]);
        diaFim = Number(numerico2[4]);
        if (Number(numerico2[5]) !== mes) {
          return null; // Mapeia períodos dentro do mesmo mês
        }
        ano = numerico2[3] ? Number(numerico2[3]) : null;
      }
    }
  }

  if (!diaInicio || !diaFim || !mes) return null;

  if (!ano) {
    const hoje = new Date();
    ano = hoje.getFullYear();
    const dataTeste = new Date(ano, mes - 1, diaInicio);
    if (dataTeste < hoje) {
      ano++;
    }
  }

  return {
    dataInicio: `${String(diaInicio).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`,
    dataFim: `${String(diaFim).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`
  };
}

function extrairEventoDinamico(
  msg: string,
  temporadasList: PeriodoSazonal[],
  localPrefix: string | null
): { nome: string; dataInicio: string; dataFim: string } | null {
  // 1. Filtrar temporadas válidas para o local se o prefixo for identificado
  let temporadasFiltradas = temporadasList;
  if (localPrefix) {
    temporadasFiltradas = temporadasList.filter(
      (t) => t.local.toUpperCase() === localPrefix.toUpperCase()
    );
  }

  // 2. Procurar na lista filtrada
  for (const evento of temporadasFiltradas) {
    const nomeEvento = evento.nome
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (msg.includes(nomeEvento)) {
      return {
        nome: evento.nome,
        dataInicio: evento.dataInicio,
        dataFim: evento.dataFim
      };
    }
  }

  // 3. Fallback: Se não encontrou usando o localPrefix, procura em todas as temporadas passadas
  if (localPrefix && temporadasFiltradas.length < temporadasList.length) {
    for (const evento of temporadasList) {
      const nomeEvento = evento.nome
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (msg.includes(nomeEvento)) {
        return {
          nome: evento.nome,
          dataInicio: evento.dataInicio,
          dataFim: evento.dataFim
        };
      }
    }
  }

  // 4. Fallback final: Se temporadasList estiver vazio ou não encontrar, usa o calendário estático legado
  for (const evento of PERIODOS_ESPECIAIS) {
    const nomeEvento = evento.nome
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (msg.includes(nomeEvento)) {
      return evento;
    }
  }

  return null;
}

/**
 * Formata os retornos de sucesso/erro da API para texto humanizado do WhatsApp.
 */
export const montaRetornoZap = (comando: string | null, result: any): string => {
  if (result.status !== "200") {
    return `❌ Erro: ${result.message || "Operação mal-sucedida"}`;
  }

  const data = result.data;

  switch (comando) {
    case "LISTAR": {
      const nomeAba = Object.keys(data).find((k) => k !== "Totais") || "Reserva";
      const registros = data[nomeAba] || [];
      if (registros.length === 0) return `🗓️ ${nomeAba}s: Nenhuma entrada encontrada.`;
      
      let texto = `🗓️ ${nomeAba}s:\n`;
      registros.forEach((r: any) => {
        texto += `\n👤 ${r.nomeInteressado}\n📅 ${r.entrada} a ${r.saida} 💰 R$ ${r.valorLocacao}`;
      });
      return texto.trim();
    }
    case "SIMULAR": {
      const res = result.Resultado;
      return `🏠 Imóvel: ${res.idPropriedade || "N/A"}\n📅 Período: ${res.dataEntrada} a ${res.dataSaida}\n🌙 Diárias: ${res.diasReserva || 0}\n💰 Tarifa: R$ ${res.valor || 0}\n✅ Disponível para reserva.`.trim();
    }
    case "RESERVAR": {
      const res = result.data || result;
      return `✅ Reserva confirmada!\n🏠 Imóvel: ${res.idPropriedade}\n👤 Hóspede: ${res.nomeInteressado}\n📅 Período: ${res.entrada} a ${res.saida}\n💰 Valor: R$ ${res.valorLocacao}\n🆔 ID da Reserva: ${res.idConsulta}`.trim();
    }
    case "CANCELAR": {
      const res = result.data || result;
      return `❌ Reserva cancelada!\n🏠 Imóvel: ${res.idPropriedade}\n👤 Hóspede: ${res.nomeInteressado || "N/A"}\n📅 Período: ${res.entrada} a ${res.saida}\n🆔 ID: ${res.idConsulta}`.trim();
    }
    case "SOMAR": {
      if (!data.Totais || data.Totais.length === 0) {
        return "📊 Nenhum faturamento calculado.";
      }
      let texto = "📊 RESUMO FINANCEIRO\n\n";
      data.Totais.forEach((t: any) => {
        texto += `🏠 Imóvel: ${t.idPropriedade}\n`;
        if (t.Reservas !== undefined) texto += `📅 Reservas Ativas: ${t.Reservas}\n`;
        if (t.Estadias !== undefined) texto += `🛏️ Estadias Finalizadas: ${t.Estadias}\n`;
        texto += `🌙 Diárias Totais: ${t.Diarias}\n`;
        texto += `💰 Valor Faturado: R$ ${t.Valor.toFixed(2)}\n`;
        texto += `💵 Valor Recebido: R$ ${t.Pago.toFixed(2)}\n\n`;
      });
      return texto.trim();
    }
    default:
      return result.message || "Operação realizada com sucesso.";
  }
};
