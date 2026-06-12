function requestConsulta() {
  
  let codigoConsulta = sheetConsulta.getRange(mudouLinha, 1).getValue();
  if (!sheetConsulta.getRange(mudouLinha, 1).getValue()) {
    codigoConsulta = new Date().getTime().toString();
    sheetConsulta.getRange(mudouLinha, 1).setValue(codigoConsulta);
  }
  this.idConsulta = codigoConsulta;

  this.idPropriedade = sheetConsulta.getRange(mudouLinha, 2).getValue();
  if (!sheetConsulta.getRange(mudouLinha, 3).getValue()) {
    sheetConsulta.getRange(mudouLinha, 3).setValue(this.idPropriedade.substr(0, 2));
  }
  for (var p = 2; p <= lastRowPropriedade; p++) {
    if (this.idPropriedade == sheetPropriedade.getRange(p, 1).getValue()) {
      this.linhaPropriedade = p;
      this.valorLimpezaPropriedade = sheetPropriedade.getRange(p, 16).getValue();
      this.valorEnxovalPropriedade = sheetPropriedade.getRange(p, 18).getValue();
      this.valorReferenciaPropriedade = sheetPropriedade.getRange(p, 37).getValue();
      this.stringCalendarios = sheetPropriedade.getRange(p, 32).getValue();
      break;
    }
    if (p == lastRowPropriedade) throw (request.idPropriedade, 'Montando Request');
  }
  this.localConsulta = sheetConsulta.getRange(mudouLinha, 3).getValue();

  this.entradaDate = new Date(sheetConsulta.getRange(mudouLinha, 4).getValue());
  this.saidaDate = new Date(sheetConsulta.getRange(mudouLinha, 5).getValue());
  this.dateString = (this.entradaDate.getDate() + '/' + (this.entradaDate.getMonth() + 1) + '/' + this.entradaDate.getFullYear());
  this.datsString = (this.saidaDate.getDate() + '/' + (this.saidaDate.getMonth() + 1) + '/' + this.saidaDate.getFullYear());

  this.valorConsulta = sheetConsulta.getRange(mudouLinha, 6).getValue();
  this.valorPagoConsulta = sheetConsulta.getRange(mudouLinha, 7).getValue();
  this.nomeInteressadoConsulta = sheetConsulta.getRange(mudouLinha, 8).getValue();
  this.celularInteressadoConsulta = sheetConsulta.getRange(mudouLinha, 9).getValue();
  this.idInteressadoConsulta = sheetConsulta.getRange(mudouLinha, 10).getValue();
  this.emailInteressadoConsulta = sheetConsulta.getRange(mudouLinha, 11).getValue();
  this.pessoasConsulta = sheetConsulta.getRange(mudouLinha, 12).getValue();
  this.quartosConsulta = sheetConsulta.getRange(mudouLinha, 13).getValue();
  this.andarConsulta = sheetConsulta.getRange(mudouLinha, 14).getValue();
  this.posicaoConsulta = sheetConsulta.getRange(mudouLinha, 15).getValue();
  this.proximidadeConsulta = sheetConsulta.getRange(mudouLinha, 16).getValue();
  this.emailProprietarioConsulta = sheetConsulta.getRange(mudouLinha, 17).getValue();
  this.emailAceitanteConsulta = sheetConsulta.getRange(mudouLinha, 18).getValue();
  this.celularProprietarioConsulta = sheetConsulta.getRange(mudouLinha, 19).getValue();
  this.endereco = sheetConsulta.getRange(mudouLinha, 21).getValue();
  this.bairro = sheetConsulta.getRange(mudouLinha, 22).getValue();
  this.cep = sheetConsulta.getRange(mudouLinha, 23).getValue();
  this.cidade = sheetConsulta.getRange(mudouLinha, 24).getValue();
  this.uf = sheetConsulta.getRange(mudouLinha, 25).getValue();
  this.veiculo1 = sheetConsulta.getRange(mudouLinha, 26).getValue();
  this.acompanhante1 = sheetConsulta.getRange(mudouLinha, 28).getValue();
  this.idEvent = sheetConsulta.getRange(mudouLinha, 42).getValue();
  this.idContact = sheetConsulta.getRange(mudouLinha, 43).getValue();
  this.limpezaEntradaEstadia = sheetConsulta.getRange(mudouLinha, 44).getValue();
  this.enxovalEstadia = sheetConsulta.getRange(mudouLinha, 45).getValue();
  this.energiaEstadia = sheetConsulta.getRange(mudouLinha, 46).getValue();
  this.autorizacaoEstadia = sheetConsulta.getRange(mudouLinha, 47).getValue();
  this.ocupacaoEstadia = sheetConsulta.getRange(mudouLinha, 48).getValue();
  this.limpezaSaidaEstadia = sheetConsulta.getRange(mudouLinha, 49).getValue();
  this.idOrigem = sheetConsulta.getRange(mudouLinha, 50).getValue();
  this.status = sheetConsulta.getRange(mudouLinha, lastColumnConsulta).getValue();
}