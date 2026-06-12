// Trata calendários
function calendarios (BlocoAp) {
   // Pega o calendario pelo nome "Aquaville Bloco/Apartamento"
  var BlocoAp = 'Aquaville 80/101';
    var calendario = CalendarApp.getCalendarsByName(BlocoAp);
      if (calendario.length == 0) {
        // Cria um novo calendario com o nome "Aquaville Bloco/Apartamento".
        var calendar = CalendarApp.createCalendar(BlocoAp, {
          summary: 'Calendário de reservas ',
          color: CalendarApp.Color.BLUE
        });
      }
    
  // Get Calendar
  var calName = BlocoAp;
  var cal = CalendarApp.getCalendarsByName(calName)[0];
  var title = 'Reservado indicação: ';  // Título da reserva
  var blockFrom = 7;       // Dias de bloqueio
  var today = new Date();  // Data, ...
  today.setHours(0,0,0,0); // Meia noite
  var startDate            // Dia do começo
        = new Date(today.getTime() + (24 * 60 * 60 * 1000));
  var endTime = new Date(startDate.getTime() + (24 * 60 * 60 * 1000) - 1);
  var recurrence = CalendarApp.newRecurrence().addDailyRule().times(blockFrom);
  
  // Verifica se está reservado
  var series = cal.getEvents(startDate, endTime, {search:title});
  
  if (series.length == 0) {
    // No block reservation found - create one.
    var reserved = cal.createAllDayEventSeries(title, startDate, recurrence);
  }
  else {
    // Block reservation exists - update the recurrence to start later.
  //  reserved = series[0].getEventSeries();
  //  reserved.setRecurrence(recurrence, startDate);
  }
}