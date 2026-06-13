import { Request, Response } from "express";
import { SheetsService } from "../services/sheetsService";
import { CalendarService } from "../services/calendarService";
import { processaMensagemZap, montaRetornoZap } from "../utils/whatsappParser";
import { parseDataBrasil, calcularDiasDiferenca } from "../utils/dateUtils";

// Armazena as conexões SSE ativas indexadas pelo sessionId
const activeConnections = new Map<string, Response>();

/**
 * GET /mcp/sse
 * Estabelece a conexão Server-Sent Events (SSE) com o cliente do MCP.
 */
export const mcpSseHandler = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Content-Encoding", "none");

  // Envia os cabeçalhos imediatamente para estabelecer a conexão SSE
  res.flushHeaders();

  const sessionId = "mcp_session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  activeConnections.set(sessionId, res);

  // Envia o primeiro evento exigido pelo protocolo MCP informando onde enviar as mensagens.
  // Construímos a URL absoluta dinamicamente para garantir compatibilidade com rotas (/api) e preservar o token de autenticação.
  const host = req.get("host") || "";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? req.protocol : "https";
  
  // Adiciona o prefixo do caminho apropriado para o emulador local ou produção no cloudfunctions.net
  let urlPrefix = "";
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    const projectId = process.env.GCLOUD_PROJECT || "temporada-14b29";
    urlPrefix = `/${projectId}/us-central1/api`;
  } else if (host.includes("cloudfunctions.net")) {
    urlPrefix = "/api";
  }
  
  const originalUrl = req.originalUrl.split("?")[0];
  const basePath = originalUrl.substring(0, originalUrl.lastIndexOf("/sse"));
  const apiKey = req.query.apiKey || req.headers["x-api-key"] || "";
  const authSuffix = apiKey ? `&apiKey=${apiKey}` : "";
  const messagesUrl = `${protocol}://${host}${urlPrefix}${basePath}/messages?sessionId=${sessionId}${authSuffix}`;

  res.write(`event: endpoint\ndata: ${messagesUrl}\n\n`);

  console.log(`MCP Connection established. SessionId: ${sessionId}. Endpoint URL: ${messagesUrl}`);

  // Envia um comentário heartbeat a cada 15 segundos para evitar timeouts do gateway serverless
  const keepAliveInterval = setInterval(() => {
    res.write(":\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAliveInterval);
    activeConnections.delete(sessionId);
    console.log(`MCP Connection closed. SessionId: ${sessionId}`);
  });
};

/**
 * POST /mcp/messages
 * Recebe comandos JSON-RPC do cliente do MCP e retorna a resposta via SSE.
 */
