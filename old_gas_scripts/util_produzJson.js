function produzJson(titulosColunas, dadosColunas, planilha) {
  var subObjeto = {};
  for (var numeroColuna = 0; numeroColuna < titulosColunas.length - 1; numeroColuna++) {
    if (titulosColunas[0, numeroColuna] == "") continue;
    subObjeto[titulosColunas[0, numeroColuna]] = dadosColunas[numeroColuna];
    if ((planilha == "Reserva" || planilha == "Estadia") && numeroColuna == 6 && subObjeto[titulosColunas[0, numeroColuna]] != "")
      subObjeto[titulosColunas[0, numeroColuna]] = JSON.parse(subObjeto[titulosColunas[0, numeroColuna]]);
  }
  return subObjeto;
}
