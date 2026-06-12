function formataData(dataFormatar) {
  var dataFormatada = ("0" +
    dataFormatar.getDate()).slice(-2) + "/" +
    ("0" + (dataFormatar.getMonth() + 1)).slice(-2) + "/" +
    dataFormatar.getFullYear();
  return dataFormatada;
}