export const mcpMessagesHandler = async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const requestPayload = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId parameter" });
  }

  const clientRes = activeConnections.get(sessionId);
  if (!clientRes) {
    return res.status(400).json({ error: "Active connection for sessionId not found" });
  }

  const { jsonrpc, id, method, params } = requestPayload;

  if (jsonrpc !== "2.0") {
    return res.status(400).json({ error: "Invalid JSON-RPC version. Expected '2.0'" });
  }

  // Se for uma notificação JSON-RPC (não possui 'id'), processamos de forma síncrona sem responder via SSE
  if (id === undefined || id === null) {
    console.log(`Received MCP Notification: ${method}`);
    return res.status(202).end();
  }

  console.log(`Received MCP Request: ${method} (id: ${id})`);

  try {
    let result: any = null;

    if (method === "initialize") {
      result = {
        protocolVersion: params?.protocolVersion || "2024-11-05",
        capabilities: {
          tools: {} // Indica que o servidor expõe ferramentas (Tools)
        },
        serverInfo: {
          name: "temporada-api",
          version: "1.0.0"
        }
      };
    } else if (method === "ping") {
      result = {};
    } else if (method === "tools/list") {
      result = {
        tools: [
          {
            name: "simular",
            description: "COTAR/SIMULAR tarifas e checar disponibilidade de datas de um imóvel no Google Calendar. Use sempre que o usuário quiser ver preços para um período exato.",
            inputSchema: {
              type: "object",
              properties: {
                idPropriedade: {
                  type: "string",
                  description: "Obrigatório. Código exato do imóvel cadastrado (ex: 'ASB402')."
                },
                inicio: {
                  type: "string",
                  description: "Obrigatório. Data de check-in (entrada) no formato estrito 'DD/MM/YYYY'."
                },
                fim: {
                  type: "string",
                  description: "Obrigatório. Data de check-out (saída) no formato estrito 'DD/MM/YYYY'."
                }
              },
              required: ["idPropriedade", "inicio", "fim"]
            }
          },
          {
            name: "listar_reservas",
            description: "LISTAR as reservas ou estadias registradas para um imóvel específico. Exige indicar filtros temporais explícitos: 'futuras' (saída de hoje em diante), 'passadas' (saída anterior a hoje) ou 'periodo' (qualquer reserva que cruze o intervalo de datas informado).",
            inputSchema: {
              type: "object",
              properties: {
                idPropriedade: {
                  type: "string",
                  description: "Obrigatório. Código do imóvel (ex: 'ASB402')."
                },
                tipo: {
                  type: "string",
                  description: "Obrigatório. Escolha exatamente 'Reservas' (para ativas/futuras) ou 'Estadias' (para passadas/finalizadas).",
                  enum: ["Reservas", "Estadias"]
                },
                filtro: {
                  type: "string",
                  description: "Obrigatório. Critério de corte: 'futuras', 'passadas' ou 'periodo'.",
                  enum: ["futuras", "passadas", "periodo"]
                },
                inicio: {
                  type: "string",
                  description: "Opcional. Data inicial do filtro 'DD/MM/YYYY'. Obrigatório se filtro for 'periodo'."
                },
                fim: {
                  type: "string",
                  description: "Opcional. Data final do filtro 'DD/MM/YYYY'. Obrigatório se filtro for 'periodo'."
                }
              },
              required: ["idPropriedade", "tipo", "filtro"]
            }
          },
          {
            name: "criar_reserva",
            description: "EFETIVAR/REGISTRAR uma reserva definitiva, inserindo a linha no Sheets e bloqueando a agenda no Google Calendar do imóvel.",
            inputSchema: {
              type: "object",
              properties: {
                idPropriedade: {
                  type: "string",
                  description: "Obrigatório. Código do imóvel (ex: 'ASB402')."
                },
                entrada: {
                  type: "string",
                  description: "Obrigatório. Data de check-in (entrada) no formato 'DD/MM/YYYY'."
                },
                saida: {
                  type: "string",
                  description: "Obrigatório. Data de check-out (saída) no formato 'DD/MM/YYYY'."
                },
                valorLocacao: {
                  type: "number",
                  description: "Obrigatório. Valor total combinado cobrado do hóspede pela estadia inteira."
                },
                nome: {
                  type: "string",
                  description: "Obrigatório. Nome completo do hóspede principal."
                },
                celular: {
                  type: "string",
                  description: "Opcional. Número de celular (ex: '5511999999999')."
                },
                cpf: {
                  type: "string",
                  description: "Opcional. CPF do hóspede."
                },
                email: {
                  type: "string",
                  description: "Opcional. E-mail do hóspede."
                },
                origem: {
                  type: "string",
                  description: "Opcional. Canal de origem. Padrão: 'TEMPORADA'."
                }
              },
              required: ["idPropriedade", "entrada", "saida", "valorLocacao", "nome"]
            }
          },
          {
            name: "cancelar_reserva",
            description: "LIBERAR/CANCELAR uma reserva pelo ID identificador único dela, apagando a linha correspondente da planilha e limpando a data no Google Calendar.",
            inputSchema: {
              type: "object",
              properties: {
                idConsulta: {
                  type: "string",
                  description: "Obrigatório. O ID numérico identificador da consulta/reserva (ex: '1781207938319')."
                }
              },
              required: ["idConsulta"]
            }
          },
          {
            name: "whatsapp_webhook",
            description: "Interagir via chat de texto (NLP) como se fosse uma mensagem do WhatsApp (MacroDroid). Processa frases como 'consulte o carnaval em Rio Quente' ou 'mostre as reservas do ASB402' e retorna respostas textuais humanizadas.",
            inputSchema: {
              type: "object",
              properties: {
                mensagem: {
                  type: "string",
                  description: "Obrigatório. Mensagem de texto informal enviada (ex: 'simule o carnaval no Rio Quente')."
                }
              },
              required: ["mensagem"]
            }
          }
        ]
      };
    } else if (method === "tools/call") {
      const toolName = params.name;
      const toolArgs = params.arguments || {};

      result = await executarTool(toolName, toolArgs);
    } else {
      const errorPayload = {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      };
      clientRes.write(`event: message\ndata: ${JSON.stringify(errorPayload)}\n\n`);
      return res.status(200).end();
    }

    const responsePayload = {
      jsonrpc: "2.0",
      id,
      result
    };

    // Escreve a resposta no fluxo SSE correspondente à sessão com a diretiva event: message do padrão MCP
    clientRes.write(`event: message\ndata: ${JSON.stringify(responsePayload)}\n\n`);

    // Retorna aceito na requisição POST com corpo vazio no padrão do MCP
    return res.status(200).end();

  } catch (error: any) {
    console.error("MCP Request error:", error);
    const errorPayload = {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: error.message || "Internal error occurred"
      }
    };
    clientRes.write(`event: message\ndata: ${JSON.stringify(errorPayload)}\n\n`);
    return res.status(200).end();
  }
};

