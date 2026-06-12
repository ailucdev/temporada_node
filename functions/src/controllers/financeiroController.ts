import { Request, Response } from "express";
import { SheetsService } from "../services/sheetsService";

export const lancarDebito = async (req: Request, res: Response) => {
  try {
    const { idPropriedade, tipoDespesa, mesDespesa, valor, notaDespesa } = req.body;

    if (!idPropriedade || !tipoDespesa || !mesDespesa || !valor) {
      return res.status(400).json({
        status: "400",
        message: "Os campos 'idPropriedade', 'tipoDespesa', 'mesDespesa' e 'valor' são obrigatórios."
      });
    }

    const financeiroId = process.env.SPREADSHEET_FINANCEIRO_ID;
    if (!financeiroId) {
      throw new Error("SPREADSHEET_FINANCEIRO_ID não configurado nas variáveis de ambiente.");
    }

    // Instancia o serviço de planilhas para a planilha financeira externa
    const sheetsService = new SheetsService(financeiroId);
    
    // Obtém as linhas da aba do imóvel correspondente
    const rows = await sheetsService.getRows(idPropriedade);
    
    // Localiza a linha correspondente ao tipoDespesa
    let targetRowIndex = -1;
    let targetRow: any = null;
    
    for (let i = 0; i < rows.length; i++) {
      // Lê os valores de coluna mapeados por cabeçalho, ou usa a primeira coluna bruta da linha
      const rowVal = rows[i].get("TIPO") || rows[i].get("DESPESA") || (rows[i] as any)._rawData?.[0];
      if (rowVal === tipoDespesa) {
        targetRowIndex = i;
        targetRow = rows[i];
        break;
      }
    }

    if (targetRowIndex === -1 || !targetRow) {
      return res.status(404).json({
        status: "404",
        message: `Categoria de despesa '${tipoDespesa}' não encontrada para a propriedade ${idPropriedade}.`
      });
    }

    // Acessa a planilha e localiza os cabeçalhos de coluna na primeira linha para mapear o mês
    const doc = await (sheetsService as any).init(); // Acessa método init interno
    const sheet = doc.sheetsByTitle[idPropriedade];
    await sheet.loadCells(); // Carrega todas as células na memória do SDK para leitura e escrita rápida

    // Encontra o índice da coluna do mês despesa
    const headerRow = 0;
    let targetColIndex = -1;
    
    for (let col = 0; col < sheet.columnCount; col++) {
      const headerVal = sheet.getCell(headerRow, col).value;
      if (headerVal === mesDespesa) {
        targetColIndex = col;
        break;
      }
    }

    if (targetColIndex === -1) {
      return res.status(400).json({
        status: "400",
        message: `Mês de despesa '${mesDespesa}' inválido ou não encontrado na planilha.`
      });
    }

    // As linhas na planilha real no Sheets são 1-indexed (linha 1 é o cabeçalho)
    // O row de rows[i] corresponde à linha de índice i + 1 na planilha
    const cellRowIndex = targetRowIndex + 1;
    const cell = sheet.getCell(cellRowIndex, targetColIndex);

    // Obtém o valor ou fórmula existente na célula
    const valorAnterior = cell.value !== null ? String(cell.value) : "";
    let novaFormula = "";

    if (!valorAnterior || valorAnterior === "0" || valorAnterior === "=0") {
      novaFormula = `=${valor}`;
    } else {
      // Se for uma fórmula existente (ex: =100), incrementa. Se for número puro, adiciona o '='
      const baseVal = valorAnterior.startsWith("=") ? valorAnterior : `=${valorAnterior}`;
      novaFormula = `${baseVal}+${valor}`;
    }

    // Configura nota JSON de histórico para auditoria na célula
    const notasAnterioresRaw = cell.note || "";
    let noteJSON: any[] = [];
    
    try {
      if (notasAnterioresRaw.trim().startsWith("[")) {
        noteJSON = JSON.parse(notasAnterioresRaw);
      }
    } catch (err) {
      console.warn("Erro ao fazer parse de notas anteriores na célula:", notasAnterioresRaw);
    }

    noteJSON.push({
      Data: new Date().toLocaleDateString("pt-BR"),
      Valor: Number(valor),
      Observacao: notaDespesa || "Débito via API"
    });

    // Atualiza a célula de forma atômica
    cell.value = novaFormula;
    cell.note = JSON.stringify(noteJSON);

    // Salva as células alteradas em lote (Uma única chamada de rede)
    await sheet.saveUpdatedCells();

    console.log(`Débito lançado para ${idPropriedade} > ${tipoDespesa} em ${mesDespesa} com valor R$ ${valor}`);
    return res.status(200).json({
      status: "200",
      message: `Débito para ${idPropriedade} em ${mesDespesa} lançado com sucesso.`,
      resultado: {
        propriedade: idPropriedade,
        despesa: tipoDespesa,
        mes: mesDespesa,
        valor: Number(valor),
        formula: novaFormula
      }
    });
  } catch (error: any) {
    console.error("Erro ao lançar débito financeiro:", error);
    return res.status(500).json({
      status: "500",
      message: `Erro ao lançar débito: ${error.message}`
    });
  }
};
