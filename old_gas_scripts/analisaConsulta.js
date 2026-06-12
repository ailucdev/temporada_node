function analisaConsulta(idPropriedade, calendarioProprio, calendarioPeriodosEspeciais, dataEntrada, dataSaida, valorDiaria) {
/*
  var idPropriedade = "MB07101"
  var dataEntrada = "15/12/2025"
  var dataSaida = "24/12/2025";
  var valorDiaria = 300
  calendarioPeriodosEspeciais = "1b5caffe2085b8ef20ae34681e97c0c49925e638a7c30a91b505cd182b60b5c3@group.calendar.google.com";
  // calendarioProprio = "kg551duribv4e9kou2alfgt7h4@group.calendar.google.com"; // AV80101
  calendarioProprio = "n648gtss6g2ong7l4v2nlhuncc@group.calendar.google.com"; // MB07101
  const [diaE, mesE, anoE] = dataEntrada.split('/').map(Number);
  dataEntrada = dataEntrada = criarDataComFusoBrasileiro(diaE, mesE, anoE);
  const [diaS, mesS, anoS] = dataSaida.split('/').map(Number);
  dataSaida = dataSaida = criarDataComFusoBrasileiro(diaS, mesS, anoS);
  console.log(dataEntrada, dataSaida)
*/
  var result = {
    "status": "SUCESSO",
    "message": "Simulação OK",
    "disponibilidade": true,
    "possibilidade": true,
    "dataEntrada": dataEntrada,
    "dataSaida": dataSaida,
    "diasReserva": 0,
    "valorBasicoDiaria": Number(valorDiaria),
    "valorDiasNormais": 0,
    "qtdDiasEspeciais": 0,
    "valorDiasEspeciais": 0,
    "valor": 0,
    "menorEstadiaPeriodo": 2,
    "datasEspeciaisReserva": [],
  };
  if ((checarData(dataEntrada) == false || checarData(dataSaida) == false)) {
    result.status = "ERRO DE DATA";
    result.message = "Datas inválidas" + dataEntrada + " _ " + dataSaida;
    return JSON.stringify(result);
  }
  result.diasReserva = calculaDias(dataEntrada, dataSaida);
  if ((result.diasReserva == 0)) {
    result.status = "ERRO DE DIAS";
    result.message = "Dias de reserva = 0";
    return JSON.stringify(result);
  }

  dataEntrada.setHours(0, 0, 0, 0);
  dataSaida.setHours(0, 0, 0, 0,);

  //  let calendarioPeriodosEspeciais = "1b5caffe2085b8ef20ae34681e97c0c49925e638a7c30a91b505cd182b60b5c3@group.calendar.google.com";

  query = Calendar.Events.list(calendarioPeriodosEspeciais, {
    "timeMin": dataEntrada.toISOString(), "timeMax": dataSaida.toISOString(),
    singleEvents: true, orderBy: 'startTime'
  });

  for (const event of query.items) {
    //    Logger.log('(INICIO: %s) (FIM: %s) (Sumario: %s) (Descrição: %s) (Id: %s) (Cor: %s)',
    //      event.start, event.end, event.summary, event.description, event.id, event.colorId);

    var dataInicio = new Date(event.start.date);
    var dataTermino = new Date(event.end.date);
    var dataTarifa = new Date(event.start.date);
    if (dataTermino.getTime() < dataEntrada.getTime()) continue;
    if (dataInicio.getTime() >= dataSaida.getTime()) break;
    for (dataTarifa == dataInicio; dataTarifa.getTime() < dataSaida.getTime(); dataTarifa.setDate(dataTarifa.getDate() + 1)) {
      if (dataTarifa.getTime() < dataEntrada.getTime()) continue;
      if (dataTarifa.getTime() >= dataTermino.getTime()) break;
      var subObjetoTarifa = {};
      var dataNoPeriodo = dataTarifa.toISOString().split('T')[0].substring(8, 10) + "/" +
        dataTarifa.toISOString().split('T')[0].substring(5, 7) + "/" +
        dataTarifa.toISOString().split('T')[0].substring(0, 4);
      var jsonDescription = JSON.parse(event.description);
      subObjetoTarifa["Data"] = dataNoPeriodo;
      subObjetoTarifa["Multiplicador"] = jsonDescription.multiplicador;
      subObjetoTarifa["Estadia"] = jsonDescription.estadiaMinima;
      result.datasEspeciaisReserva.push(subObjetoTarifa);
      result.qtdDiasEspeciais = result.qtdDiasEspeciais + 1;
      result.valorDiasEspeciais = result.valorDiasEspeciais +
        (result.valorBasicoDiaria * Number(subObjetoTarifa.Multiplicador));
      if (subObjetoTarifa.Estadia > result.menorEstadiaPeriodo)
        result.menorEstadiaPeriodo = Number(subObjetoTarifa.Estadia);
    }
  }

  result.valorDiasNormais = Math.trunc(result.valorBasicoDiaria * (result.diasReserva - result.qtdDiasEspeciais));
  result.valor = Math.trunc(0 + result.valorDiasEspeciais + result.valorDiasNormais);
  result.diasReserva = result.diasReserva.toString();
  result.valorDiasNormais = result.valorDiasNormais.toString();
  result.valorBasicoDiaria = result.valorBasicoDiaria.toString();
  result.qtdDiasEspeciais = result.qtdDiasEspeciais.toString();
  result.valorDiasEspeciais = result.valorDiasEspeciais.toString();
  result.menorEstadiaPeriodo = result.menorEstadiaPeriodo.toString();
  result.valor = result.valor.toString();
  if (result.diasReserva < Number(result.menorEstadiaPeriodo[0])) {
    result.status = "INSUCESSO";
    result.message = "Estadia mínima é maior.";
    result.possibilidade = false;
  }
  queryDisponibilidade = Calendar.Events.list(calendarioProprio, {
    "timeMin": dataEntrada.toISOString(), "timeMax": dataSaida.toISOString(),
    singleEvents: true
  });

  if (queryDisponibilidade.items.length >= 1) result.disponibilidade = false;
  console.log(query.items.length, queryDisponibilidade.items.length, JSON.stringify(result));
  return JSON.stringify(result);
}