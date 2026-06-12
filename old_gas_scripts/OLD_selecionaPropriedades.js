function OLD_selecionaPropriedades(request, comando){
  var qtdPropriedadesExaminadas = 0;
  var qtdPropriedadesDisponiveis = 0;
  var qtdPropriedadesIndisponiveis = 0;
  var qtdPropriedadesIndicadas = 0;
  var qtdPropriedadesDesprezadas = 0;
  var qtdPropriedadesReservadas = 0;
  var qtdPropriedadesIndicante = 0;
  var qtdPropriedadesLocalDiferente = 0;
  var qtdPropriedadesValorIncompativel = 0;
  var qtdPropriedadesAndarIncompativel = 0;
  var qtdPropriedadesQuartosIncompativel = 0;    
  var qtdPropriedadesPosicaoIncompativel = 0;  
  var qtdPropriedadesProximidadeIncompativel = 0;
  var qtdPropriedadesDataIndisponivel = 0;
  var qtdPropriedadesSemCalendario = 0;
  var qtdPropriedadesComCalendario = 0;
  var propriedadesIndicadas = [];
  var propriedadesDisponiveis = [];
  sheetConsulta.getRange(mudouLinha, lastColumnConsulta).setValue('');
  for (var i = 2; i < lastRowPropriedade+1; i++) {  
    qtdPropriedadesExaminadas = qtdPropriedadesExaminadas + 1;
    if (request.localConsulta != sheetPropriedade.getRange(i, 6).getValue()) {qtdPropriedadesLocalDiferente = qtdPropriedadesLocalDiferente + 1; continue;}
//    if (request.emailProprietarioConsulta == sheetPropriedade.getRange(i, 4).getValue()){qtdPropriedadesIndicante = qtdPropriedadesIndicante + 1; continue;}
    if (request.valorConsulta < sheetPropriedade.getRange(i, 38).getValue()*(request.dats - request.date)/(1000*60*60*24)){
      qtdPropriedadesValorIncompativel = qtdPropriedadesValorIncompativel + 1; continue;}
    if (request.quartosConsulta != "" && request.quartosConsulta > sheetPropriedade.getRange(i, 10).getValue()){
      qtdPropriedadesQuartosIncompativel = qtdPropriedadesQuartosIncompativel + 1; continue;}
    if ((request.localConsulta == "AV") || (request.localConsulta == "MB")){
      if (request.andarConsulta == "Terreo" && sheetPropriedade.getRange(i, 8).getValue() != "101" && 
        sheetPropriedade.getRange(i, 8).getValue() != "102"){qtdPropriedadesAndarIncompativel = qtdPropriedadesAndarIncompativel + 1; continue;}
      if (request.andarConsulta == "Primeiro" && sheetPropriedade.getRange(i, 8).getValue() != "201" && 
        sheetPropriedade.getRange(i, 8).getValue() != "202"){qtdPropriedadesAndarIncompativel = qtdPropriedadesAndarIncompativel + 1; continue;}
      if (request.andarConsulta == "Segundo" && sheetPropriedade.getRange(i, 8).getValue() != "301" && 
        sheetPropriedade.getRange(i, 8).getValue() != "302"){qtdPropriedadesAndarIncompativel = qtdPropriedadesAndarIncompativel + 1; continue;}}
    if (request.localConsulta == "AV") {
      if ((request.posicaoConsulta != "") && 
          (sheetPropriedade.getRange(i, 7).getValue() <= "40") && 
        (request.posicaoConsulta == "NASCENTE")) {qtdPropriedadesPosicaoIncompativel = qtdPropriedadesPosicaoIncompativel + 1; continue;}
      if ((request.posicaoConsulta != "")  && 
          (sheetPropriedade.getRange(i, 7).getValue() >= "40") && 
        (request.posicaoConsulta == "POENTE" )) {qtdPropriedadesPosicaoIncompativel = qtdPropriedadesPosicaoIncompativel + 1; continue;}
      if ((request.proximidadeConsulta != "PRAIA") && 
          (sheetPropriedade.getRange(i, 7).getValue() <= "70") && 
        (sheetPropriedade.getRange(i, 7).getValue() >= "13") && 
          (request.proximidadeConsulta == "Praia")) {qtdPropriedadesProximidadeIncompativel = qtdPropriedadesProximidadeIncompativel + 1; continue;}}
    if (request.localConsulta == "AS") {
      if ((request.posicaoConsulta != "")  && 
          (request.posicaoConsulta != sheetConsulta.getRange(mudouLinha, 15).getValue())) {
        qtdPropriedadesPosicaoIncompativel = qtdPropriedadesPosicaoIncompativel + 1;continue;}}
    if (!sheetPropriedade.getRange(i, 1).getValue()) continue;
    var calendarPropriedade = CalendarApp.getCalendarsByName(sheetPropriedade.getRange(i, 1).getValue());
    if (calendarPropriedade.length == 0) {qtdPropriedadesSemCalendario = qtdPropriedadesSemCalendario + 1; continue;} 
    if (calendarPropriedade.length >= 1) {
      qtdPropriedadesComCalendario = qtdPropriedadesComCalendario + 1;
      calendarPropriedade = calendarPropriedade[0];
      if (calendarPropriedade.getEvents(request.date, request.dats).length >= 1) {qtdPropriedadesDataIndisponivel = qtdPropriedadesDataIndisponivel + 1; continue;}
    }   
    request.idPropriedade = sheetPropriedade.getRange(i, 1).getValue();
    qtdPropriedadesDisponiveis = qtdPropriedadesDisponiveis + 1;
    propriedadesDisponiveis.push(request.idPropriedade+" ");
    if (sheetConsulta.getRange(mudouLinha, lastColumnConsulta-1).getValue() == "INDICAR") {
      sheetConsulta.getRange(mudouLinha, 18).setValue('');
      sheetConsulta.getRange(mudouLinha, 19).setValue('');
      sheetConsulta.getRange(mudouLinha, lastColumnConsulta).setValue('');
      formaLink = "https://script.google.com/macros/s/AKfycby0IXDqSSmDpnsCMqaafr3fOzXh42DDXSWonnCsmQ/exec"+
        '?i'+request.idConsulta+
          '&p'+request.idPropriedade+
            '&c'+sheetPropriedade.getRange(i, 5).getValue()+
              '&e'+sheetPropriedade.getRange(i, 4).getValue();
      var mensagemFormatada=
          "Código indicação: " + 
            request.idConsulta + 
              "<br />" + 
                "Propriedade: " + 
                  request.idPropriedade + 
                    "<br />" + 
                      "Data entrada: " + 
                        request.dateString + 
                          "<br />" + 
                            "Data saída: " + 
                              request.datsString +
                                "<br />" + 
                                  "Para aceitar click no link: " + formaLink;
      
      MailApp.sendEmail({to: "airton.aragao@gmail.com", subject: "Indicação de hospedagem", htmlBody: mensagemFormatada});
      qtdPropriedadesIndicadas = qtdPropriedadesIndicadas + 1;}
  }  // Saida do for
  qtdPropriedadesIndisponiveis =
    qtdPropriedadesIndicante +
      qtdPropriedadesLocalDiferente +
        qtdPropriedadesValorIncompativel +
          qtdPropriedadesAndarIncompativel +
            qtdPropriedadesQuartosIncompativel +
              qtdPropriedadesPosicaoIncompativel +
                qtdPropriedadesProximidadeIncompativel +
                  qtdPropriedadesSemCalendario +
                    qtdPropriedadesDataIndisponivel;
  console.log("Examinadas: " + qtdPropriedadesExaminadas);
  console.log("Indicante: " + qtdPropriedadesIndicante);
  console.log("LocalDiferente: " + qtdPropriedadesLocalDiferente);
  console.log("ValorIncompativel: " + qtdPropriedadesValorIncompativel);
  console.log("AndarIncompativel: " +  qtdPropriedadesAndarIncompativel);
  console.log("QuartosIncompativel: " + qtdPropriedadesQuartosIncompativel);    
  console.log("PosicaoIncompativel: " + qtdPropriedadesPosicaoIncompativel);  
  console.log("ProximidadeIncompativel: " + qtdPropriedadesProximidadeIncompativel);
  console.log("DataIndisponivel: " + qtdPropriedadesDataIndisponivel);
  console.log("SemCalendario: " + qtdPropriedadesSemCalendario);
  console.log("Indisponiveis: " + qtdPropriedadesIndisponiveis);
  console.log("Disponiveis: " + qtdPropriedadesDisponiveis);
  console.log("Indicadas: " + qtdPropriedadesIndicadas);
  console.log("Desprezadas: " + qtdPropriedadesDesprezadas);
  console.log("Reservadas: " + qtdPropriedadesReservadas);
  console.log('Tamanho '+propriedadesDisponiveis.length); 
  console.log("Propriedades: " + [propriedadesDisponiveis]);
  sheetConsulta.getRange(mudouLinha, 20).setValue([propriedadesDisponiveis]);
  return propriedadesDisponiveis;
}