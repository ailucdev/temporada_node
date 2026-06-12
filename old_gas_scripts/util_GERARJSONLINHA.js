/*
function GERARJSONLINHA(linha, cabecalhos) {

  if (!cabecalhos || !linha) return "";
  console.log(linha[0])
  const json = {};
  cabecalhos[0].forEach((chave, index) => {
    console.log(chave, index, linha[0][index])
    if (chave == "") return;  // Ignora colunas com títulos vazios
    let valor = linha[0][index];
    if (chave === "entrada" || chave === "saida") {
      if (Object.prototype.toString.call(valor) === "[object Date]" && !isNaN(valor)) {
        // Formata a data como dd/mm/aaaa
        const dia = String(valor.getDate()).padStart(2, "0");
        const mes = String(valor.getMonth() + 1).padStart(2, "0"); // Mês começa em 0
        const ano = valor.getFullYear();
        json[chave] = `${dia}/${mes}/${ano}`;
      } else if (typeof valor === "string" && valor.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Se a data já estiver no formato dd/mm/aaaa, mantém o valor
        json[chave] = valor;
      } else {
        // Se não for uma data válida, define como vazio
        json[chave] = "";
      }
      return;
    }
    if (chave === "valorPago") {
      // Preserva o JSON da coluna "valorPago"
      try {
        json[chave] = JSON.parse(valor); // Tenta converter o valor em objeto JSON
      } catch (e) {
        json[chave] = valor; // Se não for um JSON válido, mantém o valor original
      }
      return;
    }
    // Para outras colunas, mantém o valor original
    json[chave] = valor;
  });
  console.log(json)
  return JSON.stringify(json, null, 2); // Retorna o JSON formatado
}
*/
function GERARJSONLINHA(linha, cabecalhos) {
  if (!cabecalhos || !linha) return "";
  const json = {};

  cabecalhos[0].forEach((chave, index) => {
    if (!chave) return; // Ignora colunas sem cabeçalho
    let valor = linha[0][index] ?? ""; // Evita valores undefined ou null

    if (chave === "entrada" || chave === "saida") {
      if (Object.prototype.toString.call(valor) === "[object Date]" && !isNaN(valor)) {
        // Formata a data como dd/mm/aaaa
        const dia = String(valor.getDate()).padStart(2, "0");
        const mes = String(valor.getMonth() + 1).padStart(2, "0");
        const ano = valor.getFullYear();
        json[chave] = `${dia}/${mes}/${ano}`;
      } else if (typeof valor === "string" && valor.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        json[chave] = valor; // Mantém se já estiver no formato correto
      } else {
        return; // Ignora valores inválidos
      }
      return;
    }

    if (chave === "valorPago") {
      try {
        json[chave] = JSON.parse(valor); // Se for JSON válido, armazena como objeto
      } catch {
        json[chave] = valor; // Caso contrário, mantém como está
      }
      return;
    }

    json[chave] = valor.toString(); // Mantém strings preenchidas
  });
  console.log(json);
  console.log(JSON.stringify(json))
  // Remove chaves com valores vazios antes de gerar o JSON
  Object.keys(json).forEach((key) => {
    if (json[key] === "") delete json[key];
  });

  return JSON.stringify(json);
}
