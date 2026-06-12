function contabilizaReceitas(propriedadeContabilizar) {

//  propriedadeContabilizar = "CD112102";

  if (propriedadeContabilizar == "TODAS") { throw new Error("Contabilização de TODAS ainda não implementada"); }
  if (!propriedadeContabilizar || propriedadeContabilizar == "") { throw new Error("Contabilização de ESTADIAS abortada sem propriedade "); }

  for (_idPropriedade of arrayIdPropriedade) {
    if (propriedadeContabilizar != _idPropriedade && propriedadeContabilizar != "TODAS") continue;
    contabilizaPropriedade(_idPropriedade);
  }

  function contabilizaPropriedade(_idPropriedade) {
    console.log("Iniciando contabilização de ESTADIAS: ", _idPropriedade);
    let _spreadSheetId = "16T6pTdMVjhL83BDAtiQyY8Kj0DJjaEjE4XzvyOifzC4"
    let nomeArquivo = DriveApp.getFileById(_spreadSheetId).getName();
    let anoPlanilha = Number(nomeArquivo.substring(0, 4)); // Converte "2025" para 2025

    let ssValores = SpreadsheetApp.openById(_spreadSheetId);
    let sheetDados = ssValores.getSheetByName(_idPropriedade);
    if (!sheetDados) { throw new Error("SEM PLANILHA FINANCEIRA DA PROPRIEDADE: " + _idPropriedade); };
    let rangeDados = sheetDados.getRange(16, 1, 5, 13).getValues();
    let rangeNotes = sheetDados.getRange(16, 1, 5, 13).getNotes();
    let rangeDiariasGratis = sheetDados.getRange(23, 1, 1, 13).getValues();
    let rangeDiariasPagas = sheetDados.getRange(24, 1, 1, 13).getValues();

    const ss = SpreadsheetApp.openById("1E1rOxTtom-sFOUCQZoy4h2bLX9oEKNpalEHx_GsaohU");
    const sheetEstadia = ss.getSheetByName("Estadia");
    const lastRowEstadia = sheetEstadia.getLastRow();
    const lastColumnEstadia = sheetEstadia.getLastColumn();
    const rangeEstadia = sheetEstadia.getRange(1, 1, lastRowEstadia, lastColumnEstadia).getValues();

    const arrayDeTipos = rangeDados.map(row => row[0]);
    let _qtdContabilizacoes = 0;
    let linhaEstadia = 0;
    let statusUpdates = sheetEstadia.getRange(1, lastColumnEstadia - 1, lastRowEstadia, 1).getValues();

    for (objetoEstadia of rangeEstadia) { // Varredura das estadias
      linhaEstadia++;
      if (objetoEstadia[1] != _idPropriedade) continue;
      if (objetoEstadia[5] == null || isNaN(objetoEstadia[5])) continue;

      let dataSaida = new Date(objetoEstadia[4]);
      if (isNaN(dataSaida.getTime())) continue; // Pula se a data for inválida

      let anoEstadia = dataSaida.getFullYear();
      if (anoEstadia !== anoPlanilha) {
        continue;
      }

      let diariasPagas = 0;
      let diariasGratis = 0;

      const colunaArrayFinanceiro = objetoEstadia[4].getMonth() + 1;

      if (objetoEstadia[51] == "CONTABILIZADA") continue;
      if (objetoEstadia[49] == "OUTRO") objetoEstadia[49] = "PARCEIRO";
      if (objetoEstadia[49] == "TEMPORADA") objetoEstadia[49] = "DIRETA";
      if (!['BOOKING', 'AIRBNB', 'OUTRO', 'DIRETA', 'TEMPORADA', 'PARCEIRO']
        .includes(objetoEstadia[49])) objetoEstadia[49] = "DIRETA";

      const linhaArrayFinanceiro = arrayDeTipos.indexOf(objetoEstadia[49]);
      if (linhaArrayFinanceiro == -1) continue;

      if (Number(objetoEstadia[5]) == 0) {
        diariasGratis = calculaDias(new Date(objetoEstadia[3]), new Date(objetoEstadia[4]));
      }
      if (Number(objetoEstadia[5]) != 0)
        diariasPagas = calculaDias(new Date(objetoEstadia[3]), new Date(objetoEstadia[4]));

      rangeDiariasGratis[0][colunaArrayFinanceiro] =
        rangeDiariasGratis[0][colunaArrayFinanceiro] + diariasGratis;
      rangeDiariasPagas[0][colunaArrayFinanceiro] =
        rangeDiariasPagas[0][colunaArrayFinanceiro] + diariasPagas;

      if (Number(objetoEstadia[5]) == 0) continue;

      let somaValorLocacao = Number(Number(objetoEstadia[5]).toFixed(2));
      let somaValorPago = 0;
      let somaComissaoPaga = 0;

      if (objetoEstadia[6]) {
        let texto = String(objetoEstadia[6]);
        texto = texto.replace(
          /("valor"\s*:\s*)(\d+(?:[\.,]\d+)?)/g,
          (match, p1, p2) => p1 + corrigirNumeroBR(p2)
        );
        texto = texto.replace(
          /("comissao"\s*:\s*)(\d+(?:[\.,]\d+)?)/g,
          (match, p1, p2) => p1 + corrigirNumeroBR(p2)
        );
        try {
          let dados = JSON.parse(texto);
          let valorPagoNumerico = dados.reduce((total, item) => total + (Number(item.valor) || 0), 0);
          let comissaoPagaNumerica = dados.reduce((total, item) => total + (Number(item.comissao) || 0), 0);
          somaValorPago = dados.reduce((total, item) => total + (Number(item.valor) || 0), 0);
          somaComissaoPaga = dados.reduce((total, item) => total + (Number(item.comissao) || 0), 0);
          let formatarBR = (num) => num.toFixed(2).replace('.', ',');
          somaValorPago = valorPagoNumerico;
          somaComissaoPaga = comissaoPagaNumerica;
        } catch (e) {
          Logger.log('Erro ao parsear texto corrigido: ' + e + ' — texto: ' + texto);
          somaValorPago = '0,00';
          somaComissaoPaga = '0,00';
        }
      }
      let notesAnterioresRaw = rangeNotes[linhaArrayFinanceiro][colunaArrayFinanceiro];
      let notesAtualizado;
      try {
        notesAtualizado = notesAnterioresRaw ? JSON.parse(notesAnterioresRaw) : [];
        if (!Array.isArray(notesAtualizado)) notesAtualizado = [];
      } catch (e) {
        notesAtualizado = [];
      }
      var objNotaEstadia = {};
      objNotaEstadia.entrada = new Date(objetoEstadia[3]).toLocaleDateString("pt-BR");
      objNotaEstadia.saida = new Date(objetoEstadia[4]).toLocaleDateString("pt-BR");
      objNotaEstadia.valor = somaValorPago;
      objNotaEstadia.nome = objetoEstadia[7];
      notesAtualizado.push(objNotaEstadia);
      notesAtualizado = JSON.stringify(notesAtualizado);
      let creditoAtualizado = 0;
      try {
        let dados = JSON.parse(notesAtualizado);
        creditoAtualizado = dados.reduce((total, item) => {
          let valorLimpo = String(item.valor).replace(',', '.');
          let valorNum = parseFloat(valorLimpo) || 0;
          return total + valorNum;
        }, 0);
        let formatarBR = (num) => num.toFixed(2).replace('.', ',');
        creditoAtualizado = formatarBR(creditoAtualizado);
      } catch (e) {
        Logger.log('Erro ao parsear notes atualizado: ' + e + ' — texto: ' + notesAtualizado);
      }
      rangeDados[linhaArrayFinanceiro][colunaArrayFinanceiro] = creditoAtualizado;
      rangeNotes[linhaArrayFinanceiro][colunaArrayFinanceiro] = notesAtualizado;
      statusUpdates[linhaEstadia - 1][0] = "CONTABILIZADA";

      // Cálculo da diferença absoluta para evitar e-mails por erros de centavos (0.01)
      let diferenca = Math.abs(somaValorLocacao - Number(somaValorPago));

      if (diferenca > 0.01) {
        // Formatação para exibição no e-mail (BR)
        let valorLocadoBR = "R$ " + somaValorLocacao.toFixed(2).replace('.', ',');
        let valorPagoBR = "R$ " + Number(somaValorPago).toFixed(2).replace('.', ',');

        MailApp.sendEmail({
          to: 'airtonaragao@gmail.com',
          subject: "⚠️ Diferença Financeira: " + _idPropriedade + " - " + objNotaEstadia.nome,
          htmlBody: "<h3>Diferença de valor detectada na contabilização</h3>" +
            "<b>Hóspede:</b> " + objNotaEstadia.nome + "<br>" +
            "<b>Período:</b> " + objNotaEstadia.entrada + " a " + objNotaEstadia.saida + "<br>" +
            "<hr>" + // Linha horizontal separadora
            "<b>Valor Locado:</b> " + valorLocadoBR + "<br>" +
            "<b>Valor Pago:</b> " + valorPagoBR + "<br><br>" +
            "<i>Este e-mail foi gerado automaticamente pelo sistema de contabilização.</i>"
        });
      }
      _qtdContabilizacoes++;
    }
    sheetDados.getRange(16, 1, 5, 13).setValues(rangeDados);
    sheetDados.getRange(16, 1, 5, 13).setNotes(rangeNotes);
    sheetDados.getRange(23, 1, 1, 13).setValues(rangeDiariasGratis);
    sheetDados.getRange(24, 1, 1, 13).setValues(rangeDiariasPagas);
    sheetEstadia.getRange(1, lastColumnEstadia - 1, lastRowEstadia, 1).setValues(statusUpdates);
    console.log("ENCERRADA A CONTABILIZAÇÃO DE: ", _idPropriedade, "COM ", _qtdContabilizacoes, "ESTADIAS CONTABILIZADAS");
  } // Encerra contabilizaPropriedade
} // Encerra contabilizaReceitas
