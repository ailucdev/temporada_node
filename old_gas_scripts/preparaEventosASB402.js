/*
function preparaEventosASB402() {

  const indexPropriedade = checkIdExistArray(arrayIdPropriedade, "ASB402");
  if (indexPropriedade < 0) throw new Error("Sem propriedade");
  const linhaPropriedade = indexPropriedade + 2;

  var objetoMeses = [
    { "mes": "Janeiro", "csv": "" },
    { "mes": "Fevereiro", "csv": "" },
    { "mes": "Março", "csv": "" },
    { "mes": "Abril", "csv": "" },
    { "mes": "Maio", "csv": "" },
    { "mes": "Junho", "csv": "" },
    { "mes": "Julho", "csv": "" },
    { "mes": "Agosto", "csv": "" },
    { "mes": "Setembro", "csv": "" },
    { "mes": "Outubro", "csv": "" },
    { "mes": "Novembro", "csv": "" },
    { "mes": "Dezembro", "csv": "" }];

  try {
    objetoMeses = JSON.parse(sheetPropriedade.getRange(linhaPropriedade, 31).getValue());
  } catch (e) {
    console.log("Problema no parse do objetoMeses do ASB402");
    mandaemailErro("Erro no parse do CSV da propriedade ASB402");
    throw new Error("Erro no parse do objetoMeses");
  }

  const threads = GmailApp.search('is:starred label:"ASB402"');
  var msgs = GmailApp.getMessagesForThreads(threads);

  var stringDeEventosCsv = '';
  let arquivosProcessados = 0;

  for (var i = 0; i < msgs.length; i++) {
    for (var j = 0; j < msgs[i].length; j++) {
      msgs[i][j].unstar();
      var attachments = msgs[i][j].getAttachments();
      for (var k = 0; k < attachments.length; k++) {
        for (const elementoMes of objetoMeses) {
          if (attachments[k].getName().includes(elementoMes.mes)) {
            elementoMes.csv = attachments[k].getDataAsString()
            arquivosProcessados++;
          };
        }
      }
    }
  }

  // Incluir essa concatenação no loop acima
  for (const elementoMes of objetoMeses) {
    stringDeEventosCsv = stringDeEventosCsv.concat(elementoMes.csv);
  }

  const linhasCsv = util_converteCsvJson(stringDeEventosCsv);
  let stringReservas = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TI - TEMPORADA IMOVEIS//"
  for (const linha of linhasCsv) {
    if ((isNaN(linha['"Diárias"']) === false) && linha['"Diárias"'] > 0) {
      stringReservas = stringReservas.concat("\n", "BEGIN:VEVENT");
      stringReservas = stringReservas.concat("\n", ("DESCRIPTION:" + ("(Turismo) " + linha['"Cliente"']).replace(/"/g, "")));
      var dataInicio = linha['"Período"'].substr(1, 10);
      dataInicio = dataInicio.substr(6, 4) + dataInicio.substr(3, 2) + dataInicio.substr(0, 2)
      stringReservas = stringReservas.concat("\n", ("DTSTART:" + dataInicio));
      var dataFim = linha['"Período"'].substr(14, 10);
      dataFim = dataFim.substr(6, 4) + dataFim.substr(3, 2) + dataFim.substr(0, 2);
      stringReservas = stringReservas.concat("\n", ("DTEND:" + dataFim));
      stringReservas = stringReservas.concat("\n", ("VALUE:" + linha['"Valor"']).replace(/"/g, "").replace(/\./g, ""));
      stringReservas = stringReservas.concat("\n", ("SUMMARY:" + ("(Turismo) " + linha['"Cliente"']).replace(/"/g, "")));
      stringReservas = stringReservas.concat("\n", "END:VEVENT");
    }
  }
  stringReservas = stringReservas.concat("\n", "END:VCALENDAR");
  if (arquivosProcessados > 0) {
    let arquivoAtualizado;
    try {
      arquivoAtualizado = DriveApp.getFileById("1bHCbAc2SyDv09G3jnvd6Pzqlw0KhR8Fo");
      arquivoAtualizado.setContent(stringReservas);
    } catch (e) {
      mandaemailErro("Erro ao atualizar arquivo .ics");
      throw new Error("Erro DriveApp");
    }
    //    var arquivoAtualizado = DriveApp.getFileById("1bHCbAc2SyDv09G3jnvd6Pzqlw0KhR8Fo").setContent(stringReservas);
    sheetPropriedade.getRange(linhaPropriedade, 31).setValue(JSON.stringify(objetoMeses));
    console.log('Encerrada a preparação de eventos ASB402. Arquivos atualizados em: ', arquivoAtualizado.getLastUpdated());
  }
  else { console.log('Encerrada a preparação de eventos ASB402 sem atualização de arquivo.'); }
}

*/
function preparaEventosASB402() {
  const indexPropriedade = checkIdExistArray(arrayIdPropriedade, "ASB402");
  if (indexPropriedade < 0) throw new Error("Sem propriedade");
  const linhaPropriedade = indexPropriedade + 2;

  // Inicializa objetoMeses com meses e campo ics vazio
  var objetoMeses = [
    { "mes": "Janeiro", "ics": "" },
    { "mes": "Fevereiro", "ics": "" },
    { "mes": "Março", "ics": "" },
    { "mes": "Abril", "ics": "" },
    { "mes": "Maio", "ics": "" },
    { "mes": "Junho", "ics": "" },
    { "mes": "Julho", "ics": "" },
    { "mes": "Agosto", "ics": "" },
    { "mes": "Setembro", "ics": "" },
    { "mes": "Outubro", "ics": "" },
    { "mes": "Novembro", "ics": "" },
    { "mes": "Dezembro", "ics": "" }];

  // Tenta ler dados armazenados na planilha para preservar meses anteriores
  try {
    const textoJson = sheetPropriedade.getRange(linhaPropriedade, 31).getValue();
    if (textoJson) {
      const objetoPlanilha = JSON.parse(textoJson);
      // Atualiza somente os meses que já existem, preserva os outros
      for (const mesArmazenado of objetoPlanilha) {
        const mesAtual = objetoMeses.find(m => m.mes === mesArmazenado.mes);
        if (mesAtual && mesArmazenado.ics) {
          mesAtual.ics = mesArmazenado.ics;
        }
      }
    }
  } catch (e) {
    console.log("Problema no parse do objetoMeses do ASB402");
    mandaemailErro("Erro no parse do ICS da propriedade ASB402");
    // Continua com meses vazios
  }

  // Busca emails com label ASB402 e estrela
  const threads = GmailApp.search('is:starred label:"ASB402"');
  const msgs = GmailApp.getMessagesForThreads(threads);

  let arquivosProcessados = 0;

  for (let i = 0; i < msgs.length; i++) {
    for (let j = 0; j < msgs[i].length; j++) {
      msgs[i][j].unstar();
      const attachments = msgs[i][j].getAttachments();

      for (let k = 0; k < attachments.length; k++) {
        for (const elementoMes of objetoMeses) {
          if (attachments[k].getName().includes(elementoMes.mes)) {
            // Converte CSV para ICS e armazena
            const csvString = attachments[k].getDataAsString();
            const icsString = gerarIcsDoCsv(csvString);
            if (icsString.trim()) {
              elementoMes.ics = icsString;
              arquivosProcessados++;
            }
          }
        }
      }
    }
  }

  // Monta ICS completo concatenando eventos de todos os meses
  let stringReservas = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TI - TEMPORADA IMOVEIS//\n";

  for (const elementoMes of objetoMeses) {
    if (elementoMes.ics && elementoMes.ics.includes("BEGIN:VEVENT")) {
      // Remove cabeçalho e rodapé do VCALENDAR de cada mês
      const linhas = elementoMes.ics.split("\n").filter(l =>
        l !== "BEGIN:VCALENDAR" &&
        l !== "END:VCALENDAR" &&
        l !== "VERSION:2.0" &&
        !l.startsWith("PRODID")
      );
      stringReservas += linhas.join("\n") + "\n";
    }
  }
  stringReservas += "END:VCALENDAR";

  if (arquivosProcessados > 0) {
    try {
      const arquivoAtualizado = DriveApp.getFileById("1bHCbAc2SyDv09G3jnvd6Pzqlw0KhR8Fo");
      arquivoAtualizado.setContent(stringReservas);
    } catch (e) {
      mandaemailErro("Erro ao atualizar arquivo .ics");
      throw new Error("Erro DriveApp");
    }
    // Atualiza planilha com ICS mensal
    sheetPropriedade.getRange(linhaPropriedade, 31).setValue(JSON.stringify(objetoMeses));
    console.log('Encerrada a preparação de eventos ASB402. Arquivos atualizados em: ', new Date());
  } else {
    console.log('Encerrada a preparação de eventos ASB402 sem atualização de arquivo.');
  }
}

