// REVISAR
function OLD_criaCalendarioTemporada() {

var sheetTemporada = ss.getSheetByName("Temporada");
var lastRowTemporada = sheetTemporada.getLastRow();
var lastColumnTemporada = sheetTemporada.getLastColumn();
var rangeTemporada = sheetTemporada.getRange(2, 1, lastRowTemporada, lastColumnTemporada).getDisplayValues();

  for (var p = 2; p <= lastRowPropriedade; p++) {
    var achouTemporada = false;
    var _idCalendario = sheetPropriedade.getRange(p, 26).getValue();
    var _calendarPropriedade = CalendarApp.getCalendarById(_idCalendario);
    var nowDate = new Date();
    var hojeMaisDoisAnos = new Date();
    var hojeMaisDoisAnos = new Date(hojeMaisDoisAnos.setFullYear(nowDate.getFullYear() + 2));
    var arrayEvents = _calendarPropriedade.getEvents(nowDate, hojeMaisDoisAnos, { search: 'fake_blocked' });
    console.log('Propriedade: ', sheetPropriedade.getRange(p, 1).getValue(), 'Qtd eventos: ', arrayEvents.length);
    for (a = 0; a < arrayEvents.length; a++) {
      let event = arrayEvents[a];
      event.deleteEvent();
    }
    //continue;  Serve pra só deletar 
    for (var t = 2; t <= lastRowTemporada; t++) {
      if (sheetTemporada.getRange(t, 2).getValue() != sheetPropriedade.getRange(p, 6).getValue()) continue;
      /*
            var event = _calendarPropriedade.createAllDayEvent
              ('TARIFA', sheetTemporada.getRange(t, 4).getValue(), sheetTemporada.getRange(t, 5).getValue(),
                {
                  location: sheetTemporada.getRange(t, 2).getValue(),
                  description: 'TARIFA:' + sheetTemporada.getRange(t, 6).getValue(),
                  guests: '',
                  sendInvites: false,
                  guestsCanInviteOthers: false,
                  guestsCanModify: false,
                  transparency: "TRANSPARENT",
                  visibility: "PRIVATE"
                }).setVisibility(CalendarApp.Visibility.PRIVATE);
    */

      const calendarId = _idCalendario;
      const start = sheetTemporada.getRange(t, 4).getValue();
      const end = sheetTemporada.getRange(t, 5).getValue();
      let event = {
        summary: 'TARIFA DE ' + sheetPropriedade.getRange(p, 1).getValue(),
        location: sheetTemporada.getRange(t, 2).getValue(),
        description: 'TARIFA=(' + sheetTemporada.getRange(t, 6).getValue() + ')',
        start: {
          dateTime: start.toISOString()
        },
        end: {
          dateTime: end.toISOString()
        },
        //          attendees: []
        //          transparency: "TRANSPARENT"
        //          visibility: "PRIVATE"
        // Red background. Use Calendar.Colors.get() for the full list.
        //    colorId: 11
      };
      event = Calendar.Events.insert(event, calendarId);
      // Wait 30 seconds to see if the event has been updated outside this script.
      // Utilities.sleep(30 * 1000);
      // Try to update the event, on the condition that the event state has not
      // changed since the event was created.
      // event.setTransparency();
      event.setGuestsCanSeeOtherGuests(false);
      event.setGuestsCanInviteOthers(false);
      event.setGuestsCanModify(false);
      try {
        event = Calendar.Events.update(
          event,
          calendarId,
          event.id,
          {},
          { 'If-Match': event.etag }
        );
        Logger.log('Evento atualizado: ' + event.id + 'conteúdo: ', event);
      } catch (e) {
        Logger.log('Erro na atualização de evento: ' + e);
        mandaemailErro('Erro na atualização de evento: ', e);
      }

      //                event.setVisibility("PRIVATE");
      //                event.setTransparency("TRANSPARENT");
      //        event.setTag('Multiplicador', sheetTemporada.getRange(t, 6).getValue());
      console.log('Criou: ', sheetPropriedade.getRange(p, 1).getValue(), sheetTemporada.getRange(t, 4).getValue(), sheetTemporada.getRange(t, 5).getValue());

      //         event = _calendarPropriedade.event.setVisibility(CalendarApp.Visibility.PRIVATE);


    }
  }
  sheetTemporada.getRange(1, 9).setValue(new Date().getTime().toString());
  console.log('Criação de calendario de tarifas concluida.')
}