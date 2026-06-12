function mandaemailErro(mensagem) {

  MailApp.sendEmail({
    to: 'airtonaragao@gmail.com',
//    cc: _emailInteressado,
    subject: "Erro na aplicação",
    body: mensagem
  });

}
