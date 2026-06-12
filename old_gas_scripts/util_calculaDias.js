function calculaDias(dataInicial, dataFinal) {

var dataIstring = ("0" + dataInicial.getDate()).slice(-2) + "/" + ("0" + (dataInicial.getMonth() + 1)).slice(-2) + "/" +
    dataInicial.getFullYear();

var dataFstring = ("0" + dataFinal.getDate()).slice(-2) + "/" + ("0" + (dataFinal.getMonth() + 1)).slice(-2) + "/" +
    dataFinal.getFullYear();

var dataInicialyyyymmdd = dataIstring.substr(6, 4) + '/' + dataIstring.substr(3, 2) + '/' + dataIstring.substr(0, 2);
var dataFinalyyyymmdd = dataFstring.substr(6, 4) + '/' + dataFstring.substr(3, 2) + '/' + dataFstring.substr(0, 2);

var daysDif = new Date(dataFinalyyyymmdd).getTime() - new Date(dataInicialyyyymmdd).getTime();
var diasDif = Math.ceil(daysDif / (1000 * 3600 * 24));

return diasDif;

      /* outra técnica
            var getYear = objetoReserva.start.toLocaleString("default", { year: "numeric" });
            var getMonth = objetoReserva.start.toLocaleString("default", { month: "2-digit" });
            var getDay = objetoReserva.start.toLocaleString("default", { day: "2-digit" });
            var rangeCobertoStart = getYear + "-" + getMonth + "-" + getDay;
            var getYear = objetoReserva.end.toLocaleString("default", { year: "numeric" });
            var getMonth = objetoReserva.end.toLocaleString("default", { month: "2-digit" });
            var getDay = objetoReserva.end.toLocaleString("default", { day: "2-digit" });
            var rangeCobertoEnd = getYear + "-" + getMonth + "-" + getDay;
      */


}
