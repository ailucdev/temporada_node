function geraAutorizacao(request) {

  var dataentradaformatada = Utilities.formatDate(request.entradaDate, "GMT", "dd/MM/yyyy");
  var datasaidaformatada = Utilities.formatDate(request.saidaDate, "GMT", "dd/MM/yyyy");

// Modificar para pegar do registro das propriedades

  var templateId = "1ypz0JszS1OffV7-aEOJ1Lt0UIsqZH-vSL_gJbKevACE"
  if (request.idPropriedade == "AV80101") { var templateId = "1ypz0JszS1OffV7-aEOJ1Lt0UIsqZH-vSL_gJbKevACE" };
  if (request.idPropriedade == "MB06101") { var templateId = "1THSVBjo1oejvEE7h1y6EIbNNcuSCzMgay9WEfBUv7Pc" };
  if (request.idPropriedade == "MB07101") { var templateId = "1THSVBjo1oejvEE7h1y6EIbNNcuSCzMgay9WEfBUv7Pc" };
  if (request.idPropriedade == "MB06201") { var templateId = "1THSVBjo1oejvEE7h1y6EIbNNcuSCzMgay9WEfBUv7Pc" };
  var autorizaDoc = 'Autorização: Bloco ' + (request.idPropriedade.substr(2, 2) + '_' + (request.idPropriedade.substr(4, 3))) + ' de ' + dataentradaformatada + ' a ' + datasaidaformatada;

  // Cria a nova autorização, recupera o ID e abre
  var idCopia = DriveApp.getFileById(templateId).makeCopy(autorizaDoc).getId();
  var docCopia = DocumentApp.openById(idCopia);

  // Recupera o corpo do documento criado
  var bodyCopia = docCopia.getActiveSection();
  console.log('VAI FAZER O REPLACE');
  console.log('Data formatada:' + dataentradaformatada);
  // faz o replace das variáveis do template, salva e fecha o documento temporario
  bodyCopia.replaceText("@bloco@", (request.idPropriedade.substr(2, 2) + '/' + (request.idPropriedade.substr(4, 3))));
  bodyCopia.replaceText("@entrada@", dataentradaformatada);
  bodyCopia.replaceText("@saida@", datasaidaformatada);
  bodyCopia.replaceText("@proprietario@", 'Airton LUCIANO Aragão');
  bodyCopia.replaceText("@hospede@", request.nomeInteressadoConsulta);
  bodyCopia.replaceText("@celular@", request.celularInteressadoConsulta);
  bodyCopia.replaceText("@email@", request.emailInteressadoConsulta);
  bodyCopia.replaceText("@endereco@", request.endereco + ', ' + request.bairro + ', ' + request.cep + ', ' + request.cidade + ', ' + request.uf);
  bodyCopia.replaceText("@cpf@", request.idInteressadoConsulta);
  bodyCopia.replaceText("@placa1@", request.veiculo1);
  bodyCopia.replaceText("@placa2@", request.veiculo2);
  bodyCopia.replaceText("@acompanhante01@", request.acompanhante1);
  bodyCopia.replaceText("@acompanhante02@", request.acompanhante2);
  bodyCopia.replaceText("@acompanhante03@", request.acompanhante3);
  bodyCopia.replaceText("@acompanhante04@", request.acompanhante4);
  bodyCopia.replaceText("@acompanhante05@", request.acompanhante5);
  bodyCopia.replaceText("@acompanhante06@", request.acompanhante6);
  bodyCopia.replaceText("@acompanhante07@", request.acompanhante7);
  bodyCopia.replaceText("@crianca01@", request.crianca1);
  bodyCopia.replaceText("@crianca02@", request.crianca2);
  bodyCopia.replaceText("@crianca03@", request.crianca3);
  bodyCopia.replaceText("@crianca04@", request.crianca4);
  bodyCopia.replaceText("@crianca05@", request.crianca5);
  bodyCopia.replaceText("@crianca06@", request.crianca6);
  bodyCopia.replaceText("@crianca07@", request.crianca7);
  bodyCopia.replaceText("@data@", dataentradaformatada);

  console.log('VAI SALVAR O DOCUMENTO');
  // Salva o novo documento
  docCopia.saveAndClose();
  // Get the name of the document to use as an email subject line.
  var subject = docCopia.getName();
  // abre o documento temporario como PDF utilizando o seu ID
  var pdf = DriveApp.getFileById(idCopia).getAs("application/pdf");
  // Get the URL of the document.  
  var url = docCopia.getUrl();
  // Append a new string to the "url" variable to use as an email body.
  var body = 'Acesse a autorização: ' + url;
  // Send yourself an email with a link to the document.
  console.log('VAI MANDAR O EMAIL');
  MailApp.sendEmail('airtonaragao@gmail.com', subject, body, { name: request.emailInteressado, attachments: pdf });
}
