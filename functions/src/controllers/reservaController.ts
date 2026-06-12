import { Request, Response } from "express";
import { SheetsService } from "../services/sheetsService";
import { CalendarService } from "../services/calendarService";
import { parseDataBrasil, calcularDiasDiferenca } from "../utils/dateUtils";
import { acquireLock, releaseLock } from "../utils/lockManager";
import { processaMensagemZap, montaRetornoZap } from "../utils/whatsappParser";

/**
 * Intercepta edições manuais feitas diretamente na planilha e sincroniza alterações críticas no Google Calendar.
 */
export const tratarUpdatePlanilha = async (req: Request, res: Response) => {
  try {
    const { sheetName, row, column, value } = req.body;

    console.log("Notificação de edição manual no Sheets:", { sheetName, row, column, value });

    // Apenas sincronizamos edições feitas nas abas de Reserva e Estadia
    if (sheetName !== "Reserva" && sheetName !== "Estadia") {
      return res.status(200).json({ status: "200", message: "Edição ignorada (Aba não monitorada)." });
    }

    const sheetsId = process.env.SPREADSHEET_TEMPORADA_ID;
    if (!sheetsId) throw new Error("SPREADSHEET_TEMPORADA_ID não configurado.");

    const sheetsService = new SheetsService(sheetsId);
    const calendarService = new CalendarService();

    // No Sheets, a linha 1 é o cabeçalho. As linhas retornadas pelo getRows começam da linha 2
    // Portanto, o índice da linha no array do google-spreadsheet é (row - 2)
    const rows = await sheetsService.getRows(sheetName);
    const rowIndex = row - 2;

    if (rowIndex < 0 || rowIndex >= rows.length) {
      return res.status(404).json({ status: "404", message: "Linha editada não encontrada." });
    }

    const targetRow = rows[rowIndex];
    const idConsulta = targetRow.get("idConsulta");
    const idEvent = targetRow.get("idEvent");
    const idPropriedade = targetRow.get("idPropriedade");

    if (!idEvent || !idPropriedade) {
      return res.status(200).json({ status: "200", message: "Edição ignorada (Falta idEvent ou idPropriedade na linha)." });
    }

    // Identifica qual coluna foi editada (Baseado nos índices de coluna 1-indexed do Sheets)
    // Coluna 8: nomeInteressado
    // Coluna 4: entrada
    // Coluna 5: saida
    const COLUNA_NOME = 8;
    const COLUNA_ENTRADA = 4;
    const COLUNA_SAIDA = 5;

    if (column === COLUNA_NOME || column === COLUNA_ENTRADA || column === COLUNA_SAIDA) {
      console.log(`Campo crítico alterado manualmente na planilha para a reserva ${idConsulta}. Atualizando Google Calendar.`);

      // Busca os calendários da propriedade para saber qual icalId atualizar
      const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");
      const linhaProp = propriedadesRaw.find(p => p[0] === idPropriedade);
      
      if (!linhaProp) {
        return res.status(404).json({ status: "404", message: "Propriedade associada à reserva não encontrada." });
      }

      const jsonCalendarios = JSON.parse(linhaProp[31]);
      const calendarioProprio = jsonCalendarios[0]?.icalId;

      if (calendarioProprio) {
        const nomeInteressado = targetRow.get("nomeInteressado") || "Reserva";
        const entradaStr = targetRow.get("entrada");
        const saidaStr = targetRow.get("saida");

        const dataEntrada = parseDataBrasil(entradaStr);
        const dataSaida = parseDataBrasil(saidaStr);

        // Se as datas forem válidas, fazemos o patch do evento no Google Calendar
        if (!isNaN(dataEntrada.getTime()) && !isNaN(dataSaida.getTime())) {
          const descriptionObj = {
            idConsulta,
            idPropriedade,
            local: idPropriedade.substring(0, 2),
            valorLocacao: targetRow.get("valorLocacao") || "0",
            valorPago: targetRow.get("valorPago") ? JSON.parse(targetRow.get("valorPago")) : [{}],
            nomeInteressado,
            celularInteressado: targetRow.get("celularInteressado") || "",
            cpfInteressado: targetRow.get("cpfInteressado") || "",
            emailInteressado: targetRow.get("emailInteressado") || "",
            pessoas: targetRow.get("pessoas") || "",
            entrada: entradaStr,
            saida: saidaStr,
            idEvent,
            idContact: targetRow.get("idContact") || "",
            origem: targetRow.get("origem") || "TEMPORADA",
            STATUS: targetRow.get("STATUS") || "RESERVADA"
          };

          const eventDetails = {
            id: idEvent,
            location: idPropriedade,
            summary: nomeInteressado,
            description: JSON.stringify(descriptionObj),
            start: { date: dataEntrada.toISOString().substring(0, 10) },
            // Check-out soma 1 dia para bloqueio de dia inteiro
            end: {
              date: new Date(dataSaida.getTime() + 86400000).toISOString().substring(0, 10)
            },
            colorId: "3",
            status: "confirmed"
          };

          // Executa o patch/atualização no Google Calendar
          await calendarService.criarOuAtualizarEvento(calendarioProprio, eventDetails);
          console.log(`Evento ${idEvent} do calendário sincronizado com sucesso.`);
        }
      }
    }

    return res.status(200).json({ status: "200", message: "Sincronização de edição manual concluída com sucesso." });
  } catch (error: any) {
    console.error("Erro ao sincronizar edição manual do Sheets:", error);
    return res.status(500).json({ status: "500", message: error.message });
  }
};

