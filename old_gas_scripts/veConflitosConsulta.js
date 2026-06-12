function veConflitosConsulta(request) {

  var disponibilidade = 'DISPONIVEL';
  var arrayCalendarios = JSON.parse(request.stringCalendarios);
  for (var elementoCalendario of arrayCalendarios) {
    if (!elementoCalendario.icalId || elementoCalendario.icalId == '') continue;
    var calendarPropriedade = CalendarApp.getCalendarById(elementoCalendario.icalId);
    if (!calendarPropriedade) { console.log('Sem calendario com o id: ', elementoCalendario.icalId); continue };
    if (calendarPropriedade.length == 0) { console.log('Sem tamanho de calendario: '); continue };
    var arrayEventos = calendarPropriedade.getEvents(request.entradaDate, request.saidaDate);
    if (arrayEventos.length > 0) {
      disponibilidade = 'INDISPONIVEL';
      break;
    }
  }

  return disponibilidade;
}