import { Request, Response } from "express";
import { SheetsService } from "../services/sheetsService";
import { CalendarService } from "../services/calendarService";
import { parseDataBrasil, calcularDiasDiferenca } from "../utils/dateUtils";

export const simularReserva = async (req: Request, res: Response) => {
  try {
    const idPropriedadeFiltro = req.query.idPropriedade as string;
    const inicio = req.query.inicio as string; // Formato "DD/MM/YYYY"
    const fim = req.query.fim as string;       // Formato "DD/MM/YYYY"
    const valorTarifaBasicaQuery = req.query.valorTarifaBasica as string;

    if (!idPropriedadeFiltro || !inicio || !fim) {
      return res.status(400).json({
        status: "400",
        message: "Os parâmetros 'idPropriedade', 'inicio' e 'fim' são obrigatórios."
      });
    }

    const dataEntrada = parseDataBrasil(inicio);
    const dataSaida = parseDataBrasil(fim);

    if (isNaN(dataEntrada.getTime()) || isNaN(dataSaida.getTime())) {
      return res.status(400).json({
        status: "400",
        message: "Datas inválidas fornecidas. Formato correto: DD/MM/YYYY"
      });
    }

    if (dataSaida <= dataEntrada) {
      return res.status(400).json({
        status: "400",
        message: "A data de saída (fim) deve ser posterior à data de entrada (início)."
      });
    }

    const diasReserva = calcularDiasDiferenca(dataEntrada, dataSaida);
    if (diasReserva === 0) {
      return res.status(400).json({
        status: "400",
        message: "Quantidade de dias da estadia é igual a zero."
      });
    }

    // 1. Inicializa conexão com Sheets para ler dados da Propriedade
    const sheetsId = process.env.SPREADSHEET_TEMPORADA_ID;
    if (!sheetsId) {
      throw new Error("SPREADSHEET_TEMPORADA_ID não configurado nas variáveis de ambiente.");
    }

    const sheetsService = new SheetsService(sheetsId);
    const propriedadesRaw = await sheetsService.getRowsRaw("Propriedade");

    // Localiza a linha correspondente ao idPropriedade
    const linhaPropriedade = propriedadesRaw.find(row => row[0] === idPropriedadeFiltro);
    if (!linhaPropriedade) {
      return res.status(404).json({
        status: "404",
        message: `Propriedade não encontrada: ${idPropriedadeFiltro}`
      });
    }

    // Extrai taxas e configurações pelos índices de coluna fiéis mapeados
    const taxaLimpeza = Number(linhaPropriedade[15]) || 0;
    const taxaEnxoval = Number(linhaPropriedade[17]) || 0;
    const taxaEnergia = Number(linhaPropriedade[19]) || 0;
    
    // Configuração de Calendários
    const jsonCalendariosRaw = linhaPropriedade[31];
    if (!jsonCalendariosRaw) {
      throw new Error(`Configuração de calendários vazia para a propriedade ${idPropriedadeFiltro}.`);
    }

    const jsonCalendarios = JSON.parse(jsonCalendariosRaw);
    const calendarioProprio = jsonCalendarios[0]?.icalId;
    const calendarioPeriodosEspeciais = linhaPropriedade[32]; // Coluna 32

    if (!calendarioProprio || !calendarioPeriodosEspeciais) {
      throw new Error(`Faltam IDs de calendário (próprio ou sazonal) para a propriedade ${idPropriedadeFiltro}.`);
    }

    // Tarifa base da diária
    let valorDiaria = 0;
    if (valorTarifaBasicaQuery && Number(valorTarifaBasicaQuery) > 0) {
      valorDiaria = Number(valorTarifaBasicaQuery);
    } else {
      valorDiaria = Number(linhaPropriedade[36]) || 0;
    }

    if (valorDiaria <= 0) {
      throw new Error(`A diária básica para a propriedade ${idPropriedadeFiltro} deve ser maior que zero.`);
    }

    // 2. Consulta o calendário de períodos sazonais/especiais
    const calendarService = new CalendarService();
    const eventosEspeciais = await calendarService.listarEventosPeriodosEspeciais(
      calendarioPeriodosEspeciais,
      dataEntrada,
      dataSaida
    );

    let qtdDiasEspeciais = 0;
    let valorDiasEspeciais = 0;
    let menorEstadiaPeriodo = 2; // Estadia padrão de 2 noites
    const datasEspeciaisReserva: any[] = [];

    // Processa cada evento especial que cruza o período
    for (const event of eventosEspeciais) {
      if (!event.start?.date || !event.end?.date || !event.description) continue;

      const dataInicio = new Date(event.start.date + "T00:00:00");
      const dataTermino = new Date(event.end.date + "T00:00:00");

      if (dataTermino <= dataEntrada) continue;
      if (dataInicio >= dataSaida) break;

      let jsonDescription: any = {};
      try {
        jsonDescription = JSON.parse(event.description);
      } catch (err) {
        console.error("Erro ao fazer parse da descrição do evento sazonal:", event.description);
        continue;
      }

      const multiplicador = Number(jsonDescription.multiplicador) || 1.0;
      const estadiaMinima = Number(jsonDescription.estadiaMinima) || 2;

      // RESOLUÇÃO DO BUG DE SINTAXE DO LEGADO (dataTarifa == dataInicio)
      // O loop de cálculo agora é inicializado corretamente usando atribuição "="
      // e garantindo que comece na maior data (início do feriado ou entrada do hóspede)
      const dataInicioCalculo = new Date(Math.max(dataInicio.getTime(), dataEntrada.getTime()));
      
      const dataTarifa = new Date(dataInicioCalculo);
      while (dataTarifa < dataSaida && dataTarifa < dataTermino) {
        const dataStrNoPeriodo = dataTarifa.toLocaleDateString("pt-BR");
        
        datasEspeciaisReserva.push({
          Data: dataStrNoPeriodo,
          Multiplicador: multiplicador,
          Estadia: estadiaMinima
        });

        qtdDiasEspeciais++;
        valorDiasEspeciais += valorDiaria * multiplicador;

        if (estadiaMinima > menorEstadiaPeriodo) {
          menorEstadiaPeriodo = estadiaMinima;
        }

        // Incrementa 1 dia na data de tarifa
        dataTarifa.setDate(dataTarifa.getDate() + 1);
      }
    }

    // 3. Calcula diárias normais (fora de sazonalidades)
    const diasNormais = diasReserva - qtdDiasEspeciais;
    const valorDiasNormais = valorDiaria * diasNormais;

    // Valor consolidado das diárias
    const valorTotalDiarias = valorDiasEspeciais + valorDiasNormais;

    // 4. Validação de Estadia Mínima
    let possibilidade = true;
    let message = "Simulação OK";
    if (diasReserva < menorEstadiaPeriodo) {
      possibilidade = false;
      message = `Estadia mínima exigida para este período é de ${menorEstadiaPeriodo} noites.`;
    }

    // 5. Consulta a disponibilidade de datas no calendário próprio do imóvel
    // Checa se as datas solicitadas estão livres de outros bloqueios de reservas
    const disponibilidade = await calendarService.checarDisponibilidade(
      calendarioProprio,
      dataEntrada,
      dataSaida
    );

    if (!disponibilidade) {
      possibilidade = false;
      message = "Datas indisponíveis devido a bloqueio existente no calendário.";
    }

    return res.status(200).json({
      status: "200",
      message: disponibilidade && possibilidade ? "Simulação OK" : message,
      Resultado: {
        idPropriedade: idPropriedadeFiltro,
        disponibilidade,
        valor: (valorTotalDiarias + taxaLimpeza + taxaEnxoval + taxaEnergia).toFixed(2),
        dataEntrada: inicio,
        dataSaida: fim,
        menorEstadiaPeriodo: menorEstadiaPeriodo.toString(),
        datasEspeciaisReserva,
        diasReserva: diasReserva.toString(),
        valorDiasNormais: valorDiasNormais.toFixed(2),
        valorBasicoDiaria: valorDiaria.toFixed(2),
        qtdDiasEspeciais: qtdDiasEspeciais.toString(),
        valorDiasEspeciais: valorDiasEspeciais.toFixed(2),
        taxaLimpeza: taxaLimpeza.toFixed(2),
        taxaEnxoval: taxaEnxoval.toFixed(2),
        taxaEnergia: taxaEnergia.toFixed(2),
        possibilidade
      }
    });
  } catch (error: any) {
    console.error("Erro na simulação de reserva:", error);
    return res.status(500).json({
      status: "500",
      message: `Erro na simulação: ${error.message}`
    });
  }
};