// Função para converter CSV em string ICS para um mês
function gerarIcsDoCsv(csvContent) {
  const linhas = Utilities.parseCsv(csvContent, ';');
  let eventos = [];

  for (const linha of linhas) {
    const [diarias, cliente, periodo, valor] = linha;

    if (!periodo || !cliente) continue;

    const match = periodo.match(/(\d{2})\/(\d{2})\/(\d{4})\s*à\s*(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) continue;

    const [, diaIni, mesIni, anoIni, diaFim, mesFim, anoFim] = match;

    const dtStart = `${anoIni}${mesIni}${diaIni}`;
    const dtEnd = `${anoFim}${mesFim}${diaFim}`;

    const evento = `
BEGIN:VEVENT
DESCRIPTION:(Turismo) ${cliente}
DTSTART:${dtStart}
DTEND:${dtEnd}
VALUE:${valor}
SUMMARY:(Turismo) ${cliente}
END:VEVENT`;

    eventos.push(evento);
  }

  if (eventos.length === 0) return "";

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TI - TEMPORADA IMOVEIS//${eventos.join('')}
END:VCALENDAR`;

  return ics;
}

function obterNomeMes(mes) {
  const nomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return nomes[parseInt(mes, 10) - 1];
}

// Formata data do tipo "DD/MM/AAAA" para "AAAAMMDD"
function formatarDataICS(dataStr) {
  if (!dataStr) return "";
  const partes = dataStr.split("/");
  if (partes.length !== 3) return "";
  const [dia, mes, ano] = partes;
  return `${ano}${mes.padStart(2, "0")}${dia.padStart(2, "0")}`;
}

