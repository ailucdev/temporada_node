function OLD_criaJsonTemporadas() {

  var primeiraLinha = ["Data", "Multiplicador", "Estadia"];
  for (var linhaPropriedade = 2; linhaPropriedade <= lastRowPropriedade; linhaPropriedade++) {
    var arrayDeObjetos = [];
    var local = sheetPropriedade.getRange(linhaPropriedade, 6).getValue();
    for (var linhaTemporada = 2; linhaTemporada <= lastRowTemporada; linhaTemporada++) {
      if (sheetTemporada.getRange(linhaTemporada, 1).getValue() != local) continue;
      if (new Date(sheetTemporada.getRange(linhaTemporada, 3).getValue()).getTime() < new Date().getTime()) continue;
      var dataInicio = new Date(sheetTemporada.getRange(linhaTemporada, 3).getValue());
      var dataTermino = new Date(sheetTemporada.getRange(linhaTemporada, 4).getValue());
      var dataTarifa = new Date(dataInicio);
      while (new Date(dataTarifa).getTime() <= new Date(dataTermino).getTime()) {
        var subObjeto = {};
        subObjeto[primeiraLinha[0]] = dataTarifa.toISOString().split('T')[0];
        subObjeto[primeiraLinha[1]] = sheetTemporada.getRange(linhaTemporada, 5).getValue();
        subObjeto[primeiraLinha[2]] = sheetTemporada.getRange(linhaTemporada, 6).getValue();
        arrayDeObjetos.push(subObjeto);
        dataTarifa.setDate(dataTarifa.getDate() + 1)
      }
    }
    var novoJson = JSON.stringify(arrayDeObjetos);
    sheetPropriedade.getRange(linhaPropriedade, 33).setValue(novoJson);
  }
  console.log('Encerrada criação de jsons de temporadas nas propriedades');
}
