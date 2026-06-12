import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { getGoogleAuth } from "../config/googleAuth";

export class SheetsService {
  private doc: GoogleSpreadsheet | null = null;
  private spreadsheetId: string;

  constructor(spreadsheetId: string) {
    if (!spreadsheetId) {
      throw new Error("ID da planilha não fornecido no construtor.");
    }
    this.spreadsheetId = spreadsheetId;
  }

  // Inicialização Preguiçosa (Lazy Loading) do documento
  private async init(): Promise<GoogleSpreadsheet> {
    if (this.doc) return this.doc;

    const auth = getGoogleAuth();
    this.doc = new GoogleSpreadsheet(this.spreadsheetId, auth);
    await this.doc.loadInfo();
    return this.doc;
  }

  /**
   * Obtém todas as linhas de uma aba específica.
   */
  async getRows(abaName: string): Promise<GoogleSpreadsheetRow[]> {
    const doc = await this.init();
    const sheet = doc.sheetsByTitle[abaName];
    if (!sheet) {
      throw new Error(`Aba '${abaName}' não encontrada na planilha.`);
    }
    return await sheet.getRows();
  }

  /**
   * Retorna os valores brutos de todas as linhas de uma aba como arrays de strings (0-indexed).
   * Isso equivale aos DisplayValues do Google Apps Script.
   */
  async getRowsRaw(abaName: string): Promise<string[][]> {
    const rows = await this.getRows(abaName);
    // @ts-ignore - _rawData existe internamente em GoogleSpreadsheetRow
    return rows.map(row => row._rawData || []);
  }

  /**
   * Busca dados brutos formatados como objetos.
   */
  async getRowsAsObjects(abaName: string): Promise<any[]> {
    const rows = await this.getRows(abaName);
    return rows.map(row => row.toObject());
  }

  /**
   * Obtém uma linha de reserva específica pelo seu idConsulta.
   */
  async findRowByIdConsulta(abaName: string, idConsulta: string): Promise<GoogleSpreadsheetRow | null> {
    const rows = await this.getRows(abaName);
    for (const row of rows) {
      if (row.get("idConsulta") === idConsulta) {
        return row;
      }
    }
    return null;
  }

  /**
   * Insere uma nova reserva na aba especificada.
   * Cria os valores de coluna mapeados.
   */
  async adicionarReserva(abaName: string, data: any): Promise<any> {
    const doc = await this.init();
    const sheet = doc.sheetsByTitle[abaName];
    if (!sheet) {
      throw new Error(`Aba '${abaName}' não encontrada na planilha.`);
    }

    const nextRowNumber = sheet.rowCount + 1;
    const rangeFormulaJson = `A${nextRowNumber}:AZ${nextRowNumber}`;

    // Monta o objeto de linha com os cabeçalhos mapeados da planilha
    const rowValue = {
      idConsulta: data.idConsulta,
      idPropriedade: data.idPropriedade,
      local: data.idPropriedade.substring(0, 2),
      entrada: data.entrada, // Grava a data crua que será interpretada
      saida: data.saida,
      valorLocacao: data.valorLocacao ? Number(data.valorLocacao) : 0,
      valorPago: data.valorPago ? JSON.stringify(data.valorPago) : "[{}]",
      nomeInteressado: data.nomeInteressado || "",
      celularInteressado: data.celularInteressado || "",
      cpfInteressado: data.cpfInteressado || "",
      emailInteressado: data.emailInteressado || "",
      // Fórmulas baseadas em posição da linha
      // Colunas formatadas M e N (entrada / saida formatada em string DD/MM/YYYY)
      "13": `=TEXT(D${nextRowNumber}; "dd/mm/yyyy")`, 
      "14": `=TEXT(E${nextRowNumber}; "dd/mm/yyyy")`,
      idEvent: data.idEvent || "",
      origem: data.origem || "TEMPORADA",
      STATUS: data.status || "RESERVADA",
      // Fórmula do array para calcular o JSON concatenado da linha inteira
      jsonEstadia: `=ARRAYFORMULA("{" & TEXTJOIN(", "; TRUE; IF(A$1:AZ$1 <> ""; """" & A$1:AZ$1 & """: " & IF(A$1:AZ$1 = "valorPago"; "" & TEXTJOIN(", "; TRUE; FILTER(${rangeFormulaJson}; A$1:AZ$1 = "valorPago")) & ""; IF(LEFT(${rangeFormulaJson}; 1) = "{"; ${rangeFormulaJson}; IF(LEFT(${rangeFormulaJson}; 1) = "["; ${rangeFormulaJson}; """" & ${rangeFormulaJson} & """"))); ""))) & "}")`
    };

    const newRow = await sheet.addRow(rowValue);
    return newRow.toObject();
  }

  /**
   * Atualiza os campos de uma reserva de forma atômica (única chamada de escrita por linha).
   */
  async atualizarReserva(abaName: string, idConsulta: string, updates: Partial<any>): Promise<boolean> {
    const row = await this.findRowByIdConsulta(abaName, idConsulta);
    if (!row) return false;

    // Atualiza apenas os campos presentes na modificação
    Object.keys(updates).forEach((key) => {
      const val = updates[key];
      if (val !== undefined) {
        if (typeof val === "object") {
          row.set(key, JSON.stringify(val));
        } else {
          row.set(key, val);
        }
      }
    });

    await row.save();
    return true;
  }

  /**
   * Remove fisicamente uma linha da planilha.
   */
  async deletarReserva(abaName: string, idConsulta: string): Promise<boolean> {
    const row = await this.findRowByIdConsulta(abaName, idConsulta);
    if (!row) return false;

    await row.delete();
    return true;
  }
}
