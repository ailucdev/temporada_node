function OLD_sincronizaCalendar(request) {

  var _idCalendario = sheetPropriedade.getRange(request.linhaPropriedade, 26).getValue();
  var _calendarPropriedade = CalendarApp.getCalendarById(_idCalendario);
  if (!_calendarPropriedade) { console.log('Sem calendario com o id: ', _idCalendario); throw (''); };
  if (_calendarPropriedade.length == 0) { console.log('Sem tamanho de calendario: '); throw ('') };
  var arrayEventos = _calendarPropriedade.getEvents(request.entradaDate, request.saidaDate);
  if (arrayEventos.length > 0) { console.log('Reserva INDISPONIVEL: '); throw (''); }

  var event = _calendarPropriedade.createAllDayEvent(request.nomeInteressadoConsulta,
    request.entradaDate, request.saidaDate,
    {
      location: request.localConsulta,
      description: request.idConsulta+' '+request.idInteressadoConsulta ,
//      guests: sheetPropriedade.getRange(request.linhaPropriedade, 4).getValue(),
      sendInvites: false
    });

  var eventId = event.getId();
  request.idEvent = eventId;
  sheetConsulta.getRange(mudouLinha, 42).setValue(eventId);

  var dataInicioCalendario =
    new Date(rangeTarifas[0][0].substr(6, 4) + '/' + rangeTarifas[0][0].substr(3, 2) + '/' + rangeTarifas[0][0].substr(0, 2));
  var diasCalendario = calculaDias(dataInicioCalendario, request.saidaDate);
  var diasReserva = calculaDias(request.entradaDate, request.saidaDate);
  for (i = diasCalendario; i > (diasCalendario - diasReserva); i--) {
    sheetTarifas.getRange(i + 1, 4).setValue(eventId);
  }

  return "RESERVADA";
}
