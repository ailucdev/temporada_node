import { google } from "googleapis";
import { getGoogleAuth } from "../config/googleAuth";

export class CalendarService {
  private calendar: any;

  constructor() {
    const auth = getGoogleAuth();
    this.calendar = google.calendar({ version: "v3", auth });
  }

  /**
   * Checa a disponibilidade de datas listando eventos confirmados no período.
   * Retorna true se estiver livre, false se houver eventos ocupando as datas.
   */
  async checarDisponibilidade(calendarId: string, timeMin: Date, timeMax: Date): Promise<boolean> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: "startTime"
      });

      const events = response.data.items || [];
      
      // Filtrar apenas eventos ativos (não cancelados)
      const activeEvents = events.filter((e: any) => e.status !== "cancelled");
      return activeEvents.length === 0;
    } catch (error: any) {
      console.error(`Erro ao checar disponibilidade no calendário ${calendarId}:`, error.message);
      throw error;
    }
  }

  /**
   * Insere um evento de bloqueio. 
   * Se o evento com o mesmo ID já existir (ex: sincronização concorrente ou evento persistido),
   * realiza um patch para atualizar o evento existente.
   */
  async criarOuAtualizarEvento(calendarId: string, eventDetails: any): Promise<any> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: eventDetails
      });
      return { status: "RESERVADA", eventId: response.data.id, data: response.data };
    } catch (error: any) {
      // Se der erro de ID duplicado (geralmente status 409 Conflict), fazemos o patch
      if (error.code === 409 || (error.message && error.message.includes("already exists"))) {
        try {
          console.log(`Evento ${eventDetails.id} já existe no calendário ${calendarId}. Executando patch de reconfirmação.`);
          const patchResponse = await this.calendar.events.patch({
            calendarId,
            eventId: eventDetails.id,
            requestBody: eventDetails
          });
          return { status: "RECONFIRMADO", eventId: patchResponse.data.id, data: patchResponse.data };
        } catch (patchError: any) {
          console.error(`Erro ao atualizar (patch) evento ${eventDetails.id}:`, patchError.message);
          throw patchError;
        }
      }
      console.error(`Erro ao criar evento no calendário ${calendarId}:`, error.message);
      throw error;
    }
  }

  /**
   * Deleta um evento do calendário (libera as datas da reserva).
   */
  async removerEvento(calendarId: string, eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId
      });
      console.log(`Evento ${eventId} removido com sucesso do calendário ${calendarId}.`);
    } catch (error: any) {
      // Se o evento não for encontrado, apenas ignora
      if (error.code === 404) {
        console.warn(`Evento ${eventId} não encontrado no calendário ${calendarId} ao tentar remover.`);
        return;
      }
      console.error(`Erro ao deletar evento ${eventId} do calendário ${calendarId}:`, error.message);
      throw error;
    }
  }

  /**
   * Lista eventos de um calendário de períodos sazonais/especiais.
   */
  async listarEventosPeriodosEspeciais(calendarId: string, timeMin: Date, timeMax: Date): Promise<any[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: "startTime"
      });
      return response.data.items || [];
    } catch (error: any) {
      console.error(`Erro ao obter períodos sazonais do calendário ${calendarId}:`, error.message);
      return [];
    }
  }
}