/**
 * Trata requisições originárias do webhook do WhatsApp (MacroDroid).
 */
export const tratarWebhookWhatsApp = async (req: Request, res: Response) => {
  try {
    const { mensagem } = req.body;
    if (!mensagem) {
      return res.status(400).json({ status: "400", message: "Mensagem não informada no corpo." });
    }
    const sheetsId = process.env.SPREADSHEET_TEMPORADA_ID;
    if (!sheetsId) throw new Error("SPREADSHEET_TEMPORADA_ID não configurado.");

    const sheetsService = new SheetsService(sheetsId);
    const calendarService = new CalendarService();

    // Carrega a lista de propriedades da planilha em tempo real para eliminar o hardcode
    const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");
    const propriedadesList = propriedadesRaw.map(row => row[0]).filter(Boolean);

    // Carrega as temporadas/períodos especiais da planilha em tempo real
    const temporadasRaw = await sheetsService.getRowsRaw("Temporada");
    const temporadasList = temporadasRaw.map(row => ({
      local: row[0] ? String(row[0]).trim().toUpperCase() : "",
      nome: row[1] ? String(row[1]).trim() : "",
      dataInicio: row[2] ? String(row[2]).trim() : "",
      dataFim: row[3] ? String(row[3]).trim() : ""
    })).filter(t => t.local && t.nome && t.dataInicio && t.dataFim);

    const parsed = processaMensagemZap(mensagem, propriedadesList, temporadasList);

    switch (parsed.comando) {
      case "SIMULAR": {
        if (!parsed.propriedade || !parsed.dataInicio || !parsed.dataFim) {
          return res.send(montaRetornoZap("SIMULAR", { status: "400", message: "Faltam informações de imóvel ou datas na mensagem." }));
        }

        const dataEntrada = parseDataBrasil(parsed.dataInicio);
        const dataSaida = parseDataBrasil(parsed.dataFim);
        const diasReserva = calcularDiasDiferenca(dataEntrada, dataSaida);

        const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");
        const linhaProp = propriedadesRaw.find(row => row[0] === parsed.propriedade);
        if (!linhaProp) {
          return res.send(montaRetornoZap("SIMULAR", { status: "404", message: "Propriedade não encontrada." }));
        }

        const valorDiaria = Number(linhaProp[36]) || 0;
        const jsonCalendarios = JSON.parse(linhaProp[31]);
        const calendarioProprio = jsonCalendarios[0]?.icalId;

        const disponibilidade = await calendarService.checarDisponibilidade(calendarioProprio, dataEntrada, dataSaida);
        const valorCalculado = (valorDiaria * diasReserva).toFixed(2);

        const responseText = montaRetornoZap("SIMULAR", {
          status: "200",
          Resultado: {
            idPropriedade: parsed.propriedade,
            disponibilidade,
            valor: valorCalculado,
            dataEntrada: parsed.dataInicio,
            dataSaida: parsed.dataFim,
            diasReserva: diasReserva.toString()
          }
        });
        return res.send(responseText);
      }

      case "RESERVAR": {
        if (!parsed.propriedade || !parsed.dataInicio || !parsed.dataFim) {
          return res.send(montaRetornoZap("RESERVAR", { status: "400", message: "Dados insuficientes para reservar." }));
        }

        const fakeReq = {
          body: {
            idPropriedade: parsed.propriedade,
            entrada: parsed.dataInicio,
            saida: parsed.dataFim,
            nome: parsed.nome || "Reserva WhatsApp",
            origem: "TEMPORADA"
          }
        } as Request;

        const mockRes = {
          status: (code: number) => ({
            json: (data: any) => data
          })
        } as unknown as Response;

        const resultadoReserva = await criarReservaInterna(fakeReq, mockRes);
        return res.send(montaRetornoZap("RESERVAR", resultadoReserva));
      }

      case "LISTAR": {
        const abaName = parsed.planilha || "Reserva";
        const rows = await sheetsService.getRows(abaName);
        let filtered = rows;
        if (parsed.propriedade) {
          filtered = rows.filter(row => row.get("idPropriedade") === parsed.propriedade);
        }

        const formatData = (val: any): string => {
          if (!val) return "N/A";
          const str = String(val).trim();
          if (str.includes("/")) return str;
          const num = Number(str);
          if (!isNaN(num) && num > 0) {
            const utcDate = new Date((num - 25569) * 86400 * 1000);
            const y = utcDate.getUTCFullYear();
            const m = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
            const d = String(utcDate.getUTCDate()).padStart(2, "0");
            return `${d}/${m}/${y}`;
          }
          return str;
        };

        const registros = filtered.map(row => ({
          nomeInteressado: row.get("nomeInteressado") || "Reserva",
          entrada: formatData(row.get("entrada")),
          saida: formatData(row.get("saida")),
          valorLocacao: row.get("valorLocacao") || "0"
        }));

        const responseText = montaRetornoZap("LISTAR", {
          status: "200",
          data: {
            [abaName]: registros
          }
        });
        return res.send(responseText);
      }

      default:
        return res.send(`🤖 Comando "${parsed.comando || "NÃO IDENTIFICADO"}" recebido com sucesso.`);
    }
  } catch (error: any) {
    console.error("Erro no webhook do WhatsApp:", error);
    return res.status(500).send(`❌ Erro no servidor: ${error.message}`);
  }
};

