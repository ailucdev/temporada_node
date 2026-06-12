# Project Map - Estrutura do Temporada Node

Este arquivo descreve a estrutura de pastas e a responsabilidade de cada arquivo principal do projeto, auxiliando no onboarding de novos desenvolvedores.

---

## Estrutura de Diretórios

```
temporada_node/
├── .agents/                     # Configurações de IA da IDE (Antigravity)
│   └── rules/
│       └── omnistack-agent.md   # Definições da persona omnistack-agent
├── docs/                        # Documentação de dados e API
│   ├── api_reference.md         # Manual de Endpoints ativos em produção
│   └── schema.md                # Estrutura e regras das planilhas Google Sheets
├── functions/                   # Código do backend (Firebase Cloud Functions)
│   ├── src/                     # Código fonte em TypeScript
│   │   ├── config/              # Configurações de infraestrutura
│   │   ├── controllers/         # Regras de fluxo de requisições e respostas
│   │   ├── middlewares/         # Interceptadores (Segurança/Autenticação)
│   │   ├── routes/              # Mapeamento de rotas HTTP
│   │   ├── services/            # Clientes de integração de APIs do Google
│   │   └── utils/               # Algoritmos auxiliares e helpers
│   ├── secrets/                 # Chaves de desenvolvimento (IGNORADO NO GIT)
│   ├── .env                     # Variáveis de ambiente de produção
│   ├── .env.local               # Variáveis de ambiente de desenvolvimento (IGNORADO NO GIT)
│   ├── package.json             # Dependências de bibliotecas NodeJS
│   └── tsconfig.json            # Configuração do compilador TypeScript
├── old_gas_scripts/             # Códigos e backups legados do Apps Script
│   └── legacy_api_reference.md  # Histórico detalhado de endpoints desativados
├── .gitignore                   # Filtros de exclusão para commits do Git
├── firebase.json                # Configuração de deploy do Firebase CLI
├── GEMINI.md                    # Contexto geral do projeto e regras operacionais
├── ROADMAP.md                   # Progresso visual de tarefas do projeto
├── project_map.md               # Este arquivo de mapeamento do repositório
├── setup_dev_env.sh             # Script de setup automatizado (Linux/macOS)
└── setup_dev_env.ps1            # Script de setup automatizado (Windows PowerShell)
```

---

## Descrição de Componentes Críticos (Backend)

### 1. Pasta `functions/src/config/`
*   [googleAuth.ts](file:///home/airton/dev/temporada_node/functions/src/config/googleAuth.ts): Gerencia o cliente de autenticação oficial do Google. Utiliza o arquivo local `secrets/service-account.json` em desenvolvimento, e **ADC (Application Default Credentials)** em produção.

### 2. Pasta `functions/src/services/`
*   [sheetsService.ts](file:///home/airton/dev/temporada_node/functions/src/services/sheetsService.ts): Implementa as chamadas de I/O de leitura e escrita otimizadas para as planilhas financeiras e de reservas através da biblioteca `google-spreadsheet`.
*   [calendarService.ts](file:///home/airton/dev/temporada_node/functions/src/services/calendarService.ts): Responsável por ler eventos, inserir bloqueios e remover agendas do Google Calendar de cada imóvel.

### 3. Pasta `functions/src/controllers/`
*   [simulacaoController.ts](file:///home/airton/dev/temporada_node/functions/src/controllers/simulacaoController.ts): Contém o algoritmo que calcula orçamentos aplicando diárias básicas e diárias sazonais acumuladas no Sheets.
*   [reservaController.ts](file:///home/airton/dev/temporada_node/functions/src/controllers/reservaController.ts): Orquestra o fluxo de criação, alteração e cancelamento físico de reservas.
*   [financeiroController.ts](file:///home/airton/dev/temporada_node/functions/src/controllers/financeiroController.ts): Gerencia o lançamento de débitos manuais no fechamento de contas.

### 4. Pasta `functions/src/utils/`
*   [lockManager.ts](file:///home/airton/dev/temporada_node/functions/src/utils/lockManager.ts): Semáforo em memória para controle de concorrência local, evitando double-booking sob requisições simultâneas.
*   [whatsappParser.ts](file:///home/airton/dev/temporada_node/functions/src/utils/whatsappParser.ts): Processador NLP leve para mapear mensagens de webhook do WhatsApp (MacroDroid) em comandos estruturados de consulta de agenda.
