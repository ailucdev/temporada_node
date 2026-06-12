function processaMensagemZap(texto, propriedades, periodos) {

  //   texto = " .. simule rio quente natal";

  const dados = {
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

  const comandos = {
    LISTAR: [
      "LISTAR",
      "LISTE",
      "MOSTRAR",
      "MOSTRE",
      "EXIBIR",
      "EXIBA",
      "RESERVAS",
      "ESTADIAS",
    ],
    SIMULAR: [
      "SIMULAR",
      "SIMULE",
      "CONSULTE",
      "CONSULTAR",
      "CONSULTA",
      "COTAR",
      "COTACAO",
      "VEJA",
      "VER",
      "DISPONIBILIDADE",
      "DISPONIVEIS",
    ],
    SINCRONIZAR: [
      "SINCRONIZAR",
      "SINCRONIZE",
      "ATUALIZAR",
      "ATUALIZE"
    ],
    RESERVAR: [
      "RESERVAR",
      "RESERVE",
      "ALUGAR",
      "ALUGUE"
    ],
    CANCELAR: [
      "CANCELAR",
      "CANCELE"
    ],
    ALTERAR: [
      "ALTERAR",
      "ALTERE",
      "MUDAR",
      "MUDE"
    ],
  };

  propriedades = [
    'ASB402',
    'AV22302',
    'AV80101',
    'CD112102',
    'MB06101',
    'MB06201',
    'MB07101',
    'VFB620'
  ]
  periodos = [
    {
      nome: "REVEILLON",
      dataInicio: "26/12/2025",
      dataFim: "04/01/2026"
    },
    {
      nome: "FERIAS",
      dataInicio: "05/01/2026",
      dataFim: "01/02/2026"
    },
    {
      nome: "FEVEREIRO",
      dataInicio: "02/02/2026",
      dataFim: "13/02/2026"
    },
    {
      nome: "CARNAVAL",
      dataInicio: "14/02/2026",
      dataFim: "18/02/2026"
    },
    {
      nome: "FEVEREIRO",
      dataInicio: "19/02/2026",
      dataFim: "01/03/2026"
    },
    {
      nome: "DIA DE SAO JOSE",
      dataInicio: "19/03/2025",
      dataFim: "22/03/2026"
    },
    {
      nome: "DATA MAGNA CEARA",
      dataInicio: "23/03/2026",
      dataFim: "29/03/2026"
    },
    {
      nome: "SEMANA SANTA",
      dataInicio: "02/04/2026",
      dataFim: "05/04/2026"
    },
    {
      nome: "IMPRENSADO",
      dataInicio: "06/04/2026",
      dataFim: "09/04/2026"
    },
    {
      nome: "ANIVERSARIO FORTALEZA",
      dataInicio: "10/04/2026",
      dataFim: "13/04/2026"
    },
    {
      nome: "DIA DO TRABALHO",
      dataInicio: "01/05/2026",
      dataFim: "03/05/2026"
    },
    {
      nome: "CORPUS CHRISTI",
      dataInicio: "04/06/2026",
      dataFim: "07/06/2026"
    },
    {
      nome: "SAO JOAO",
      dataInicio: "19/06/2026",
      dataFim: "23/06/2026"
    },
    {
      nome: "FERIAS",
      dataInicio: "26/06/2026",
      dataFim: "02/08/2026"
    },
    {
      nome: "N SRA ASSUNCAO",
      dataInicio: "14/08/2026",
      dataFim: "16/08/2026"
    },
    {
      nome: "SEMANA DA PATRIA",
      dataInicio: "04/09/2026",
      dataFim: "07/09/2026"
    },
    {
      nome: "DIA DAS CRIANCAS",
      dataInicio: "09/10/2026",
      dataFim: "12/10/2026"
    },
    {
      nome: "N SRA APARECIDA DIA DO PROFESSOR",
      dataInicio: "15/10/2026",
      dataFim: "18/10/2026"
    },
    {
      nome: "DIA DO SERVIDOR PUBLICO",
      dataInicio: "28/10/2026",
      dataFim: "01/11/2026"
    },
    {
      nome: "PROCLAMACAO DA REPUBLICA",
      dataInicio: "15/11/2026",
      dataFim: "15/11/2026"
    },
    {
      nome: "CONSCIENCIA NEGRA",
      dataInicio: "20/11/2026",
      dataFim: "23/11/2026"
    },
    {
      nome: "TODOS OS SANTOS FINADOS",
      dataInicio: "30/11/2026",
      dataFim: "02/12/2026"
    },
    {
      nome: "NATAL",
      dataInicio: "18/12/2026",
      dataFim: "27/12/2026"
    },
    {
      nome: "REVEILLON",
      dataInicio: "28/12/2026",
      dataFim: "04/01/2027"
    },
    {
      nome: "FERIAS",
      dataInicio: "05/01/2027",
      dataFim: "02/02/2027"
    },
    {
      nome: "CARNAVAL",
      dataInicio: "05/02/2027",
      dataFim: "11/02/2027"
    }
  ];

  const locais = {
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

  // Normaliza texto
  const msg = texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // ==========================
  // COMANDO
  // ==========================

  const resultadoComando =
    extrairComando(msg, comandos);

  if (resultadoComando) {
    dados.comando =
      resultadoComando.comando;
    if (resultadoComando.planilha) {
      dados.planilha =
        resultadoComando.planilha;
    }
  }

  // ==========================
  // PROPRIEDADE
  // ==========================
  const regexPropriedade =
    new RegExp(`\\b(?:${propriedades.join('|')})\\b`);

  dados.propriedade =
    msg.match(regexPropriedade)?.[0] || null;

  const localEncontrado = Object.keys(locais)
    .sort((a, b) => b.length - a.length)
    .find(local => msg.includes(local));

  if (localEncontrado) {

    dados.local = localEncontrado;

    const prefixo = locais[localEncontrado];

    dados.propriedades = propriedades.filter(
      prop => prop.startsWith(prefixo)
    );

    if (!dados.propriedade) dados.propriedade = dados.propriedades[0];

  }

  // ==========================
  // PERÍODO INFORMADO PELO USUÁRIO
  // TEM PRIORIDADE SOBRE EVENTOS
  // ==========================
  const periodoInformado = extrairPeriodo(msg);

  if (periodoInformado) {

    dados.dataInicio = periodoInformado.dataInicio;
    dados.dataFim = periodoInformado.dataFim;

  } else {

    // ==========================
    // EVENTO / FERIADO
    // ==========================
    const evento = extrairEvento(msg, periodos);

    if (evento) {

      dados.periodo = evento.nome;
      dados.dataInicio = evento.dataInicio;
      dados.dataFim = evento.dataFim;

    }

  }
  console.log(texto)
  console.log("JSON Dados = " + JSON.stringify(dados));
  return JSON.stringify(dados);
}

function extrairComando(msg, comandos) {
  const planilhas = {
    RESERVAS: "Reserva",
    RESERVA: "Reserva",
    ESTADIAS: "Estadia",
    ESTADIA: "Estadia",
    PROPRIEDADES: "Propriedade",
    PROPRIEDADE: "Propriedade"
  };

  for (const comando in comandos) {
    for (const sinonimo of comandos[comando]) {
      const regex =
        new RegExp(`\\b${sinonimo}\\b`);
      if (regex.test(msg)) {
        return {
          comando: comando,
          planilha: planilhas[sinonimo] || null,
          sinonimo: sinonimo
        };
      }
    }
  }
  return null;
}

function extrairPeriodo(texto) {

  const msg = texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const meses = {
    JANEIRO: 1,
    FEVEREIRO: 2,
    MARCO: 3,
    ABRIL: 4,
    MAIO: 5,
    JUNHO: 6,
    JULHO: 7,
    AGOSTO: 8,
    SETEMBRO: 9,
    OUTUBRO: 10,
    NOVEMBRO: 11,
    DEZEMBRO: 12
  };

  let diaInicio;
  let diaFim;
  let mes;
  let ano;

  // ==========================
  // 19 A 21 DE JUNHO
  // 19 A 21 JUNHO
  // 19 A 21/JUNHO
  // 19 A 21/JUNHO/2027
  // ==========================

  const extenso = msg.match(
    /(\d{1,2})\s*A\s*(\d{1,2})[\s\/]*(?:DE\s+)?(JANEIRO|FEVEREIRO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)(?:[\s\/]*(?:DE\s+)?(\d{4}))?/i
  );

  if (extenso) {

    diaInicio = Number(extenso[1]);
    diaFim = Number(extenso[2]);
    mes = meses[extenso[3]];
    ano = extenso[4] ? Number(extenso[4]) : null;

  } else {

    // ==========================
    // 19 A 21/06
    // 19 A 21/06/2027
    // ==========================
    const numerico1 =
      msg.match(
        /(\d{1,2})\s*A\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/i
      );

    if (numerico1) {

      diaInicio = Number(numerico1[1]);
      diaFim = Number(numerico1[2]);
      mes = Number(numerico1[3]);
      ano = numerico1[4] ? Number(numerico1[4]) : null;

    } else {

      // ==========================
      // 19/06 A 21/06
      // 19/06/2027 A 21/06/2027
      // ==========================
      const numerico2 =
        msg.match(
          /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\s*A\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/i
        );
      if (numerico2) {

        diaInicio = Number(numerico2[1]);
        mes = Number(numerico2[2]);

        diaFim = Number(numerico2[4]);

        // usa o mês final se informado e diferente
        if (Number(numerico2[5]) !== mes) {
          return null; // ou tratar período cruzando mês
        }

        ano = numerico2[3]
          ? Number(numerico2[3])
          : null;
      }
    }

  }

  if (!diaInicio || !diaFim || !mes) {
    return null;
  }

  // Ano não informado: assume a próxima ocorrência
  if (!ano) {

    const hoje = new Date();

    ano = hoje.getFullYear();

    const dataTeste =
      new Date(ano, mes - 1, diaInicio);

    if (dataTeste < hoje) {
      ano++;
    }

  }

  return {
    dataInicio:
      `${String(diaInicio).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`,

    dataFim:
      `${String(diaFim).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`

  };
}

function extrairEvento(msg, periodos) {

  for (const evento of periodos) {

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
