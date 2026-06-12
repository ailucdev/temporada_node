# Referência da API Legada (Google Apps Script)

Este documento descreve os endpoints legados e o funcionamento do backend antigo baseado em Google Apps Script (localizado na pasta [old_gas_scripts](file:///home/airton/dev/temporada_node/old_gas_scripts)). Ele serve como histórico técnico para consultas ou migrações futuras de endpoints secundários.

---

## 1. Endpoints Baseados em `doGet(request)`

Trata a leitura de informações, simulações de reservas, geração de relatórios e conciliações.

| Comando (`request.parameter.comando`) | Parâmetros Principais | Ação Executada | Retorno (JSON) |
| :--- | :--- | :--- | :--- |
| `SETAR RESERVA` | `idConsulta`, `planilha` | Procura a linha com `idConsulta` na aba especificada. | O JSON correspondente à coluna `jsonEstadia` da reserva. |
| `SIMULAR` | `idPropriedadeFiltro`, `inicio`, `fim`, `valorTarifaBasica` | Executa simulação financeira de reserva com base em taxas da propriedade e sazonalidades (`Temporada`). | Status 200 contendo a disponibilidade e os custos desagregados. |
| `NOTIFICAR` | `idConsulta`, `planilha`, `notificacao` | Salva o texto da notificação na coluna 18 da reserva. | Status 200. |
| `SINCRONIZAR` | `idPropriedadeFiltro` | Sincroniza calendários Airbnb/Booking (iCal) para a propriedade. | Status 200 ou 500 se houver conflito de datas. |
| `CONTABILIZAR` | `idPropriedadeFiltro` | Executa rotina de fechamento de receitas de estadias completadas. | Status 200. |
| `AUTORIZAR` | `idConsulta`, `planilha` | Valida se a reserva está confirmada e cria a autorização de portaria. | Retorno da rotina de autorização. |
| `ALERTAR` | `idConsulta`, `planilha` | Limpa o JSON cacheado da reserva no Sheets. | Status 200. |
| `LISTAR` / `SOMAR` | `idConsultaFiltro`, `idPropriedadeFiltro`, `planilha` | Lista dados brutos em JSON. O comando `SOMAR` também calcula faturamento e diárias. | Array de registros e totalizadores de receita/diárias. |
| `CONCILIAR` | `idPropriedadeFiltro`, `planilha` | Lista estadias com pendência de conciliação financeira (status diferente de conciliada/contabilizada). | Array de estadias pendentes de fechamento. |
| `COMPLEMENTAR` | `jsonReservas` | Atualiza em lote nomes e valores de reservas passadas por parâmetro. | Status 200. |

*Nota: Se `planilha == "Financeiro"`, o `doGet` invoca `processaGetFinanceiro()`, que abre uma planilha de controle financeiro dedicada e calcula receitas e despesas por mês para as propriedades.*

---

## 2. Endpoints Baseados em `doPost(request)`

Trata a criação, cancelamento e alteração de entidades que exigem escrita física na planilha.

| Comando (no corpo JSON) | Propriedades do Payload JSON | Ação Executada | Retorno (JSON) |
| :--- | :--- | :--- | :--- |
| `RESERVAR` | `idPropriedade`, `entrada`, `saida`, `valorLocacao`, `valorPago`, `nome`, `celular`, `cpf`, `email` | Bloqueia as datas no Google Calendar da propriedade (`bloqueiaCalendarReserva`), anexa no Sheets a nova reserva e notifica por e-mail. | Status 200 (se indisponível, status 500 com `disponibilidade: false`). |
| `CANCELAR` | `idConsulta`, `planilha` | Remove o bloqueio de data do Google Calendar da propriedade e apaga a linha correspondente da reserva. | Status 200 ("Reserva cancelada"). |
| `ALTERAR` | `idConsulta`, `planilha`, `valorLocacao`, `valorPago`, `nome`, `celular`, `cpf`, etc. | Atualiza os campos modificados na linha correspondente da reserva na planilha. | Status 200 ("Alteração feita!"). |
| `ATUALIZAR PROPRIEDADE`| `idPropriedade`, `cpf`, `nome`, `email`, `celular`, `fotos`, `taxaLimpeza`, etc. | Atualiza dados cadastrais e tarifas fixas do imóvel na aba `Propriedade`. | Status 200. |

*Nota: Se `planilha == "Financeiro"`, o `doPost` invoca `processaPostFinanceiro()`, que processa os comandos `DEBITAR` (adiciona fórmula acumuladora `=V1+V2` no mês correspondente da despesa na planilha financeira) e `ZERAR` (limpa lançamentos).*

---

## 3. Arquivos Obsoletos no Diretório `old_gas_scripts`

Os seguintes arquivos foram mantidos na pasta local de backup mas estão inativos ou desativados:

*   **Legados explicitados (prefixo `OLD_`):**
    *   `OLD_criaCalendarioTarifas.js`
    *   `OLD_criaCalendarioTemporada.js`
    *   `OLD_criaJsonTemporadas.js`
    *   `OLD_selecionaPropriedades.js`
    *   `OLD_sincronizaCalendar.js`
*   **Rotinas desativadas/sem referência no código ativo:**
    *   `extratorPDF.js` e `debug.js` (parser de PDF de extratos antigo e rotinas de teste correspondentes).
    *   `formWeb.html` (formulário HTML legado sem rota de renderização no backend).
    *   `eliminaSuperpostos.js` (lógica de correção de duplicidade sem uso).
    *   `uti_comparaIntervaloDatas.js` (função utilitária sem chamadas).
    *   `util_GERARJSONLINHA.js` (gerador manual de JSON de linhas obsoleto).
    *   `util_geraZap.js` (gerador de links do WhatsApp sem chamadas).
    *   `util_listEvents.js` e `util_listaCalendars.js` (rotinas de depuração e visualização de eventos).
    *   `util_uuidGenerator.js` (gerador de UUID antigo).
    *   `util_validarCNPJ.js` e `util_validarCpf.js` (validadores auxiliares sem uso nas rotinas ativas).
