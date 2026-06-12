function reservaCalendarConsulta(request) {
  var arrayCalendarios = JSON.parse(request.stringCalendarios);
  var _idCalendario = arrayCalendarios[0].icalId;
  var _calendarPropriedade = CalendarApp.getCalendarById(_idCalendario);
  var arrayEventos = _calendarPropriedade.getEvents(request.entradaDate, request.saidaDate);
  if (arrayEventos.length > 0) { console.log('Reserva INDISPONIVEL: '); throw (''); }
  var saidaReserva = new Date(request.saidaDate);
  saidaReserva.setDate(new Date(request.saidaDate).getDate() + 1);
  var eventoCriado = {
    "id": request.idPropriedade.toLowerCase() +
      new Date(new Date(new Date(request.entradaDate)).toISOString()).getTime().toString() +
      new Date(new Date(new Date(saidaReserva)).toISOString()).getTime().toString() +
      'proprio',
    "location": request.idPropriedade,
    "summary": request.nomeInteressadoConsulta,
    "description": "Reserva própria",
    "start": { "date": request.entradaDate.toISOString().substring(0, 10) },
    "end": { "date": saidaReserva.toISOString().substring(0, 10) },
    "colorId": 3,
    "status": "confirmed"
  };
  try {
    _eventRequest = Calendar.Events.insert(eventoCriado, _idCalendario);
  }
  catch (erro) {
    console.log(erro.message);
    mandaemailErro(erro.message);
  }
  /*
    var event = _calendarPropriedade.createAllDayEvent('PRÓPRIO (RESERVADO)',
      new Date(request.entradaDate), new Date(saidaReserva),
      {
        description: request.idConsulta+': '+request.nomeInteressadoConsulta,
        location: request.localConsulta,
        sendInvites: false
      });
    var eventId = event.getId();
  */
  request.idEvent = eventoCriado.id;
  sheetConsulta.getRange(mudouLinha, 42).setValue(eventoCriado.id);
  return "RESERVADA";
}