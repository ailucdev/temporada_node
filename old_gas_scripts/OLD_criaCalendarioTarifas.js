function OLD_criaCalendarioTarifas() {
  var dataStartPeriodo = '';
  var dataEndPeriodo = '';
  for (var p = 2; p <= lastRowPropriedade; p++) {
    for (var j = 2; j <= lastRowTarifas - 280; j++) {
      for (var i = 2; i <= lastColumnTarifas; i = i + 6) {
        if (sheetTarifas.getRange(1, i).getValue() == sheetPropriedade.getRange(p, 1).getValue()) {
          var dataTarifa =
            new Date(rangeTarifas[j - 2][0].substr(6, 4) + '/'
              + rangeTarifas[j - 2][0].substr(3, 2) + '/'
              + rangeTarifas[j - 2][0].substr(0, 2));
          var multiplicador = parseInt(rangeTarifas[j - 2][i - 1]) / parseInt(sheetPropriedade.getRange(p, 37).getValue());
          if (multiplicador > 1) {
            if (!dataStartPeriodo) dataStartPeriodo = dataTarifa;
            if (dataStartPeriodo) dataEndPeriodo = dataTarifa;
            var fatorMultiplicador = multiplicador;  
          }
          if ((multiplicador == 1) && (dataStartPeriodo) && (dataEndPeriodo)) {
            var _idCalendario = sheetPropriedade.getRange(p, 26).getValue();
            var _calendarPropriedade = CalendarApp.getCalendarById(_idCalendario);
            dataEndPeriodo.setDate(dataEndPeriodo.getDate() + 1);
            var event = _calendarPropriedade.createAllDayEvent
              ('TARIFA', dataStartPeriodo, dataEndPeriodo, { location: fatorMultiplicador.toString(), guests: '', sendInvites: false });
            fatorMultiplicador = 1;
            dataStartPeriodo = '';
            dataEndPeriodo = '';
          }
        }
      }
    }
  }
}