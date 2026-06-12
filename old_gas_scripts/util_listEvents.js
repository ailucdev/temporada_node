function listEvents() {

//  var inicioPeriodo = new Date(2025-07-15);
  var inicioPeriodo = criarDataComFusoBrasileiro("25", "08", "2025");;
  inicioPeriodo.setDate(inicioPeriodo.getDate() + 1);
  console.log(inicioPeriodo)
  var finalPeriodo = new Date();
  finalPeriodo = new Date(new Date(finalPeriodo).toDateString());
  finalPeriodo.setFullYear(inicioPeriodo.getFullYear() + 2);
  console.log(finalPeriodo)
  const query = Calendar.Events.list('1b5caffe2085b8ef20ae34681e97c0c49925e638a7c30a91b505cd182b60b5c3@group.calendar.google.com',
  // const query = Calendar.Events.list('n648gtss6g2ong7l4v2nlhuncc@group.calendar.google.com',// MB07101
  // var query = Calendar.Events.list('6ikibrpt70qbpovtp4snhtekes@group.calendar.google.com', // AV80101
  // var query = Calendar.Events.list('kg551duribv4e9kou2alfgt7h4@group.calendar.google.com', // ASB402
  // var query = Calendar.Events.list('1b5caffe2085b8ef20ae34681e97c0c49925e638a7c30a91b505cd182b60b5c3@group.calendar.google.com', 
  {
    singleEvents: true,
    showDeleted: true,
    "timeMin": inicioPeriodo.toISOString(),
    "timeMax": finalPeriodo.toISOString(),
    orderBy: 'startTime'
  });
  console.log('Eventos: %s', query.items.length);
  for (const event of query.items) {
    Logger.log('(INICIO: %s) (FIM: %s) (Sumario: %s) (Descrição: %s) (Id: %s) (Cor: %s)',
      event.start, event.end, event.summary, event.description, event.id, event.colorId);
  }
}
