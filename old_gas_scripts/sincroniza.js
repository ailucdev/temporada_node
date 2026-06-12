// Módulo sincroniza APP TEMPORADA
/* Sincroniza o calendário proprio com os calendarios externos: AIRBNB, BOOKING, OUTRO */

function sincroniza(propriedadeSincronizar, _triggerUID) {
//   propriedadeSincronizar = "AV22302"

  var syncTime = new Date();
  for (var linhaPropriedade = 2; linhaPropriedade <= lastRowPropriedade; linhaPropriedade++) {
    if (propriedadeSincronizar && propriedadeSincronizar !== sheetPropriedade.getRange(linhaPropriedade, 1).getValue()) {
      continue;
    }
    var requestSinc = new requestSincroniza(linhaPropriedade, syncTime);
    sincronizaPropriedade(requestSinc);
    contabilizaReceitas(requestSinc.idPropriedade);
    sheetPropriedade.getRange(linhaPropriedade, 30).setValue(syncTime)
  }
  SpreadsheetApp.flush();
  relatorioSincronizacao(syncTime);
  console.log('ENCERRADA SINCRONIZAÇÃO');
  return ('ENCERRADA SINCRONIZAÇÃO');
}

function sincronizaPropriedade(requestSinc) { // Trata cada propriedade

  const info = getInfoAba("Reserva", requestSinc.idPropriedade);
  if (!info) {
    return ContentService.createTextOutput("Aba não encontrada");
  }

  console.log('Iniciando a sincronização da propriedade: ', requestSinc.idPropriedade);

  if (requestSinc.idPropriedade == "ASB402") preparaEventosASB402();

  let sheetLog = ss.getSheetByName("Log");
  let lastRowLog = sheetLog.getLastRow();

  let sheetExcluida = ss.getSheetByName("Excluida");
  let lastRowExcluida = sheetExcluida.getLastRow();
  let lastColumnExcluida = sheetExcluida.getLastColumn();

  let nomePlanilha = info.nomePlanilha;
  let sheetDados = info.sheetDados;
  let rangeDados = info.rangeDados;
  let lastRowDados = info.lastRowDados;
  let lastColumnDados = info.lastColumnDados;
  let arrayIdPropriedade = info.arrayIdPropriedadeDados;
  let _arrayIdEventDados = info.arrayIdEventDados;
  let rangeIdConsulta = info.arrayIdConsulta;
  let _rangeJSON = info.rangeJson;

  function incluiReserva(eventoIncluido, arrayReservasInseridas, requestSinc) {
    sheetDados.insertRowAfter(lastRowDados);
    lastRowDados = lastRowDados + 1;
    var codigoReserva = new Date().getTime().toString();
    sheetDados.getRange(lastRowDados, 1).setValue(codigoReserva);
    sheetDados.getRange(lastRowDados, 2).setValue(requestSinc.idPropriedade);
    sheetDados.getRange(lastRowDados, 3).setValue(requestSinc.idPropriedade.substr(0, 2));
    sheetDados.getRange(lastRowDados, 4).setValue(eventoIncluido.start);
    sheetDados.getRange(lastRowDados, 5).setValue(eventoIncluido.end);
    sheetDados.getRange(lastRowDados, 6).setValue(eventoIncluido.value);
    sheetDados.getRange(lastRowDados, 7).setValue('[{}]');
    sheetDados.getRange(lastRowDados, 8).setValue(eventoIncluido.summary);
    sheetDados.getRange(lastRowDados, 42).setValue(eventoIncluido.id);
    sheetDados.getRange(lastRowDados, 50).setValue(eventoIncluido.origem);
    sheetDados.getRange(lastRowDados, lastColumnDados - 1).setValue('SINCRONIZADO');
    sheetDados.getRange(lastRowDados, 13).setValue('=TEXT(D' + lastRowDados.toString() + '; "dd/mm/yyyy")');
    sheetDados.getRange(lastRowDados, 14).setValue('=TEXT(E' + lastRowDados.toString() + '; "dd/mm/yyyy")');
    let rangeFormaJson = "A" + lastRowDados.toString() + ":AZ" + lastRowDados.toString();
    var formulaJSON =
      '=ARRAYFORMULA("{" & TEXTJOIN(", "; TRUE; IF(A$1:AZ$1 <> ""; """" & A$1:AZ$1 & """: " & IF(A$1:AZ$1 = "valorPago"; "" & TEXTJOIN(", "; TRUE; FILTER(' + rangeFormaJson + '; A$1:AZ$1 = "valorPago")) & ""; IF(LEFT(' + rangeFormaJson + '; 1) = "{"; ' + rangeFormaJson + '; IF(LEFT(' + rangeFormaJson + '; 1) = "["; ' + rangeFormaJson + '; """" & ' + rangeFormaJson + ' & """"))); ""))) & "}"';
    sheetDados.getRange(lastRowDados, lastColumnDados).setValue(formulaJSON);
    arrayIdEventReserva = sheetDados.getRange(1, 42, lastRowDados, 1).getDisplayValues().flat();
    var objetoReserva = {};
    objetoReserva.idPropriedade = sheetDados.getRange(lastRowDados, 2).getValue();
    objetoReserva.origem = sheetDados.getRange(lastRowDados, (50)).getValue();
    objetoReserva.start = sheetDados.getRange(lastRowDados, 4).getValue();
    objetoReserva.end = sheetDados.getRange(lastRowDados, 5).getValue();
    objetoReserva.summary = sheetDados.getRange(lastRowDados, (50)).getValue();
    objetoReserva.description = sheetDados.getRange(lastRowDados, 1).getValue();
    objetoReserva.idEvento = sheetDados.getRange(lastRowDados, (42)).getValue();
    arrayReservasInseridas.push(objetoReserva);
    eventoIncluido.status == 'INCLUIDO'
  } // Encerrou inclusão de reserva de evento não achado nas reservas

  let arrayEventosPropriosAnteriores = [];
  let arrayEventosPropriosAtuais = [];
  let arrayEventosExternosAnteriores = [];
  let arrayEventosExternosIncluidos = [];
  let arrayEventosExternosDesprezados = [];
  let arrayEventosExternosRemovidos = [];
  let arrayEventosExternosReconfirmados = [];
  let arrayEventosExternosApagados = [];
  let arrayReservasPassadasParaEstadia = [];
  let arrayReservasMantidas = [];
  let arrayReservasRemovidas = [];
  let arrayReservasInseridas = [];
  let arrayReservasExigindoAtencao = [];
  //  let arrayIdEventosExternos = [];
  let arrayAirbnb = [];
  let arrayOutro = [];
  let eventosDesprezados = 0;
  let diasReservados = 0;

  console.log("Iniciando tratamento de eventos externos");
  let arrayEventos = JSON.parse(buscaEventos(JSON.stringify(requestSinc.arrayCalendarios)));

  let _queryEventosAnteriores = Calendar.Events.list(requestSinc.idCalendarioProprio, {
    "timeMin": requestSinc.hoje.toISOString(), "timeMax": requestSinc.finalPeriodo.toISOString(),
    singleEvents: true, orderBy: 'startTime', // "q": 'Sincronizado'
  });

  for (const eventoAnteriorQuery of _queryEventosAnteriores.items) {// Marca eventos externos anteriores com colorId preto
    if (eventoAnteriorQuery.id.endsWith("proprio")) {
      const valorLocacaoEventoProprio = (() => {
        try {
          const valor = JSON.parse(eventoAnteriorQuery.description)?.valorLocacao;
          return valor || 0; // trata "", null, undefined, 0, false como "falsy"
        } catch (e) {
          return 0;
        }
      })();
      const objetoEventoProprio = {
        id: eventoAnteriorQuery.id,
        origem: eventoAnteriorQuery.id.match(/[a-zA-Z]+$/)[0],
        start: eventoAnteriorQuery.start.date,
        end: eventoAnteriorQuery.end.date,
        summary: eventoAnteriorQuery.summary,
        description: eventoAnteriorQuery.description,
        value: valorLocacaoEventoProprio,
        UID: eventoAnteriorQuery.iCalUID,
        stamp: '',
        colorId: 5
      };
      arrayEventos.push(objetoEventoProprio);
      continue
    }; // Pula sem trocar a cor do evento próprio
    var eventoAtualizarCor =
      { "start": { "date": eventoAnteriorQuery.start.date, }, "end": { "date": eventoAnteriorQuery.end.date, }, "colorId": 8 }
    try { Calendar.Events.update(eventoAtualizarCor, requestSinc.idCalendarioProprio, eventoAnteriorQuery.id); }
    catch (erroAtualizaCor) { mandaemailErro(erroAtualizaCor.message); throw (erroAtualizaCor.message); }
    arrayEventosExternosAnteriores.push(eventoAnteriorQuery);
  } // Encerrou marcação de eventos externos anteriores com a cor 8

  // Busca eventos externos
  for (const eventoTratar of arrayEventos) { // Trata cada evento externo
    eventoTratar.status = '';
    const start_time = new Date(eventoTratar.start);
    const end_time = new Date(eventoTratar.end);
    const diasReserva = calculaDias(start_time, end_time);
    // Despreza eventos passados, bloqueio do dia de hoje, grande bloqueio futuro, eventos BOOKING e AIRBNB que não sejam reservas
    let _desprezarEvento = false;
    if (new Date(end_time).getTime() <= new Date(requestSinc.hoje).getTime()) _desprezarEvento = true;
    if (diasReserva > 90) _desprezarEvento = true;
    if (eventoTratar.origem == "AIRBNB" && !eventoTratar.summary.startsWith("Reserve")) _desprezarEvento = true;
    if (eventoTratar.origem == "BOOKING" && !eventoTratar.summary.startsWith("CLOSED")) _desprezarEvento = true;
    //    if ((diasReserva == 1) && (new Date(start_time).getTime() <= new Date(requestSinc.hoje).getTime())) _desprezarEvento = true;
    if (_desprezarEvento) {
      eventosDesprezados = eventosDesprezados + 1;
      eventoTratar.status = 'DESPREZADO';
      arrayEventosExternosDesprezados.push(eventoTratar);
      continue;
    }
    // Encerra desprezo de eventos
    diasReservados = diasReservados + diasReserva;
    // SINCRONIZAÇÃO DE CALENDÁRIOS
    var saidaEvento = new Date(end_time);
    // Verificar essa soma de dia
    saidaEvento.setDate(saidaEvento.getDate() + 1);
    saidaEvento.setHours(0, 0, 0, 0);

    var eventoCriado = {
      id: eventoTratar.id,
      location: requestSinc.idPropriedade,
      summary: "Sincronizado " + eventoTratar.origem + ' ' + eventoTratar.summary,
      //      description: JSON.stringify(objDescription, null, 2).replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim(),
      description: eventoTratar.description,
      start: { date: start_time.toISOString().substring(0, 10) },
      end: { date: saidaEvento.toISOString().substring(0, 10) },
      colorId: eventoTratar.colorId,
      status: "confirmed"
    };

    try {
      _eventRequest = Calendar.Events.insert(eventoCriado, requestSinc.idCalendarioProprio);
      eventoTratar.status = 'INCLUIDO';
      arrayEventosExternosIncluidos.push(eventoCriado);
    } catch (erro) {
      if (erro.message.includes("Duplicate") || erro.message.includes("already exists")) {
        try {
          Calendar.Events.patch(eventoCriado, requestSinc.idCalendarioProprio, eventoTratar.id);
          eventoTratar.status = 'RECONFIRMADO';
          arrayEventosExternosReconfirmados.push(eventoCriado);
        } catch (erroupdate) {
          mandaemailErro(erroupdate.message);
          throw erroupdate.message;
        }
      } else {
        mandaemailErro(erro.message);
        throw erro.message;
      }
    }

    // Se não existe uma reserva referente ao evento faz a inclusão
    if (!_arrayIdEventDados.includes(eventoTratar.id)) {
      incluiReserva(eventoTratar, arrayReservasInseridas, requestSinc);
      eventoTratar.status = 'INCLUIDO';
    }
  } // Tratou todos os eventos externos

  // Apaga os eventos que não foram reconfirmados
  for (var eventoApagar of _queryEventosAnteriores.items) { // Apaga os eventos marcados com cor 8
    if (eventoApagar.colorId != 8) continue;
    try {
      Calendar.Events.remove(requestSinc.idCalendarioProprio, eventoApagar.id);
      eventoApagar.status = 'APAGADO';
      arrayEventosExternosApagados.push(eventoApagar);
    }
    catch (erroRemove) {
      mandaemailErro(erroRemove.message);
      throw (erroRemove.message);
    }
  } // Apagou os eventos marcados com cor 8
  console.log("Encerrando tratamento de eventos e iniciando tratamento de reservas: ", requestSinc.idPropriedade);

  // Inicia o tratamento de reservas
  var reservasTransformadasEstadias = 0;

  const todosEventos = arrayEventos.filter(evento => ['INCLUIDO', 'RECONFIRMADO'].includes(evento.status));
  // Cria um Map para acesso rápido por ID
  const mapEventosPorId = new Map(todosEventos.map(ev => [ev.id, ev]));
  console.log("Todos os eventos incluidos e reconfirmados: ", todosEventos);

  for (let linhaReserva = lastRowDados; linhaReserva >= 2; linhaReserva--) { // Sincronização das reservas
    const jsonReserva = sheetDados.getRange(linhaReserva, lastColumnDados).getValue();
    const jsonReservaParseado = JSON.parse(jsonReserva);
    if (requestSinc.idPropriedade != jsonReservaParseado.idPropriedade) continue;
    //    if (requestSinc.idPropriedade != sheetDados.getRange(linhaReserva, 2).getValue()) continue;
    var objetoReserva = {};
    objetoReserva.idConsulta = jsonReservaParseado.idConsulta;
    objetoReserva.idPropriedade = jsonReservaParseado.idPropriedade;
    objetoReserva.start = parseDataBrasilParaDate(jsonReservaParseado.entrada);
    objetoReserva.end = parseDataBrasilParaDate(jsonReservaParseado.saida);
    objetoReserva.valor = jsonReservaParseado.valorLocacao;
    objetoReserva.interessado = jsonReservaParseado.nomeInteressado;
    // ver sumario e descrição
    objetoReserva.summary = jsonReservaParseado.nomeInteressado;
    objetoReserva.description = 'idConsulta: ' + jsonReservaParseado.idConsulta + ' ';
    objetoReserva.idEvento = jsonReservaParseado.idEvent;
    objetoReserva.origem = jsonReservaParseado.origem;
    objetoReserva.status = jsonReservaParseado.STATUS;
    objetoReserva.mensagem = '';

    // Tratamento de estadias
    if (new Date(objetoReserva.end) <= new Date()) {
      let sheetEstadia = ss.getSheetByName(nomePlanilha.replace("Reserva", "Estadia"));
      let lastRowEstadia = sheetEstadia.getLastRow();
      let lastColumnEstadia = sheetEstadia.getLastColumn();
      var moverRangeReserva = sheetDados.getRange(linhaReserva, 1, 1, lastColumnDados);
      sheetEstadia.insertRowAfter(lastRowEstadia);
      var targetlinhaEstadiaRange = sheetEstadia.getRange(lastRowEstadia + 1, 1, 1, lastColumnEstadia);
      moverRangeReserva.copyTo(targetlinhaEstadiaRange);
      lastRowEstadia = sheetEstadia.getLastRow();
      sheetEstadia.getRange(lastRowEstadia, 52).setValue("");
      sheetDados.deleteRow(linhaReserva);
      lastRowDados = sheetDados.getLastRow();
      reservasTransformadasEstadias = reservasTransformadasEstadias + 1;
      arrayReservasPassadasParaEstadia.push(objetoReserva);
      continue;
    } // Encerrou tratamento de estadias

    const evento = arrayEventos.find(ev => ['INCLUIDO', 'RECONFIRMADO'].includes(ev.status) && ev.id === objetoReserva.idEvento);

    if (!evento) {
      objetoReserva.status = 'EVENTO NÃO EXISTE';
      objetoReserva.mensagem = 'EVENTO NÃO EXISTE';

      var moverRangeReserva = sheetDados.getRange(linhaReserva, 1, 1, lastColumnDados);
      sheetExcluida.insertRowAfter(lastRowExcluida);
      var targetlinhaExcluidaRange = sheetExcluida.getRange(lastRowExcluida + 1, 1, 1, lastColumnExcluida);
      moverRangeReserva.copyTo(targetlinhaExcluidaRange);
      lastRowExcluida = sheetExcluida.getLastRow();
      //      sheetDados.deleteRow(linhaReserva);
      lastRowDados = sheetDados.getLastRow();
      arrayReservasRemovidas.push(objetoReserva);
      continue;
    }

    if (evento.status === 'cancelled') {
      objetoReserva.status = 'EVENTO CANCELADO';
      objetoReserva.mensagem = 'EVENTO CANCELADO';
      var moverRangeReserva = sheetDados.getRange(linhaReserva, 1, 1, lastColumnDados);
      sheetExcluida.insertRowAfter(lastRowExcluida);
      var targetlinhaExcluidaRange = sheetExcluida.getRange(lastRowExcluida + 1, 1, 1, lastColumnExcluida);
      moverRangeReserva.copyTo(targetlinhaExcluidaRange);
      lastRowExcluida = sheetExcluida.getLastRow();
      //      sheetDados.deleteRow(linhaReserva);
      lastRowDados = sheetDados.getLastRow();
      arrayReservasRemovidas.push(objetoReserva);
      continue;
    }

    // Evento existe e está ativo → atualiza
    objetoReserva.status = 'SINCRONIZADO';

    const atualizacaoEvento = {
      summary: objetoReserva.summary,
      description: JSON.stringify(jsonReserva)
    };

    try {
      Calendar.Events.patch(atualizacaoEvento, requestSinc.idCalendarioProprio, objetoReserva.idEvento);
    } catch (erroPatch) {
      mandaemailErro(erroPatch.message);
      throw erroPatch.message;
    }

    arrayReservasMantidas.push(objetoReserva);

    // Verificação se há cobertura
    let origensCobertura = requestSinc.arrayCalendarios.map(c => c.origem);
    let idsFiltrados = arrayEventos.filter(e => !e.id.toLowerCase().endsWith("proprio")).map(e => e.id);
    objetoReserva.status = verificaCobertura(arrayEventos, objetoReserva.idEvento, ["airbnb"]);
    if (objetoReserva.status.includes("DESCOBERTA")) arrayReservasExigindoAtencao.push(objetoReserva);
    objetoReserva.mensagem = objetoReserva.mensagem + ", " + objetoReserva.status;
    // Encerrou tratamento de cobertura
    sheetDados.getRange(linhaReserva, lastColumnDados - 1).setValue(objetoReserva.status);
  } // Encerra for de reservas
  console.log("Encerrando tratamento de reservas: ", requestSinc.idPropriedade)
  console.log('Total de eventos desprezados por data anterior, duração de um dia e duração > 90 dias: ', eventosDesprezados)
  console.log('Total de dias bloqueados ou reservados: ', diasReservados);
  // Cria os registros de log
  sheetLog.insertRowAfter(lastRowLog);
  lastRowLog = lastRowLog + 1;
  sheetLog.getRange(lastRowLog, 1).setValue(new Date(requestSinc.syncTime).toString());
  sheetLog.getRange(lastRowLog, 2).setValue(requestSinc.idPropriedade);
  var novoJson = JSON.stringify(arrayEventosExternosRemovidos);
  sheetLog.getRange(lastRowLog, 3).setValue(novoJson);
  var novoJson = JSON.stringify(arrayEventosExternosIncluidos);
  sheetLog.getRange(lastRowLog, 4).setValue(novoJson);
  var novoJson = JSON.stringify(arrayEventosExternosDesprezados);
  sheetLog.getRange(lastRowLog, 5).setValue(novoJson);
  var novoJson = JSON.stringify(arrayEventosPropriosAnteriores);
  sheetLog.getRange(lastRowLog, 6).setValue(novoJson);
  var novoJson = JSON.stringify(arrayEventosPropriosAtuais);
  sheetLog.getRange(lastRowLog, 7).setValue(novoJson);
  var novoJson = JSON.stringify(arrayEventosExternosAnteriores);
  sheetLog.getRange(lastRowLog, 8).setValue(novoJson);
  var novoJson = JSON.stringify(arrayEventosExternosReconfirmados);
  sheetLog.getRange(lastRowLog, 9).setValue(novoJson);
  var novoJson = JSON.stringify(arrayEventosExternosApagados);
  sheetLog.getRange(lastRowLog, 10).setValue(novoJson);
  var novoJson = JSON.stringify(arrayReservasPassadasParaEstadia);
  sheetLog.getRange(lastRowLog, 11).setValue(novoJson);
  var novoJson = JSON.stringify(arrayReservasRemovidas);
  sheetLog.getRange(lastRowLog, 12).setValue(novoJson);
  var novoJson = JSON.stringify(arrayReservasInseridas);
  sheetLog.getRange(lastRowLog, 13).setValue(novoJson);
  var novoJson = JSON.stringify(arrayReservasMantidas);
  sheetLog.getRange(lastRowLog, 14).setValue(novoJson);
  var novoJson = JSON.stringify(arrayReservasExigindoAtencao);
  sheetLog.getRange(lastRowLog, 15).setValue(novoJson);
  // Encerrou criação dos registros de log

  sheetDados.sort(42);
  let sheetEstadia = ss.getSheetByName(nomePlanilha.replace("Reserva", "Estadia"));
  sheetEstadia.sort(42);
  //  sheetEstadia.sort(42, false);

  console.log("Encerrando tratamento da propriedade: ", requestSinc.idPropriedade)

} // Processou cada propriedade

function requestSincroniza(linhaPropriedade, syncTime) {
  this.hoje = new Date();
  this.hoje = new Date(new Date(this.hoje).toDateString());
  this.hoje.setDate(this.hoje.getDate() + 1);
  this.finalPeriodo = new Date();
  this.finalPeriodo = new Date(new Date(this.finalPeriodo).toDateString());
  this.finalPeriodo.setFullYear(this.hoje.getFullYear() + 2);
  this.idPropriedade = sheetPropriedade.getRange(linhaPropriedade, 1).getValue();
  this.sincronizadoComAirbnb = sheetPropriedade.getRange(linhaPropriedade, 27).getValue();
  this.arrayCalendarios = JSON.parse(sheetPropriedade.getRange(linhaPropriedade, 32).getValue());
  this.idCalendarioProprio = this.arrayCalendarios[0].icalId;
  this.idCalendarioAirbnb = this.arrayCalendarios[1].icalId;
  this.syncTime = syncTime;
} // Encerra requestSincroniza