/**
 * Criação de Reserva (API / FlutterFlow e reuso no WhatsApp)
 */
export const criarReserva = async (req: Request, res: Response) => {
  const result = await criarReservaInterna(req, res);
  return res.status(Number(result.status)).json(result);
};

/**
 * Lógica interna compartilhada para criação de reserva com controle de concorrência.
 */
const criarReservaInterna = async (req: Request, res: Response): Promise<any> => {
  const {
    idPropriedade,
    entrada,
    saida,
    valorLocacao,
    valorPago,
    nome,
    celular,
    cpf,
    email,
    origem
  } = req.body;

  if (!idPropriedade || !entrada || !saida) {
    return { status: "400", message: "Os campos 'idPropriedade', 'entrada' e 'saida' são obrigatórios." };
  }

  const dataEntrada = parseDataBrasil(entrada);
  const dataSaida = parseDataBrasil(saida);

  if (isNaN(dataEntrada.getTime()) || isNaN(dataSaida.getTime())) {
    return { status: "400", message: "Datas de entrada ou saída inválidas." };
  }

  const lockAdquired = await acquireLock(idPropriedade, 12000);
  if (!lockAdquired) {
    return {
      status: "503",
      message: `Não foi possível obter a trava para a propriedade ${idPropriedade}. Tente novamente em instantes.`
    };
  }

  try {
    const sheetsId = process.env.SPREADSHEET_TEMPORADA_ID;
    if (!sheetsId) throw new Error("SPREADSHEET_TEMPORADA_ID não configurado.");

    const sheetsService = new SheetsService(sheetsId);
    const calendarService = new CalendarService();

    const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");
    const linhaProp = propriedadesRaw.find(row => row[0] === idPropriedade);
    if (!linhaProp) {
      return { status: "404", message: `Propriedade não encontrada: ${idPropriedade}` };
    }

    const jsonCalendariosRaw = linhaProp[31];
    const jsonCalendarios = JSON.parse(jsonCalendariosRaw);
    const calendarioProprio = jsonCalendarios[0]?.icalId;

    if (!calendarioProprio) {
      return { status: "500", message: `Configuração de calendário próprio em falta para a propriedade ${idPropriedade}` };
    }

    const disponivel = await calendarService.checarDisponibilidade(calendarioProprio, dataEntrada, dataSaida);
    if (!disponivel) {
      return {
        status: "409",
        message: `As datas solicitadas (${entrada} a ${saida}) já estão bloqueadas no calendário.`,
        disponibilidade: false
      };
    }

    const idConsulta = Date.now().toString();
    const idEvento = `${idPropriedade.toLowerCase()}${dataEntrada.getTime()}${dataSaida.getTime()}proprio`;

    const descriptionObj = {
      idConsulta,
      idPropriedade,
      local: idPropriedade.substring(0, 2),
      valorLocacao: valorLocacao || "0",
      valorPago: valorPago || [{}],
      nomeInteressado: nome || "Reserva Manual",
      celularInteressado: celular || "",
      cpfInteressado: cpf || "",
      emailInteressado: email || "",
      pessoas: linhaProp[8] || "",
      entrada,
      saida,
      idEvent: idEvento,
      idContact: "",
      origem: origem || "TEMPORADA",
      STATUS: "RESERVADA"
    };

    const eventDetails = {
      id: idEvento,
      location: idPropriedade,
      summary: nome || "Reserva",
      description: JSON.stringify(descriptionObj),
      start: { date: dataEntrada.toISOString().substring(0, 10) },
      end: {
        date: new Date(dataSaida.getTime() + 86400000).toISOString().substring(0, 10)
      },
      colorId: "3",
      status: "confirmed"
    };

    const calendarResult = await calendarService.criarOuAtualizarEvento(calendarioProprio, eventDetails);
    
    const rowInput = {
      idConsulta,
      idPropriedade,
      entrada,
      saida,
      valorLocacao: valorLocacao || 0,
      valorPago,
      nomeInteressado: nome,
      celularInteressado: celular,
      cpfInteressado: cpf,
      emailInteressado: email,
      idEvent: idEvento,
      origem: origem || "TEMPORADA",
      status: calendarResult.status
    };

    const sheetResult = await sheetsService.adicionarReserva("Reserva", rowInput);

    return {
      status: "200",
      message: `Reserva criada com sucesso. Status do calendário: ${calendarResult.status}`,
      disponibilidade: true,
      data: {
        ...sheetResult,
        idConsulta
      }
    };
  } catch (error: any) {
    console.error("Erro ao criar reserva:", error);
    return { status: "500", message: `Erro interno no servidor: ${error.message}` };
  } finally {
    await releaseLock(idPropriedade);
  }
};