/**
 * Função utilitária para chamar a lógica interna das ferramentas MCP.
 */
async function executarTool(name: string, args: any): Promise<any> {
  console.log(`[executarTool] Executing tool: ${name} with args:`, JSON.stringify(args));
  const sheetsId = process.env.SPREADSHEET_TEMPORADA_ID;
  if (!sheetsId) throw new Error("SPREADSHEET_TEMPORADA_ID não configurado.");

  const sheetsService = new SheetsService(sheetsId);
  const calendarService = new CalendarService();

  switch (name) {
    case "simular": {
      const { idPropriedade, inicio, fim } = args;
      
      const dataEntrada = parseDataBrasil(inicio);
      const dataSaida = parseDataBrasil(fim);
      const diasReserva = calcularDiasDiferenca(dataEntrada, dataSaida);

      const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");
      const linhaPropriedade = propriedadesRaw.find(row => row[0] === idPropriedade);
      if (!linhaPropriedade) throw new Error(`Propriedade não encontrada: ${idPropriedade}`);

      const taxaLimpeza = Number(linhaPropriedade[15]) || 0;
      const taxaEnxoval = Number(linhaPropriedade[17]) || 0;
      const taxaEnergia = Number(linhaPropriedade[19]) || 0;
      
      const jsonCalendarios = JSON.parse(linhaPropriedade[31]);
      const calendarioProprio = jsonCalendarios[0]?.icalId;
      const calendarioPeriodosEspeciais = linhaPropriedade[32];
      const valorDiaria = Number(linhaPropriedade[36]) || 0;

      const eventosEspeciais = await calendarService.listarEventosPeriodosEspeciais(
        calendarioPeriodosEspeciais,
        dataEntrada,
        dataSaida
      );

      let qtdDiasEspeciais = 0;
      let valorDiasEspeciais = 0;
      let menorEstadiaPeriodo = 2;
      const datasEspeciaisReserva: any[] = [];

      for (const event of eventosEspeciais) {
        if (!event.start?.date || !event.end?.date || !event.description) continue;
        const dataInicio = new Date(event.start.date + "T00:00:00");
        const dataTermino = new Date(event.end.date + "T00:00:00");

        if (dataTermino <= dataEntrada) continue;
        if (dataInicio >= dataSaida) break;

        const jsonDescription = JSON.parse(event.description);
        const multiplicador = Number(jsonDescription.multiplicador) || 1.0;
        const estadiaMinima = Number(jsonDescription.estadiaMinima) || 2;

        const dataInicioCalculo = new Date(Math.max(dataInicio.getTime(), dataEntrada.getTime()));
        const dataTarifa = new Date(dataInicioCalculo);

        while (dataTarifa < dataSaida && dataTarifa < dataTermino) {
          datasEspeciaisReserva.push({
            Data: dataTarifa.toLocaleDateString("pt-BR"),
            Multiplicador: multiplicador,
            Estadia: estadiaMinima
          });
          qtdDiasEspeciais++;
          valorDiasEspeciais += valorDiaria * multiplicador;
          if (estadiaMinima > menorEstadiaPeriodo) menorEstadiaPeriodo = estadiaMinima;
          dataTarifa.setDate(dataTarifa.getDate() + 1);
        }
      }

      const diasNormais = diasReserva - qtdDiasEspeciais;
      const valorDiasNormais = valorDiaria * diasNormais;
      const valorTotalDiarias = valorDiasEspeciais + valorDiasNormais;

      let possibilidade = true;
      let msgSimulacao = "Simulação OK";
      if (diasReserva < menorEstadiaPeriodo) {
        possibilidade = false;
        msgSimulacao = `Estadia mínima exigida para este período é de ${menorEstadiaPeriodo} noites.`;
      }

      const disponibilidade = await calendarService.checarDisponibilidade(
        calendarioProprio,
        dataEntrada,
        dataSaida
      );

      if (!disponibilidade) {
        possibilidade = false;
        msgSimulacao = "Datas indisponíveis devido a bloqueio existente no calendário.";
      }

      const resultado = {
        idPropriedade,
        disponibilidade,
        valorTotal: (valorTotalDiarias + taxaLimpeza + taxaEnxoval + taxaEnergia).toFixed(2),
        dataEntrada: inicio,
        dataSaida: fim,
        diasReserva: diasReserva.toString(),
        valorDiasNormais: valorDiasNormais.toFixed(2),
        valorBasicoDiaria: valorDiaria.toFixed(2),
        qtdDiasEspeciais: qtdDiasEspeciais.toString(),
        valorDiasEspeciais: valorDiasEspeciais.toFixed(2),
        taxaLimpeza: taxaLimpeza.toFixed(2),
        possibilidade,
        mensagem: msgSimulacao
      };

      return formatMcpTextResponse(resultado);
    }

    case "listar_reservas": {
      const { idPropriedade, tipo, filtro, inicio, fim } = args;

      let abaName = "Reserva";
      if (tipo === "Estadias") {
        abaName = "Estadia";
      }

      const rows = await sheetsService.getRows(abaName);
      const rowsFiltered = rows.filter(row => row.get("idPropriedade") === idPropriedade);

      const formatDataStr = (val: any): string => {
        if (!val) return "";
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

      const parseDateObj = (val: any): Date | null => {
        const str = formatDataStr(val);
        if (!str) return null;
        const date = parseDataBrasil(str);
        return isNaN(date.getTime()) ? null : date;
      };

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      let resultRows = rowsFiltered;

      if (filtro === "futuras") {
        resultRows = rowsFiltered.filter(row => {
          const dataSaida = parseDateObj(row.get("saida"));
          return dataSaida ? dataSaida >= hoje : false;
        });
      } else if (filtro === "passadas") {
        resultRows = rowsFiltered.filter(row => {
          const dataSaida = parseDateObj(row.get("saida"));
          return dataSaida ? dataSaida < hoje : false;
        });
      } else if (filtro === "periodo") {
        if (!inicio || !fim) throw new Error("Filtro 'periodo' exige datas de inicio e fim.");
        const dataInicioFiltro = parseDataBrasil(inicio);
        const dataFimFiltro = parseDataBrasil(fim);

        resultRows = rowsFiltered.filter(row => {
          const dataEntrada = parseDateObj(row.get("entrada"));
          const dataSaida = parseDateObj(row.get("saida"));
          if (!dataEntrada || !dataSaida) return false;
          return dataEntrada <= dataFimFiltro && dataSaida >= dataInicioFiltro;
        });
      }

      const registros = resultRows.map(row => ({
        idConsulta: row.get("idConsulta") || "",
        nomeInteressado: row.get("nomeInteressado") || "",
        entrada: formatDataStr(row.get("entrada")),
        saida: formatDataStr(row.get("saida")),
        valorLocacao: row.get("valorLocacao") || "0",
        STATUS: row.get("STATUS") || "RESERVADA"
      }));

      return formatMcpTextResponse({
        tipo: abaName,
        quantidade: registros.length,
        registros
      });
    }

    case "criar_reserva": {
      const { idPropriedade, entrada, saida, valorLocacao, nome, celular, cpf, email, origem } = args;

      const dataEntrada = parseDataBrasil(entrada);
      const dataSaida = parseDataBrasil(saida);

      const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");
      const linhaProp = propriedadesRaw.find(p => p[0] === idPropriedade);
      if (!linhaProp) throw new Error(`Propriedade não encontrada: ${idPropriedade}`);

      const jsonCalendarios = JSON.parse(linhaProp[31]);
      const calendarioProprio = jsonCalendarios[0]?.icalId;

      const disponibilidade = await calendarService.checarDisponibilidade(
        calendarioProprio,
        dataEntrada,
        dataSaida
      );

      if (!disponibilidade) {
        throw new Error("As datas solicitadas já estão bloqueadas no calendário.");
      }

      const idConsulta = Date.now().toString();
      const idEvent = `${idPropriedade.toLowerCase()}${dataEntrada.getTime()}_proprio`;

      const eventDetails = {
        id: idEvent,
        summary: nome,
        description: JSON.stringify({ idConsulta, origem: origem || "TEMPORADA" }),
        start: { date: dataEntrada.toISOString().substring(0, 10) },
        end: { date: new Date(dataSaida.getTime() + 86400000).toISOString().substring(0, 10) },
        colorId: "3",
        status: "confirmed"
      };

      await calendarService.criarOuAtualizarEvento(calendarioProprio, eventDetails);

      const novaLinha = await sheetsService.adicionarReserva("Reserva", {
        idConsulta,
        idPropriedade,
        entrada,
        saida,
        valorLocacao,
        nomeInteressado: nome,
        celularInteressado: celular,
        cpfInteressado: cpf,
        emailInteressado: email,
        idEvent,
        origem: origem || "TEMPORADA",
        status: "RESERVADA"
      });

      return formatMcpTextResponse({
        status: "200",
        message: "Reserva criada com sucesso no Sheets e Google Calendar.",
        reserva: novaLinha
      });
    }

    case "cancelar_reserva": {
      const { idConsulta } = args;

      const row = await sheetsService.findRowByIdConsulta("Reserva", idConsulta);
      if (!row) throw new Error(`Reserva não encontrada: ${idConsulta}`);

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

      return formatMcpTextResponse({
        status: "200",
        message: `Reserva ${idConsulta} cancelada e datas liberadas.`
      });
    }

    case "whatsapp_webhook": {
      const { mensagem } = args;

      const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");
      const propriedadesList = propriedadesRaw.map(row => row[0]).filter(Boolean);

      const temporadasRaw = await sheetsService.getRowsRaw("Temporada");
      const temporadasList = temporadasRaw.map(row => ({
        local: row[0] ? String(row[0]).trim().toUpperCase() : "",
        nome: row[1] ? String(row[1]).trim() : "",
        dataInicio: row[2] ? String(row[2]).trim() : "",
        dataFim: row[3] ? String(row[3]).trim() : ""
      })).filter(t => t.local && t.nome && t.dataInicio && t.dataFim);

      const parsed = processaMensagemZap(mensagem, propriedadesList, temporadasList);

      if (parsed.comando === "SIMULAR") {
        if (!parsed.propriedade || !parsed.dataInicio || !parsed.dataFim) {
          return formatMcpTextResponse({ error: "Faltam informações na mensagem para simular." });
        }
        const dataEntrada = parseDataBrasil(parsed.dataInicio);
        const dataSaida = parseDataBrasil(parsed.dataFim);
        const diasReserva = calcularDiasDiferenca(dataEntrada, dataSaida);

        const linhaProp = propriedadesRaw.find(row => row[0] === parsed.propriedade);
        if (!linhaProp) throw new Error("Propriedade não encontrada.");

        const valorDiaria = Number(linhaProp[36]) || 0;
        const jsonCalendarios = JSON.parse(linhaProp[31]);
        const calendarioProprio = jsonCalendarios[0]?.icalId;

        const disponibilidade = await calendarService.checarDisponibilidade(calendarioProprio, dataEntrada, dataSaida);
        const valorCalculado = (valorDiaria * diasReserva).toFixed(2);

        const textoRetorno = montaRetornoZap("SIMULAR", {
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

        return formatMcpTextResponse(textoRetorno);
      } else if (parsed.comando === "LISTAR") {
        const abaName = parsed.planilha || "Reserva";
        const rows = await sheetsService.getRows(abaName);
        let filtered = rows;
        if (parsed.propriedade) {
          filtered = rows.filter(row => row.get("idPropriedade") === parsed.propriedade);
        }

        const registros = filtered.map(row => ({
          nomeInteressado: row.get("nomeInteressado") || "Reserva",
          entrada: row.get("entrada"),
          saida: row.get("saida"),
          valorLocacao: row.get("valorLocacao") || "0"
        }));

        const textoRetorno = montaRetornoZap("LISTAR", {
          status: "200",
          data: {
            [abaName]: registros
          }
        });
        return formatMcpTextResponse(textoRetorno);
      } else {
        return formatMcpTextResponse(`🤖 Comando "${parsed.comando || "NÃO IDENTIFICADO"}" interpretado.`);
      }
    }

    default:
      throw new Error(`Tool not found: ${name}`);
  }
}

/**
 * Auxiliar para empacotar respostas de texto compatíveis com o formato do MCP.
 */
function formatMcpTextResponse(data: any) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return {
    content: [
      {
        type: "text",
        text
      }
    ]
  };
}
