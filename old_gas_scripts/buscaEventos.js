function buscaEventos(stringarrayCalendarios) {
/*
stringarrayCalendarios = JSON.stringify([{"idPropriedade":"ASB402","origem":"PROPRIO","urlCalendario":"https://calendar.google.com/calendar/embed?src=kg551duribv4e9kou2alfgt7h4%40group.calendar.google.com&ctz=America%2FFortaleza","icalId":"kg551duribv4e9kou2alfgt7h4@group.calendar.google.com"},{"idPropriedade":"ASB402","origem":"AIRBNB","urlCalendario":"https://www.airbnb.com.br/calendar/ical/30437706.ics?s=a9f0d0dbae41b1254ac25bda289ccec2","icalId":"bp1abi0h3oc4tnov4sqnrih0n14mip8g@import.calendar.google.com"}, {"idPropriedade":"ASB402","origem":"OUTRO","urlCalendario":"https://drive.google.com/uc?export=download&id=1bHCbAc2SyDv09G3jnvd6Pzqlw0KhR8Fo","icalId":""}]);
*/
  var arrayEventosSincronizar = [];
  var subObjetoEventos = {};
  var arrayCalendarios = JSON.parse(stringarrayCalendarios);

  // Ignora o calendario próprio
  for (i = 1; i < arrayCalendarios.length; i++) {
    var objCalendario = {}
    //    console.log(arrayCalendarios[i].urlCalendario)
    objCalendario["idPropriedade"] = arrayCalendarios[i].idPropriedade;
    objCalendario["origem"] = arrayCalendarios[i].origem;
    objCalendario["urlCalendario"] = arrayCalendarios[i].urlCalendario;
    geraArrayEventos(objCalendario)
  }
  // ASCENDING
  //  arrayEventosSincronizar.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))
  // DESCENDING
  arrayEventosSincronizar.sort((a, b) => (a.id > b.id) ? -1 : ((b.id > a.id) ? 1 : 0))

  var novoJsonEventos = JSON.stringify(arrayEventosSincronizar);
  console.log("Saida de busca eventos: ", novoJsonEventos);
  return novoJsonEventos;

  function geraArrayEventos(objCalendario) {
    if (!objCalendario.urlCalendario) return;

    var response = UrlFetchApp.fetch(objCalendario.urlCalendario, { muteHttpExceptions: true });
    if (response.getResponseCode() == 200) {
      var stringDeEventos = response.getBlob().getDataAsString();
      if (stringDeEventos.substr(0, 15) != 'BEGIN:VCALENDAR') return;
    }
    if (!stringDeEventos) return;
    for (var i = 1; i <= stringDeEventos.length; i++) {
      if (stringDeEventos.substr(i, 12) == 'BEGIN:VEVENT') {
        subObjetoEventos = {};
        subObjetoEventos.id = "";
        subObjetoEventos.origem = objCalendario.origem;
        subObjetoEventos.start = '';
        subObjetoEventos.end = '';
        subObjetoEventos.summary = ' ';
        subObjetoEventos.description = ``;
        subObjetoEventos.value = 0;
        subObjetoEventos.UID = '';
        subObjetoEventos.stamp = '';
        subObjetoEventos.colorId = 8;
        if (objCalendario.origem == 'OUTRO') subObjetoEventos.colorId = 1;
        if (objCalendario.origem == 'BOOKING') subObjetoEventos.colorId = 9;
        if (objCalendario.origem == 'AIRBNB') subObjetoEventos.colorId = 4;
        i = i + 12;
        continue;
      }
      if (stringDeEventos.substr(i, 8) == 'DTSTART:') {
        subObjetoEventos.start =
          (stringDeEventos.substr(i + 8, 4) + '-' +
            stringDeEventos.substr(i + 12, 2) + '-' +
            stringDeEventos.substr(i + 14, 2));
        i = i + 15;
        continue;
      }
      if (stringDeEventos.substr(i, 19) == 'DTSTART;VALUE=DATE:') {
        subObjetoEventos.start =
          (stringDeEventos.substr(i + 19, 4) + '-' +
            stringDeEventos.substr(i + 23, 2) + '-' +
            stringDeEventos.substr(i + 25, 2));
        i = i + 26;
        continue;
      }
      if (stringDeEventos.substr(i, 6) == 'DTEND:') {
        subObjetoEventos.end =
          (stringDeEventos.substr(i + 6, 4) + '-' +
            stringDeEventos.substr(i + 10, 2) + '-' +
            stringDeEventos.substr(i + 12, 2));
        i = i + 13;
        continue;
      }
      if (stringDeEventos.substr(i, 17) == 'DTEND;VALUE=DATE:') {
        subObjetoEventos.end =
          (stringDeEventos.substr(i + 17, 4) + '-' +
            stringDeEventos.substr(i + 21, 2) + '-' +
            stringDeEventos.substr(i + 23, 2));
        i = i + 24;
        continue;
      }
      if (stringDeEventos.substr(i, 8) == 'SUMMARY:') {
        var _finalSubstr = stringDeEventos.indexOf("\n", i);
        var _finalSubstrR = stringDeEventos.indexOf("\r", i);
        if (_finalSubstrR != -1) _finalSubstr = _finalSubstrR - 1;
        subObjetoEventos.summary = stringDeEventos.substring(i + 8, _finalSubstr).replace(/["'\\\n\r\t/{}[\]:,]/g, ' ');
        i = i + 8;
        continue;
      }
      if ((objCalendario.origem == 'OUTRO') &&
        (stringDeEventos.substr(i, 15) == 'DESCRIPTION:ID:')) {
        subObjetoEventos.summary = subObjetoEventos.summary + ' ' + stringDeEventos.substr(i + 16, 5).replace(/["'\\\n\r\t/{}[\]:,]/g, ' ');
        i = i + 15;
        continue;
      }
      if (stringDeEventos.substr(i, 12) == 'DESCRIPTION:') {
        var _finalSubstr = stringDeEventos.indexOf("\n", i);
        var _finalSubstrR = stringDeEventos.indexOf("\r", i);
        if (_finalSubstrR != -1) _finalSubstr = _finalSubstrR - 1;
        subObjetoEventos.description.descricao = stringDeEventos.substring(i + 12, _finalSubstr).replace(/["'\\\n\r\t/{}[\]:,]/g, ' ');
        i = i + 12;
        continue;
      }
      if (stringDeEventos.substr(i, 6) == 'VALUE:') {
        var _finalSubstr = stringDeEventos.indexOf("\n", i);
        subObjetoEventos.value = stringDeEventos.substring(i + 6, _finalSubstr);
        i = i + 6;
        continue;
      }
      if (stringDeEventos.substr(i, 4) == 'UID:') {
        var _finalSubstr = stringDeEventos.indexOf("\n", i);
        var _finalSubstrR = stringDeEventos.indexOf("\r", i);
        if (_finalSubstrR != -1) _finalSubstr = _finalSubstrR - 1;
        subObjetoEventos.UID = stringDeEventos.substring(i + 4, _finalSubstr)
        i = i + 4;
        continue;
      }
      if (stringDeEventos.substr(i, 8) == 'DTSTAMP:') {
        subObjetoEventos.stamp =
          (stringDeEventos.substr(i + 8, 4) + '-' +
            stringDeEventos.substr(i + 12, 2) + '-' +
            stringDeEventos.substr(i + 14, 2));
        i = i + 15;
        continue;
      }
      if (stringDeEventos.substr(i, 10) == 'END:VEVENT') {
        subObjetoEventos.id =
          objCalendario.idPropriedade.toLowerCase() +
          new Date(new Date(new Date(subObjetoEventos.start)).toISOString()).getTime().toString() +
          new Date(new Date(new Date(subObjetoEventos.end)).toISOString()).getTime().toString() +
          objCalendario.origem.toLowerCase();
        arrayEventosSincronizar.push(subObjetoEventos);
      }
      // Inserir o tratamento de inserção de dados nos eventos do BOOKING AIRBNB e OUTRO
      // Colocar conteúdo em Description, Summary e Value
    } // Encerra for do string de eventos 
  }
}