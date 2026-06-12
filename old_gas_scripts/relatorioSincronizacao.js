function relatorioSincronizacao(syncTime) {

  let sheetLog = ss.getSheetByName("Log");
  let lastRowLog = sheetLog.getLastRow();
  if (!syncTime || syncTime == '') syncTime = new Date(sheetLog.getRange(lastRowLog, 1).getValue());
  if (!syncTime) return;
  if (!syncTime instanceof Date) return;
  var dataSincronizacao =
    formataData(syncTime) + ' ' +
    new Date(syncTime).getHours().toLocaleString() + ':' +
    new Date(syncTime).getMinutes().toLocaleString() + ':' +
    new Date(syncTime).getSeconds().toLocaleString();
  console.info('Iniciou relatorio de sincronização de ', dataSincronizacao);

  for (var linhaLog = sheetLog.getLastRow();
    (sheetLog.getRange(linhaLog, 1).getValue() == new Date(syncTime).toString()); linhaLog--) {
    if (linhaLog < 2) break;
    console.log('Relatorio de sincronização de ', sheetLog.getRange(linhaLog, 2).getValue());

    var mensagemGeral = 'Relatorio de sincronização de ' + dataSincronizacao + "\n" + "\n";

    var logEventosRemovidos = JSON.parse(sheetLog.getRange(linhaLog, 3).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de eventos removidos: ' + logEventosRemovidos.length + "\n";

    var logEventosInseridos = JSON.parse(sheetLog.getRange(linhaLog, 4).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de eventos inseridos: ' + logEventosInseridos.length + "\n";

    var logEventosDesprezados = JSON.parse(sheetLog.getRange(linhaLog, 5).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de eventos desprezados: ' + logEventosDesprezados.length + "\n";

    var logEventosPropriosAnteriores = JSON.parse(sheetLog.getRange(linhaLog, 6).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de eventos proprios anteriores: ' + logEventosPropriosAnteriores.length + "\n";

    var logEventosPropriosAtuais = JSON.parse(sheetLog.getRange(linhaLog, 7).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de eventos proprios atuais: ' + logEventosPropriosAtuais.length + "\n";

    var logEventosExternosAnteriores = JSON.parse(sheetLog.getRange(linhaLog, 8).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de eventos externos anteriores: ' + logEventosExternosAnteriores.length + "\n";

    var logEventosExternosReconfirmados = JSON.parse(sheetLog.getRange(linhaLog, 9).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de eventos externos reconfirmados: ' + logEventosExternosReconfirmados.length + "\n";

    var logEventosExternosApagados = JSON.parse(sheetLog.getRange(linhaLog, 10).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de eventos externos apagados: ' + logEventosExternosApagados.length + "\n";

    var logReservasPassadasEstadia = JSON.parse(sheetLog.getRange(linhaLog, 11).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de reservas passadas para estadias: ' + logReservasPassadasEstadia.length + "\n";

    var logReservasRemovidas = JSON.parse(sheetLog.getRange(linhaLog, 12).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de reservas removidas: ' + logReservasRemovidas.length + "\n";

    var logReservasInseridas = JSON.parse(sheetLog.getRange(linhaLog, 13).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de reservas inseridas: ' + logReservasInseridas.length + "\n";

    var logReservasMantidas = JSON.parse(sheetLog.getRange(linhaLog, 14).getValue());
    mensagemGeral = mensagemGeral + '- Quantidade de reservas mantidas: ' + logReservasMantidas.length + "\n";

    console.log('Mail geral: ', mensagemGeral)
    //    MailApp.sendEmail({
    //      to: 'airton.aragao@gmail.com', // cc: 'tatianatymburiba@gmail.com',
    //      subject: 'Relatório geral de sincronização. ',
    //      body: mensagemGeral
    //    });
    var logReservasExigindoAtencao = JSON.parse(sheetLog.getRange(linhaLog, 15).getValue());
    console.info('- Quantidade de reservas exigindo atenção', logReservasExigindoAtencao.length);
    var corpoMensagem = 'Reservas que exigem atenção em ' + dataSincronizacao + "\n" + "\n";

    for (var reservaLog of logReservasExigindoAtencao) {
      if (!(reservaLog.start instanceof Date) || !(reservaLog.end instanceof Date)) {
        console.log("Problemas nas datas da reserva: ", reservaLog.idConsulta);
        reservaLog.start = new Date(reservaLog.start);
        reservaLog.end = new Date(reservaLog.end);
//        return;
      }
      corpoMensagem = corpoMensagem + ' - ' +
        reservaLog.idPropriedade + ' ' +
        reservaLog.origem + ' de ' +
        formataData(reservaLog.start) + ' a ' + formataData(reservaLog.end) + ' ' +
        reservaLog.interessado + ' ' +
        reservaLog.mensagem + "\n";
    }

    if (logReservasExigindoAtencao.length > 0) {
      console.log('Mail: ', corpoMensagem);
      MailApp.sendEmail({
        to: 'airtonaragao@gmail.com', // cc: 'tatianatymburiba@gmail.com',
        subject: 'Reservas que exigem atenção. ',
        body: corpoMensagem
      });
    }
  }
  console.log('Encerrou relatório de sincronização');
  return;
}