function liberaCalendar(request) {
  
  if (!request.idEvent) return;
  var event = request.calendarPropriedade.getEventById(request.idEvent);
  var event = request.calendarPropriedade.getEventById('av8010117685324000001769396400000proprio');
  event.deleteEvent();
  sheetConsulta.getRange(mudouLinha, 35).setValue('');

/*  try { // Teste de deleção
    CalendarApp.getCalendarById("6ikibrpt70qbpovtp4snhtekes@group.calendar.google.com").getEventById('av8010117685324000001769396400000proprio').deleteEvent();
    result = { "status": "200", "message": "Reserva cancelada" };
  }
  catch (erro) {
    mensagem = "Erro no tratamento de evento: " + erro;
    result = { "status": "500", "message": mensagem, "erro": erro.stack };
    mandaemailErro(result.message);
  }
  console.log(result.status, result.message);
*/
}
