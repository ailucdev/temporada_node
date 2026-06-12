# Manual de Endpoints da API - Temporada Node

Este manual descreve todos os endpoints expostos pelo microsserviço NodeJS + TypeScript via Firebase Cloud Functions, incluindo parâmetros, payloads, respostas e requisitos de segurança.

---

## 1. Base URL e Ambientes

Os endpoints devem ser chamados concatenando a rota com a **Base URL** correspondente:

*   **Ambiente de Produção:** `https://us-central1-temporada-14b29.cloudfunctions.net/api`
*   **Ambiente Local (Emulador):** `http://localhost:5001/temporada-14b29/us-central1/api`

---

## 2. Segurança e Autenticação

Todos os endpoints da API (exceto o de status) exigem autenticação baseada em token estático (**Bearer Token**).

*   **Header Obrigatório:** `Authorization: Bearer <SEU_TOKEN>`
*   **Token Local / Produção:** Mapeado na variável de ambiente `API_KEY` (configurada no arquivo [functions/.env.local](file:///home/airton/dev/temporada_node/functions/.env.local) ou GCP Secret Manager).

---

## 3. Endpoints da API

### A. Validação de Status (Health Check)
Verifica se a API está online. Livre de autenticação.

*   **Rota:** `/status`
*   **Método:** `GET`
*   **Autenticação:** Não
*   **Exemplo em Produção:** `GET https://us-central1-temporada-14b29.cloudfunctions.net/api/status`
*   **Resposta (200 OK):**
    ```json
    {
      "status": "200",
      "message": "API Temporada Node Online"
    }
    ```

---

### B. Simulação de Preços e Disponibilidade
Calcula o custo total da estadia aplicando diárias sazonais/períodos especiais e consulta a disponibilidade das datas.

*   **Rota:** `/simulacao`
*   **Método:** `GET`
*   **Autenticação:** Sim (Bearer Token)
*   **Parâmetros de Query String (URL):**
    *   `idPropriedade` (string, obrigatório): ID do imóvel (ex: `ASB402`).
    *   `inicio` (string, obrigatório): Data de entrada no formato `DD/MM/YYYY` (ex: `15/08/2026`).
    *   `fim` (string, obrigatório): Data de saída no formato `DD/MM/YYYY` (ex: `20/08/2026`).
    *   `valorTarifaBasica` (number/string, opcional): Sobrescreve a diária padrão do imóvel.
*   **Exemplo em Produção:**
    `GET https://us-central1-temporada-14b29.cloudfunctions.net/api/simulacao?idPropriedade=ASB402&inicio=15/08/2026&fim=20/08/2026`
*   **Resposta (200 OK - Datas Livres):**
    ```json
    {
      "status": "200",
      "message": "Simulação OK",
      "Resultado": {
        "idPropriedade": "ASB402",
        "disponibilidade": true,
        "valor": "1880.00",
        "dataEntrada": "15/08/2026",
        "dataSaida": "20/08/2026",
        "menorEstadiaPeriodo": "3",
        "datasEspeciaisReserva": [
          { "Data": "15/08/2026", "Multiplicador": 1.2, "Estadia": 3 },
          { "Data": "16/08/2026", "Multiplicador": 1.2, "Estadia": 3 },
          { "Data": "17/08/2026", "Multiplicador": 1.2, "Estadia": 3 }
        ],
        "diasReserva": "5",
        "valorDiasNormais": "650.00",
        "valorBasicoDiaria": "325.00",
        "qtdDiasEspeciais": "3",
        "valorDiasEspeciais": "1170.00",
        "taxaLimpeza": "60.00",
        "taxaEnxoval": "0.00",
        "taxaEnergia": "0.00",
        "possibilidade": true
      }
    }
    ```
*   **Resposta (200 OK - Datas Ocupadas):**
    ```json
    {
      "status": "200",
      "message": "Datas indisponíveis devido a bloqueio existente no calendário.",
      "Resultado": {
        "idPropriedade": "ASB402",
        "disponibilidade": false,
        "possibilidade": false
      }
    }
    ```

---

### C. Criação de Reserva
Cadastra uma nova reserva. Bloqueia as datas no Google Calendar da propriedade e insere a linha na aba **Reserva** do Google Sheets.

*   **Rota:** `/reservas`
*   **Método:** `POST`
*   **Autenticação:** Sim (Bearer Token)
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "idPropriedade": "ASB402",
      "entrada": "15/08/2026",
      "saida": "20/08/2026",
      "valorLocacao": 1880.00,
      "nome": "Hospede Teste Agosto",
      "celular": "5511999999999",
      "cpf": "123.456.789-00",
      "email": "hospede@teste.com",
      "origem": "TEMPORADA"
    }
    ```
*   **Resposta (200 OK - Sucesso):**
    ```json
    {
      "status": "200",
      "message": "Reserva criada com sucesso. Status do calendário: RESERVADA",
      "disponibilidade": true,
      "data": {
        "idConsulta": "1781207938319",
        "idPropriedade": "ASB402",
        "local": "AS",
        "valorLocacao": "1880",
        "valorPago": "[{}]",
        "nomeInteressado": "Hospede Teste Agosto",
        "celularInteressado": "5511999999999",
        "cpfInteressado": "123.456.789-00",
        "emailInteressado": "hospede@teste.com",
        "entrada": "15/08/2026",
        "saida": "20/08/2026",
        "idEvent": "asb40217867520000001787184000000proprio",
        "origem": "TEMPORADA",
        "STATUS": "RESERVADA"
      }
    }
    ```
*   **Resposta (409 Conflict - Datas Ocupadas):**
    ```json
    {
      "status": "409",
      "message": "As datas solicitadas (15/08/2026 a 20/08/2026) já estão bloqueadas no calendário.",
      "disponibilidade": false
    }
    ```

---

### D. Alteração de Reserva
Atualiza informações cadastrais ou financeiras de uma reserva no Google Sheets.

*   **Rota:** `/reservas/:idConsulta`
*   **Método:** `PUT`
*   **Autenticação:** Sim (Bearer Token)
*   **Parâmetros de Rota (URL):**
    *   `idConsulta` (string, obrigatório): ID da reserva a alterar.
*   **Corpo da Requisição (JSON):** Chaves e valores que deseja alterar (ex: `nomeInteressado`, `valorLocacao`, `valorPago`, etc.)
    ```json
    {
      "nomeInteressado": "Marta da Silva",
      "valorLocacao": 1950.00
    }
    ```
*   **Resposta (200 OK):**
    ```json
    {
      "status": "200",
      "message": "Alteração efetuada com sucesso!"
    }
    ```

---

### E. Cancelamento de Reserva
Remove o evento de bloqueio no Google Calendar e deleta fisicamente a linha de reserva correspondente no Google Sheets.

*   **Rota:** `/reservas/:idConsulta`
*   **Método:** `DELETE`
*   **Autenticação:** Sim (Bearer Token)
*   **Parâmetros de Rota (URL):**
    *   `idConsulta` (string, obrigatório): ID da reserva a cancelar.
*   **Resposta (200 OK):**
    ```json
    {
      "status": "200",
      "message": "Reserva cancelada e datas liberadas com sucesso."
    }
    ```

---

### F. Webhook do WhatsApp (MacroDroid)
Processa consultas por mensagens de texto e retorna respostas humanizadas diretamente formatadas para WhatsApp.

*   **Rota:** `/webhook/whatsapp`
*   **Método:** `POST`
*   **Autenticação:** Sim (Bearer Token)
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "mensagem": "TEMPORADA reservas ASB402"
    }
    ```
*   **Resposta (200 OK - Retorno de Texto Puro / Plain Text):**
    ```text
    🗓️ Reservas:

    👤 Monica Ferreira Dos Santos
    📅 12/06/2026 a 14/06/2026 💰 R$ 629,99

    👤 Júnior Oliveira
    📅 18/06/2026 a 21/06/2026 💰 R$ 891,00
    ```

---

### G. Webhook de Edição do Sheets (`aoEditar`)
Disparado pelo gatilho instalável da planilha. Sincroniza edições críticas feitas manualmente na planilha (alteração de data de check-in, check-out ou nome do hóspede) no Google Calendar correspondente.

*   **Rota:** `/webhook/sheet-update`
*   **Método:** `POST`
*   **Autenticação:** Sim (Bearer Token)
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "sheetName": "Reserva",
      "row": 9,
      "column": 8,
      "value": "Marta da Silva"
    }
    ```
*   **Resposta (200 OK):**
    ```json
    {
      "status": "200",
      "message": "Sincronização de edição manual concluída com sucesso."
    }
    ```

---

### H. Lançamento de Débito (Financeiro)
Lança uma despesa na planilha financeira dedicada da propriedade.

*   **Rota:** `/financeiro/debito`
*   **Método:** `POST`
*   **Autenticação:** Sim (Bearer Token)
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "idPropriedade": "ASB402",
      "descricao": "Concerto do chuveiro",
      "valor": 150.00,
      "data": "12/06/2026"
    }
    ```
*   **Resposta (200 OK):**
    ```json
    {
      "status": "200",
      "message": "Débito lançado com sucesso."
    }
    ```
