function comparaDatas(dataInicial, dataFinal) {

  var dataIstring = ("0" + dataInicial.getDate()).slice(-2) + "/" + ("0" + (dataInicial.getMonth() + 1)).slice(-2) + "/" +
    dataInicial.getFullYear();

  var dataFstring = ("0" + dataFinal.getDate()).slice(-2) + "/" + ("0" + (dataFinal.getMonth() + 1)).slice(-2) + "/" +
    dataFinal.getFullYear();

  var dataInicialyyyymmdd = dataIstring.substr(6, 4) + '/' + dataIstring.substr(3, 2) + '/' + dataIstring.substr(0, 2);
  var dataFinalyyyymmdd = dataFstring.substr(6, 4) + '/' + dataFstring.substr(3, 2) + '/' + dataFstring.substr(0, 2);

  if (new Date(dataInicialyyyymmdd).getTime() < new Date(dataFinalyyyymmdd).getTime()) return 'OK';
  if (new Date(dataInicialyyyymmdd).getTime() >= new Date(dataFinalyyyymmdd).getTime()) return 'NOK';

}
