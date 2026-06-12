# Temporada Node - Gestão de Aluguéis por Temporada

Este projeto NodeJS com TypeScript gerencia reservas, estadias e precificações de imóveis por temporada, utilizando Google Sheets como banco de dados e Google Calendar como bloqueador de datas. O backend roda em Firebase Cloud Functions.

---

## Estrutura e Links de Referência

*   **Esquema de Dados:** [schema.md](file:///home/airton/dev/temporada_node/docs/schema.md) - Detalha a estrutura das abas da planilha.
*   **Manual da API:** [api_reference.md](file:///home/airton/dev/temporada_node/docs/api_reference.md) - Documenta todos os endpoints ativos.
*   **API Legada (Histórico):** [legacy_api_reference.md](file:///home/airton/dev/temporada_node/old_gas_scripts/legacy_api_reference.md) - Documentação das rotas antigas em Google Apps Script.
*   **Scripts Legados (Backup):** Localizados em [old_gas_scripts](file:///home/airton/dev/temporada_node/old_gas_scripts).

---

## Arquitetura de Produção

*   **Projeto Firebase:** `temporada-14b29`
*   **Base URL:** `https://us-central1-temporada-14b29.cloudfunctions.net/api`
*   **Autenticação Google (ADC):** Executa sob a Service Account `temporada-service-account@temporada-14b29.iam.gserviceaccount.com` usando Application Default Credentials (sem chaves JSON no pacote).
*   **Segurança da API:** Endpoints protegidos por Bearer Token através da variável de ambiente `API_KEY` (configurada no `.env` do Cloud Functions e `.env.local` localmente).

---

## Regras Operacionais de Desenvolvimento

As seguintes diretrizes devem ser seguidas estritamente durante a evolução do projeto:

1.  **Edição do GEMINI.md:** Nunca atualize ou modifique este arquivo (`GEMINI.md`) sem expressa autorização ou solicitação do usuário.
2.  **Envio para o GitHub (Push):** Antes de realizar qualquer push para o repositório GitHub, é obrigatório obter autorização expressa do usuário.
3.  **Postura de Desenvolvedor Sênior (Pareamento):** O assistente de IA deve atuar como um engenheiro sênior. Isso significa **não aceitar sugestões ou soluções do usuário cegamente**. Durante as fases de discussão e planejamento, o assistente deve:
    *   Analisar impactos colaterais na arquitetura.
    *   Apresentar alternativas tecnicamente viáveis com seus respectivos prós e contras.
    *   Trazer discussões estruturadas para garantir a melhor tomada de decisão.
4.  **Preservação de Backups:** Não exclua arquivos de backup locais do diretório `old_gas_scripts/` a menos que explicitado.
5.  **Persistência de Contexto:** Prefira persistir informações relevantes de longo prazo neste arquivo (`GEMINI.md`) em vez do contexto global do agente.
