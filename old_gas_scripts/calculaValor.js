function calculaValor(request) {

  return (analisaConsultaValor(request.localConsulta,
    new Date(new Date(request.entradaDate).toDateString()),
    new Date(new Date(request.saidaDate).toDateString()),
    request.valorReferenciaPropriedade).valor);

}

function analisaConsultaValor(local, dataEntrada, dataSaida, valorDiaria) {

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
    "datasReserva": [],
  };
  if ((checarData(dataEntrada) == false || checarData(dataSaida) == false)) {
    result.status = "ERRO";
    result.message = "Datas inválidas";
    return JSON.stringify(result);
  }
  var _dataEntrada = dataEntrada;
  var _dataSaida = dataSaida;
  result.diasReserva = calculaDias(_dataEntrada, _dataSaida);
  if ((result.diasReserva == 0)) {
    result.status = "ERRO";
    result.message = "Dias de reserva = 0";
    return JSON.stringify(result);
  }
  // Faz e processa linhas de tarifas
  var primeiraLinha = ["Data", "Multiplicador", "Estadia"];
  for (linhaTemporada of rangeTemporada) {
    if (linhaTemporada[0] != local) continue;
    if (new Date(linhaTemporada[3]).getTime() < new Date(_dataEntrada).getTime()) continue;
    if (new Date(linhaTemporada[2]).getTime() > new Date(_dataSaida).getTime()) break;
    var dataInicio = new Date(linhaTemporada[2]);
    var dataTermino = new Date(linhaTemporada[3]);
    var dataTarifa = new Date(dataInicio);

    for (new Date(dataTarifa) == new Date(dataInicio);
      (new Date(dataTarifa).getTime() < new Date(_dataSaida).getTime() &&
        new Date(dataTarifa).getTime() <= new Date(dataTermino).getTime());
      dataTarifa.setDate(dataTarifa.getDate() + 1)) {
      if ((new Date(dataTarifa).getTime() < new Date(_dataEntrada).getTime())) continue;
      var subObjetoTarifa = {};
      subObjetoTarifa[primeiraLinha[0]] = dataTarifa.toISOString().split('T')[0];
      subObjetoTarifa[primeiraLinha[1]] = linhaTemporada[4];
      subObjetoTarifa[primeiraLinha[2]] = linhaTemporada[5];
      console.log(subObjetoTarifa);
      result.datasReserva.push(subObjetoTarifa);
      result.qtdDiasEspeciais = result.qtdDiasEspeciais + 1;
      result.valorDiasEspeciais = result.valorDiasEspeciais +
        (result.valorBasicoDiaria * Number(subObjetoTarifa.Multiplicador));
      if (subObjetoTarifa.Estadia > result.menorEstadiaPeriodo)
        result.menorEstadiaPeriodo = Number(subObjetoTarifa.Estadia);
    }
  }

  result.valorDiasNormais = result.valorBasicoDiaria * (result.diasReserva - result.qtdDiasEspeciais)
  result.valor = 0 + result.valorDiasEspeciais + result.valorDiasNormais;
  result.diasReserva = result.diasReserva.toString();
  result.valorDiasNormais = result.valorDiasNormais.toString();
  result.valorBasicoDiaria = result.valorBasicoDiaria.toString();
  result.qtdDiasEspeciais = result.qtdDiasEspeciais.toString();
  result.valorDiasEspeciais = result.valorDiasEspeciais.toString();
  result.menorEstadiaPeriodo = result.menorEstadiaPeriodo.toString();
  result.valor = result.valor.toString();
  if (result.diasReserva < result.menorEstadiaPeriodo[0]) {
    result.status = "INSUCESSO";
    result.message = "Estadia mínima é maior.";
    result.possibilidade = false;
  }
  return JSON.stringify(result);
}