# Roadmap - Temporada Node

Este arquivo acompanha a evolução do projeto de automatização de aluguéis por temporada. As tarefas estão divididas em fases com indicadores visuais de status.

## Legenda de Status
*   🔴 **Aberta**: Planejada, aguardando início.
*   🟡 **Em Andamento**: Sendo desenvolvida ou testada na sessão atual.
*   🟢 **Concluída**: Implementada, validada e deployada.

---

## 🟢 Fase 1: Migração do Core e Validação de Concorrência
*   🟢 **Tarefa 1.1:** Migração de lógica legada de Apps Script para NodeJS + TypeScript.
*   🟢 **Tarefa 1.2:** Implementação do `sheetsService.ts` e `calendarService.ts` integrando com Google APIs.
*   🟢 **Tarefa 1.3:** Migração e teste da lógica de processamento de linguagem natural (NLP) do WhatsApp.
*   🟢 **Tarefa 1.4:** Correção dos bugs de loops sazonais herdados do Apps Script.
*   🟢 **Tarefa 1.5:** Criação do `lockManager.ts` local em memória (sem dependência externa de banco) para evitar double-booking concorrente.

## 🟢 Fase 2: Deploy e Segurança de Produção
*   🟢 **Tarefa 2.1:** Configuração do Google Auth com suporte a Application Default Credentials (ADC) em produção.
*   🟢 **Tarefa 2.2:** Otimização do ponto de entrada do Express (index.ts) para evitar URLs com prefixos `/api/api` redundantes.
*   🟢 **Tarefa 2.3:** Deploy oficial do microsserviço no Firebase Cloud Functions (`temporada-14b29`).
*   🟢 **Tarefa 2.4:** Elaboração do manual completo de referência da API no arquivo [api_reference.md](file:///home/airton/dev/temporada_node/docs/api_reference.md).

## 🟢 Fase 3: Controle de Versão e Versionamento Remoto
*   🟢 **Tarefa 3.1:** Configuração inicial de Git local e definição de regras rígidas de segurança de credenciais via `.gitignore`.
*   🟢 **Tarefa 3.2:** Associação do repositório remoto no GitHub (`https://github.com/ailucdev/temporada_node`).
*   🟢 **Tarefa 3.3:** Execução do primeiro push seguro da branch `main`.

## 🟡 Fase 4: Integração de Parceiros e Padronização
*   🟡 **Tarefa 4.1:** Atualização das regras do `GEMINI.md` para monitorar ativamente os arquivos `ROADMAP.md` e `project_map.md`.
*   🟡 **Tarefa 4.2:** Criação de roteiro estruturado e scripts de automação para configuração remota do ambiente de novos desenvolvedores parceiros.
*   🔴 **Tarefa 4.3:** Migração e implementação da lógica de sincronização global de calendários baseada no script legado `sincroniza.js` (processando os feeds iCal do Airbnb/Booking, removendo eventos cancelados/órfãos do Google Calendar, e movendo estadias passadas para a aba Estadia do Sheets).

## 🔴 Fase 5: Próximas Funcionalidades e Manutenção
*   🔴 **Tarefa 5.1:** Automatização de rotina de fechamento de faturamento mensal (Contabilização Financeira).
*   🔴 **Tarefa 5.2:** Desenvolvimento de módulo de conciliação financeira automatizado no Sheets.

## 🔴 Fase 6: Aprofundar interação via WhatsApp
*   🔴 **Tarefa 6.1:** Elencar e implementar novos comandos.
*   🔴 **Tarefa 6.2:** Implementar mecanismo de permissão/autenticação para chamadas via whatsapp às funções do Temporada
