function getInfoAba(planilha, idPropriedade) {

  const ss = SpreadsheetApp.openById("1E1rOxTtom-sFOUCQZoy4h2bLX9oEKNpalEHx_GsaohU");
/*  
  let nomePlanilha = planilha + "_"+ idPropriedade;
  if (planilha == "Propriedade") nomePlanilha = "Propriedade";
  if (idPropriedade == "TODAS") nomePlanilha = "Propriedade";
  let sheetDados = ss.getSheetByName(nomePlanilha);
*/
  let nomePlanilha = planilha;
  let sheetDados = ss.getSheetByName(nomePlanilha);
  if (!sheetDados) return null;

  const lastRowDados = sheetDados.getLastRow();
  const lastColumnDados = sheetDados.getLastColumn();
  const rangeDados = sheetDados.getRange(1, 1, lastRowDados, lastColumnDados).getDisplayValues();
  const titulosColunasDados = rangeDados[0];
  const arrayIdConsulta = rangeDados.slice(1).map(linha => linha[0]);
  const arrayIdPropriedadeDados = rangeDados.slice(1).map(linha => linha[1]);
  const arrayIdEventDados = rangeDados.slice(1).map(linha => linha[41]);
  const rangeJson = sheetDados.getRange(2, lastColumnDados, lastRowDados, 1).getDisplayValues().flat();

  return {
    nomePlanilha: nomePlanilha,
    sheetDados: sheetDados,
    rangeDados: rangeDados,
    lastRowDados: lastRowDados,
    lastColumnDados: lastColumnDados,
    titulosColunasDados: titulosColunasDados,
    arrayIdConsulta: arrayIdConsulta,
    arrayIdPropriedadeDados: arrayIdPropriedadeDados,
    arrayIdEventDados: arrayIdEventDados,
    rangeJson: rangeJson 
  };
}