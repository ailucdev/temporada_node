// Sistema de reservas
// Luciano, 2020

function makeemailAtencao(linhaReserva) {
  // Prepara o subject e o corpo do email  
  corpoMensagem = '<!DOCTYPE html><html><head><base target="_top"></head><body><div style="text-align: center;' +
    'font-family: Arial;"><div id="center" style="width:300px;border: 2px dotted grey;background:' +
    '#ececec; margin:25px;margin-left:auto; margin-right:auto;padding:15px;"><div style=" border: 2px dotted grey;' +
    'background:white;margin-right:auto; margin-left:auto; padding:10px;"><h2>' +
      sheetReserva.getRange(linhaReserva, 2).getValue() +
      "</h2><br />" +
      'Nome: ' + sheetReserva.getRange(linhaReserva, 8).getValue() +
    "</h2><br />" +
    "</h2><br />" +
    'Período' +
    "<br />" +
    sheetReserva.getRange(linhaReserva, 4).getValue().toLocaleString().substr(0,10) + 
    ' a ' +
    sheetReserva.getRange(linhaReserva, 5).getValue().toLocaleString().substr(0,10) +
    "<br />" + 'Causa: ' + sheetReserva.getRange(linhaReserva, lastColumnReserva).getValue() +
    "<br />";
  return corpoMensagem;
}

function makeemailReservar(request) {
  // Prepara o subject e o corpo do email  
  request.subject =
    "Confirmada reserva código " +
    request.idConsulta +
    " de: " + request.dateString +
    " a " + request.datsString;

  request.message = '<!DOCTYPE html><html><head><base target="_top"></head><body><div style="text-align: center;' +
    'font-family: Arial;"><div id="center" style="width:300px;border: 2px dotted grey;background:' +
    '#ececec; margin:25px;margin-left:auto; margin-right:auto;padding:15px;"><img src="https://upload.' +
    "wikimedia.org/wikipedia/commons/thumb/6/69/Calendar_font_awesome.svg/512px-Calendar_font_awesome" +
    '.svg.png"width="180" style="margin:10px 0px"><br /><div style=" border: 2px dotted grey;' +
    'background:white;margin-right:auto; margin-left:auto; padding:10px;"><h2>' +
    request.nome +
    "</h2><br />" +
    'Período' +
    "<br />" +
    request.inicio + ' a ' + request.fim +
    "<br />" + 'VALOR: ' + request.valorLocacao + ' reais' +
    "<br />";
  return;
}
function makeEmailIndicar(request) {
  mensagemFormatada = '<!DOCTYPE html><html><head><base target="_top"></head><body><div style="text-align: center;' +
    'font-family: Arial;"><div id="center" style="width:300px;border: 2px dotted grey;background:' +
    '#ececec; margin:25px;margin-left:auto; margin-right:auto;padding:15px;"><img src="https://upload.' +
    "wikimedia.org/wikipedia/commons/thumb/6/69/Calendar_font_awesome.svg/512px-Calendar_font_awesome" +
    '.svg.png"width="180" style="margin:10px 0px"><br /><div style=" border: 2px dotted grey;' +
    'background:white;margin-right:auto; margin-left:auto; padding:10px;"><h2>' +
    "Olá... " +
    request.emailProprietarioConsulta +
    "</h2><h3>" +
    "<br />" +
    "Dados da indicação" +
    "</h3><br />" +
    "Entrada: " +
    request.date +
    "<br />" +
    "Saída: " +
    request.dats +
    "<br />" +
    "Valor: " +
    request.valorConsulta +
    "<br /></h3><br />";
  return mensagemFormatada;
}
function makeemailIndicante(request, mensagemFormatada) {
  mensagemFormatada = '<!DOCTYPE html><html><head><base target="_top"></head><body><div style="text-align: center;' +
    'font-family: Arial;"><div id="center" style="width:300px;border: 2px dotted grey;background:' +
    '#ececec; margin:25px;margin-left:auto; margin-right:auto;padding:15px;"><img src="https://upload.' +
    "wikimedia.org/wikipedia/commons/thumb/6/69/Calendar_font_awesome.svg/512px-Calendar_font_awesome" +
    '.svg.png"width="180" style="margin:10px 0px"><br /><div style=" border: 2px dotted grey;' +
    'background:white;margin-right:auto; margin-left:auto; padding:10px;"><h2>' +
    request.nomeAceitante +
    "</h2><h3>" +
    request.msg +
    "<br /><br/>" +
    request.dateString +
    "<br />" +
    request.datsString +
    "<br />" +
    request.diariasConsulta +
    "<br />" +
    request.valorAceito +
    "<br /></h3><br />" +
    'Aceitação';
}
