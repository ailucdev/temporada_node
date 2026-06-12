function compareDateIntervals(start1, end1, start2, end2) {
  // Convertendo as datas para objetos Date, caso não sejam
  start1 = new Date(start1);
  end1 = new Date(end1);
  start2 = new Date(start2);
  end2 = new Date(end2);
  // Verificar se o primeiro intervalo está completamente antes do segundo
  if (end1 < start2) {
    return 'antes';
  }
  // Verificar se o primeiro intervalo está completamente depois do segundo
  if (start1 > end2) {
    return 'depois';
  }
  // Verificar se há interseção entre os intervalos
  if (start1 >= start2 && end1 <= end2) {
    return 'coincide';
  }
  // Verificar se o primeiro intervalo engloba o segundo
  if (start1 <= start2 && end1 >= end2) {
    return 'engloba';
  }
  // Verificar se há coleta parcial
  if ((start1 <= start2 && end1 >= start2) || (start1 <= end2 && end1 >= end2)) {
    return 'coleta parcial';
  }
  // Verificar se há coincidencia total entre os intervalos
  if (start1 == start2 && end1 == end2) {
    return 'cobre';
  }
  // Se nenhuma condição foi atendida, os intervalos são disjuntos
  return 'disjunto';
}