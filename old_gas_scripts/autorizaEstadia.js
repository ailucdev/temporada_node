function autorizaEstadia(request) {
  if (!request.nomeInteressadoConsulta) return "SEM RESPONSAVEL";
  geraAutorizacao(request);
  return "AUTORIZADA";
}