/**
 * Altera dados de uma reserva existente na planilha.
 */
export const alterarReserva = async (req: Request, res: Response) => {
  try {
    const { idConsulta } = req.params;
    const updates = req.body;

    if (!idConsulta) {
      return res.status(400).json({ status: "400", message: "Parâmetro idConsulta é obrigatório." });
    }

    const sheetsId = process.env.SPREADSHEET_TEMPORADA_ID;
    if (!sheetsId) throw new Error("SPREADSHEET_TEMPORADA_ID não configurado.");

    const sheetsService = new SheetsService(sheetsId);
    const success = await sheetsService.atualizarReserva("Reserva", idConsulta, updates);

    if (!success) {
      return res.status(404).json({ status: "404", message: `Reserva não encontrada: ${idConsulta}` });
    }

    return res.status(200).json({ status: "200", message: "Alteração efetuada com sucesso!" });
  } catch (error: any) {
    console.error("Erro ao alterar reserva:", error);
    return res.status(500).json({ status: "500", message: error.message });
  }
};

/**
 * Cancela a reserva apagando do Sheets e liberando o Google Calendar.
 */
export const cancelarReserva = async (req: Request, res: Response) => {
  try {
    const { idConsulta } = req.params;

    if (!idConsulta) {
      return res.status(400).json({ status: "400", message: "Parâmetro idConsulta é obrigatório." });
    }

    const sheetsId = process.env.SPREADSHEET_TEMPORADA_ID;
    if (!sheetsId) throw new Error("SPREADSHEET_TEMPORADA_ID não configurado.");

    const sheetsService = new SheetsService(sheetsId);
    const calendarService = new CalendarService();

    const row = await sheetsService.findRowByIdConsulta("Reserva", idConsulta);
    if (!row) {
      return res.status(404).json({ status: "404", message: `Reserva não encontrada: ${idConsulta}` });
    }

    const idPropriedade = row.get("idPropriedade");
    const idEvent = row.get("idEvent");

    const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");
    const linhaProp = propriedadesRaw.find(p => p[0] === idPropriedade);
    
    if (linhaProp && idEvent) {
      const jsonCalendarios = JSON.parse(linhaProp[31]);
      const calendarioProprio = jsonCalendarios[0]?.icalId;
      if (calendarioProprio) {
        await calendarService.removerEvento(calendarioProprio, idEvent);
      }
    }

    await sheetsService.deletarReserva("Reserva", idConsulta);

    return res.status(200).json({ status: "200", message: "Reserva cancelada e datas liberadas com sucesso." });
  } catch (error: any) {
    console.error("Erro ao cancelar reserva:", error);
    return res.status(500).json({ status: "500", message: error.message });
  }
};
