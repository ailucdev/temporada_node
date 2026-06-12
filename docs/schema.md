# Schema de Dados - Gestão de Aluguéis por Temporada

Este documento descreve a estrutura de dados (tabelas, colunas e tipos de dados) da planilha Google Sheets utilizada para gerenciar as locações de temporada.

---

## Tabelas (Abas)

### 1. `Propriedade`
Cadastro dos imóveis disponíveis para locação.

| Campo | Tipo / Formato | Descrição |
| :--- | :--- | :--- |
| `idPropriedade` | String (Key) | Identificador único da propriedade (ex: `ASB402`, `AV22302`). |
| `cpfProprietario` | String | CPF do proprietário associado ao imóvel. |
| `nomeProprietario` | String | Nome completo do proprietário. |
| `emailProprietario` | String | E-mail de contato do proprietário. |
| `celularProprietario` | String | Telefone celular no formato DDI + DDD + Número. |
| `local` | String | Região ou estado da propriedade (ex: `CE`, `GO`, `RJ`). |
| `bloco` | String | Bloco do condomínio. |
| `apartamento` | String | Número do apartamento. |
| `lotacao` | Integer / String | Capacidade máxima de hóspedes permitida. |
| `qtdQuartos` | Integer / String | Quantidade de quartos disponíveis. |
| `horarioCheckin` | Time (`HH:MM:SS`) | Horário padrão permitido para entrada (Check-in). |
| `horarioCheckout` | Time (`HH:MM:SS`) | Horário limite padrão para saída (Check-out). |
| `fotos` | String | URL ou lista de referências de imagens da propriedade. |
| `jsonResultados` | JSON / String | Resultados consolidados e cálculos de fechamento. |

---

### 2. `Temporada`
Configuração de regras de preço (multiplicadores) e estadias mínimas baseadas em períodos específicos e datas.

| Campo | Tipo / Formato | Descrição |
| :--- | :--- | :--- |
| `Local` | String | Código de identificação regional ou local da propriedade (ex: `AV`, `AS`). |
| `Período Especial` | String | Nome do evento sazonal (ex: `Reveillon`, `Férias`, `Carnaval`). |
| `Data Inicio` | Date (`DD/MM/YYYY`) | Data de início do período especial. |
| `Data Fim` | Date (`DD/MM/YYYY`) | Data de encerramento do período especial. |
| `Multiplicador` | Decimal (`0.00`) | Fator multiplicador da tarifa base durante esse período. |
| `Estadia Minima` | Integer | Número mínimo de diárias necessárias para reservas no período. |
| `Status` | String | Status de ativação da regra. |

---

### 3. `Reserva`
Gerenciamento de reservas em andamento, pendentes ou em negociação.

| Campo | Tipo / Formato | Descrição |
| :--- | :--- | :--- |
| `idConsulta` | String (Key) | Identificador único de consulta de aluguel. |
| `idPropriedade` | String | ID da propriedade reservada (chave estrangeira de `Propriedade`). |
| `local` | String | Região da propriedade. |
| `valorLocacao` | Currency (`R$ 0,00` / Decimal) | Valor total combinado para a locação. |
| `valorPago` | JSON Array | Histórico de pagamentos efetuados. Ex: `[{"banco": "...", "data": "...", "valor": 0, "comissao": 0}]`. |
| `nomeInteressado` | String | Nome completo do hóspede principal ou interessado. |
| `celularInteressado`| String | Telefone de contato do interessado. |
| `cpfInteressado` | String | CPF do interessado. |
| `emailInteressado` | String | E-mail do interessado. |
| `pessoas` | Integer / String | Quantidade de pessoas da reserva. |
| `entrada` | Date (`DD/MM/YYYY`) | Data de check-in. |
| `saida` | Date (`DD/MM/YYYY`) | Data de check-out. |
| `idEvent` | String | ID associado ao evento criado no Google Calendar para sincronização. |
| `idContact` | String | ID do contato associado no Google Contacts. |
| `origem` | String | Canal de venda de origem (ex: `AIRBNB`, `BOOKING`, `TEMPORADA`, `OUTRO`). |
| `comando` | String | Instruções ou automações acionadas manualmente por meio da planilha. |
| `STATUS` | String | Estado da reserva no ecossistema (ex: `COBERTA`, `DESCOBERTA`, `CONTABILIZADA`). |
| `jsonEstadia` | JSON / String | Payload serializado do modelo completo de estadia. |

---

### 4. `Estadia`
Registro definitivo de estadias realizadas e finalizadas. Contém a mesma base de campos de `Reserva`, adicionando dados cadastrais e operacionais mais específicos de check-in/check-out.

| Campo Adicional | Tipo / Formato | Descrição |
| :--- | :--- | :--- |
| `CEP` | String | Código de Endereçamento Postal do hóspede. |
| `cidade` | String | Cidade de residência do hóspede. |
| `UF` | String | Estado (Unidade Federativa) de residência do hóspede. |
| `veiculo_1` | String | Dados de placa/modelo do veículo para autorização de entrada no condomínio. |
| `limpezaEntrada` | String / Decimal | Dados de custo ou agendamento da limpeza de entrada. |
| `enxoval` | String | Configuração ou custo de roupas de cama e banho. |
| `energia` | Decimal | Consumo ou custo de energia elétrica medido. |
| `autorizacao` | String | Status de autorização da portaria/administração. |
| `ocupacao` | String | Detalhes sobre o preenchimento de hóspedes adicionais. |
| `limpezaSaida` | String / Decimal | Dados de custo ou agendamento da limpeza de saída. |

---

### 5. `Excluida`
Coleção histórica de reservas que foram removidas ou canceladas.
*   **Campos:** Possui a mesma estrutura idêntica de colunas que `Estadia`/`Reserva`.

---

### 6. `Log`
Log de auditoria e monitoramento do processamento das integrações de calendário e sincronização automática.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `Data ` | Date / Timestamp | Data e hora em que a rotina foi executada. |
| `PROPRIEDADE` | String | ID da propriedade processada. |
| `EVENTOS REMOVIDOS` | JSON Array | Detalhes dos eventos retirados do calendário externo. |
| `EVENTOS INSERIDOS` | JSON Array | Detalhes de novos eventos adicionados. |
| `EVENTOS DESPREZADOS`| JSON Array | Eventos ignorados por não se enquadrarem nas regras de importação. |
| `RESERVAS PASSADAS...`| JSON Array | Reservas históricas arquivadas. |
| *(Demais colunas)* | JSON Array | Acompanhamento analítico da consistência e sincronização de eventos de terceiros (Airbnb, Booking e reservas próprias). |
