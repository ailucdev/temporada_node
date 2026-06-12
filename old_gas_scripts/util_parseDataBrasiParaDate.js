function parseDataBrasilParaDate(dataStr) {
  const [dia, mes, ano] = dataStr.split('/');
  return new Date(`${ano}-${mes}-${dia}T00:00:00`);
}

