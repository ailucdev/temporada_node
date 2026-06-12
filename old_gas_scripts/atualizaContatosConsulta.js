function atualizaContatosConsulta(request) {

  if ((!request.celularInteressadoConsulta) && (!request.idInteressadoConsulta)) return;
  var group = ContactsApp.getContactGroup('As reservas');
  if (request.celularInteressadoConsulta) {
    var contactsByCelular = ContactsApp.getContactsByPhone(request.celularInteressadoConsulta);
    if (contactsByCelular.length >= 1) {
      group.addContact(contactsByCelular[0]);
      request.idInteressadoConsulta = contactsByCelular[0].getId();
      sheetConsulta.getRange(mudouLinha, 7).setValue(request.idInteressadoConsulta);
    }
    return;
  }
  if (request.idInteressadoConsulta) {
    var contactById = ContactApp.getContactById(request.idInteressadoConsulta);
    if (contactById) {
      var celularContato = contactById.getPhones(ContactsApp.Field.MOBILE_PHONE);
      group.addContact(contato);
      request.celularInteressadoConsulta = celularContato;
      sheetConsulta.getRange(mudouLinha, 9).setValue(celularContato);
    }
    return;
  }
  if ((contactsByCelular.length == 0) && (!request.idInteressadoConsulta)) {
    var contato = ContactsApp.createContact(request.nomeInteressadoConsulta, request.emailInteressadoConsulta);
    var phone = contato.addPhone(ContactsApp.Field.MOBILE_PHONE, request.celularInteressadoConsulta);
    group.addContact(contato);
    request.idInteressadoConsulta = contato.getId();
    sheetConsulta.getRange(mudouLinha, 7).setValue(request.idInteressadoConsulta);
    return;
  }
}
