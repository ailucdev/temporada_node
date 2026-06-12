function bloqueiaCalendarReserva(dataEntrada, dataSaida, stringCalendarios, idPropriedade, eventoCriado) {

  var resultadoReserva = {
    "status": "SUCESSO",
    "message": "",
    "disponibilidade": true,
    "possibilidade": true,
    "dataEntrada": dataEntrada,
    "dataSaida": dataSaida,
  };

  var arrayCalendarios = JSON.parse(stringCalendarios);
  var _idCalendario = arrayCalendarios[0].icalId;
  var _calendarPropriedade = CalendarApp.getCalendarById(_idCalendario);
  var arrayEventos = _calendarPropriedade.getEvents(dataEntrada, dataSaida);
  if (arrayEventos.length > 0) {
    resultadoReserva.status = 'Reserva INDISPONIVEL';
    resultadoReserva.disponibilidade = false;
    return JSON.stringify(resultadoReserva);
  }
  var saidaReserva = new Date(dataSaida);
  saidaReserva.setDate(new Date(dataSaida).getDate() + 1);
  try {
    _eventRequest = Calendar.Events.insert(eventoCriado, _idCalendario);
  }
  catch (erro) {
    if (erro.message.includes("calendar.events.insert")) {
      try { // Atualiza trocando a cor
        Calendar.Events.patch(eventoCriado, _idCalendario, JSON.parse(eventoCriado).id);
        eventoCriado.status = 'RECONFIRMADO';
      }
      catch (erroupdate) { console.log("ERRO AO RECONFIRMAR: ",erroupdate.message); throw (erroupdate.message); }
    } else { console.log("Else na reconfirmação: ", erro.message); throw (erro.message); }
    mandaemailErro(erro.message);
  }
  var resultadoReserva = { "disponibilidade": true, "status": "RESERVADA", "idEvento": eventoCriado.id };
  return JSON.stringify(resultadoReserva);
}