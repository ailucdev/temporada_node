function montaRetornoZap(comando, result) {
      console.log("No montaRetorno: ", comando, result.data);


  /*
    result =
      { "status": "200", "message": "Consulta realizada", "data": { "Reserva": [{ "idConsulta": "1777073424869", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "629,99", "valorPago": [{}], "nomeInteressado": "(Turismo) Monica Ferreira Dos Santos", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "12/06/2026", "saida": "14/06/2026", "idEvent": "asb40217812224000001781395200000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1780097421626", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "891", "valorPago": [{}], "nomeInteressado": "(Turismo) Júnior Oliveira", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "18/06/2026", "saida": "21/06/2026", "idEvent": "asb40217817408000001782000000000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1766014218020", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "2610", "valorPago": [{}], "nomeInteressado": "(Turismo) Barbara Parreira", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "01/07/2026", "saida": "07/07/2026", "idEvent": "asb40217828640000001783382400000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1780356626761", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "0", "valorPago": [{}], "nomeInteressado": "Reserve", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "05/07/2026", "saida": "08/07/2026", "idEvent": "asb40217832096000001783468800000airbnb", "idContact": "", "origem": "AIRBNB", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1780443023627", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "0", "valorPago": [{}], "nomeInteressado": "(Turismo) Elisabeth Quesada Aragão", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "05/07/2026", "saida": "08/07/2026", "idEvent": "asb40217832096000001783468800000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1778283034873", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "0", "valorPago": [{}], "nomeInteressado": "Reserve", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "09/07/2026", "saida": "12/07/2026", "idEvent": "asb40217835552000001783814400000airbnb", "idContact": "", "origem": "AIRBNB", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1780961429409", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "0", "valorPago": [{}], "nomeInteressado": "(Turismo) Elisabeth Quesada Aragão", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "09/07/2026", "saida": "12/07/2026", "idEvent": "asb40217835552000001783814400000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1778196627876", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "1260", "valorPago": [{}], "nomeInteressado": "(Turismo) Dias Keyla", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "13/07/2026", "saida": "16/07/2026", "idEvent": "asb40217839008000001784160000000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1775345422530", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "900", "valorPago": [{}], "nomeInteressado": "(Turismo) Karoline Oliveira Da Costa", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "17/07/2026", "saida": "19/07/2026", "idEvent": "asb40217842464000001784419200000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1780270232480", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "0", "valorPago": [{}], "nomeInteressado": "(Turismo) Elisabeth Quesada Aragão", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "19/07/2026", "saida": "24/07/2026", "idEvent": "asb40217844192000001784851200000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1768779020532", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "900", "valorPago": [{}], "nomeInteressado": "(Turismo) Lynardo Terencio Marques", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "24/07/2026", "saida": "26/07/2026", "idEvent": "asb40217848512000001785024000000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }, { "idConsulta": "1777937418073", "idPropriedade": "ASB402", "local": "AS", "valorLocacao": "1050", "valorPago": [{}], "nomeInteressado": "(Turismo) ANA PAULA GARCIA", "celularInteressado": "", "cpfInteressado": "", "emailInteressado": "", "pessoas": "", "entrada": "06/08/2026", "saida": "09/08/2026", "idEvent": "asb40217859744000001786233600000outro", "idContact": "", "origem": "OUTRO", "comando": "", "STATUS": "COBERTA" }], "Totais": [{ "idPropriedade": "TODAS", "Diarias": 0, "Reservas": 0, "Entradas": 0, "Estadias": 0, "Valor": 0, "Pago": 0 }] } }
    /*  
      result = {"status":"200","message":"Simulação OK","Resultado":{"disponibilidade":true,"valor":"4712","dataEntrada":"18/12/2026","dataSaida":"27/12/2026","menorEstadiaPeriodo":"4","datasEspeciaisReserva":[{"Data":"19/12/2026","Multiplicador":1.5,"Estadia":3},{"Data":"20/12/2026","Multiplicador":1.5,"Estadia":3},{"Data":"21/12/2026","Multiplicador":1.5,"Estadia":3},{"Data":"22/12/2026","Multiplicador":1.5,"Estadia":3},{"Data":"23/12/2026","Multiplicador":1.5,"Estadia":3},{"Data":"24/12/2026","Multiplicador":1.5,"Estadia":3},{"Data":"25/12/2026","Multiplicador":1.5,"Estadia":3},{"Data":"26/12/2026","Multiplicador":1.5,"Estadia":3},{"Data":"27/12/2026","Multiplicador":2.5,"Estadia":4}],"diasReserva":"9","valorDiasNormais":"0","qtdDiasEspeciais":"9","valorDiasEspeciais":"4712.5","valorBasicoDiaria":"325","taxaLimpeza":"60","taxaEnxoval":"0","taxaEnergia":"0","possibilidade":true}}
      
  //   comando = "LISTAR"
      //  comando = "SIMULAR"
      */

  if (result.status != "200") {
    return `❌ ${result.message}`;
  }

  switch (comando) {
    case "LISTAR":
      console.log(formataListar(result.data));
      return formataListar(result.data);
    case "SIMULAR":
      return formataSimulacao(result.data);
    case "SINCRONIZAR":
      return formataSincronizacao(result.data);
    case "RESERVAR":
      return formataReserva(result.data);
    case "CANCELAR":
      return formataCancelamento(result.data);
    case "SOMAR":
      return formataSomatorio(result.data);
    default:
      return result.message;
  }

  function formataListar(data) {
    const nomeAba =
      Object.keys(data)
        .find(k => k !== "Totais");
    const registros = data[nomeAba];
    let texto = `🗓️ ${nomeAba}s\n`;
    registros.forEach(r => {
      texto += formataLinhaReserva(r);
      //      texto += "\n────────────────\n";
    });
    return texto.trim();
  }

  function formataLinhaReserva(r) {
    return `
👤 ${r.nomeInteressado}
${r.entrada} a ${r.saida} 💰 ${r.valorLocacao}`;
  }

  function formataSimulacao(data) {
    return `
🏠 ${data.idPropriedade}
${data.entrada} a ${data.saida}
🌙 ${data.diarias} diárias
💰 Valor da locação:
${data.valorLocacao}
✅ Disponível para reserva
`.trim();
  }

  function formataSincronizacao(data) {
    return `
🏠 ${data.idPropriedade}
${data.entrada} a ${data.saida}
🌙 ${data.diarias} diárias
💰 Valor da locação:
${data.valorLocacao}
✅ Disponível para reserva
`.trim();
  }

  function formataReserva(data) {
    return `
✅ Reserva criada
🏠 ${data.idPropriedade}
👤 ${data.nomeInteressado}
${data.entrada} a ${data.saida}
💰 Valor:
${data.valorLocacao}
🆔 ${data.idConsulta}
`.trim();
  }

  function formataCancelamento(data) {
    return `
❌ Reserva cancelada
🏠 ${data.idPropriedade}
👤 ${data.hospede}
${data.entrada} a ${data.saida}
🆔 ${data.idConsulta}
`.trim();
  }

  function formataSomatorio(data) {
    if (!data.Totais || data.Totais.length === 0) {
      return "Nenhum total encontrado";
    }
    let texto =
      "📊 RESUMO\n\n";
    data.Totais.forEach(t => {
      texto +=
        `🏠 ${t.idPropriedade}\n`;
      if (t.Reservas !== undefined)
        texto += `📅 Reservas: ${t.Reservas}\n`;
      if (t.Estadias !== undefined)
        texto += `🛏️ Estadias: ${t.Estadias}\n`;
      texto += `🌙 Diárias: ${t.Diarias}\n`;
      texto += `💰 Valor: R$ ${t.Valor.toFixed(2)}\n`;
      texto += `💵 Pago: R$ ${t.Pago.toFixed(2)}\n\n`;
    });
    return texto.trim();
  }
}
