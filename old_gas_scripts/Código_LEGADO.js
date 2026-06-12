// Módulo principal APP TEMPORADA
/* 
Fazer
*/
// throw "MANUTENÇÃO NA PLANILHA";
var ss = SpreadsheetApp.getActiveSpreadsheet();

if (!ss) { console.log("Sem planilha"); throw new Error("Sem planilha"); }
if (!ss.getActiveSheet()) { console.log("Sem planilha"); throw new Error("Sem planilha"); }

var mudouSheet = ss.getSheetName();
var mudouLastRow = ss.getLastRow();
var mudouLastColumn = ss.getLastColumn();
var mudouLinha = mudouLastRow;
var mudouColuna = mudouLastColumn;

if (ss.getActiveSheet().getCurrentCell().getRow()) {
  mudouLinha = ss.getActiveSheet().getCurrentCell().getRow();
  mudouColuna = ss.getActiveSheet().getCurrentCell().getColumn();
}

let sheetPropriedade = ss.getSheetByName("Propriedade");
let lastRowPropriedade = sheetPropriedade.getLastRow();
let lastColumnPropriedade = sheetPropriedade.getLastColumn();
let rangePropriedade = sheetPropriedade.getRange(1, 1, lastRowPropriedade, lastColumnPropriedade).getDisplayValues();
let arrayIdPropriedade =
  Array.from(new Set(sheetPropriedade.getRange(2, 1, lastRowPropriedade, 1).getDisplayValues().flat().filter(value => value !== "")));
let titulosColunasPropriedade = rangePropriedade[0];

let sheetTemporada = ss.getSheetByName("Temporada");
let lastRowTemporada = sheetTemporada.getLastRow();
let lastColumnTemporada = sheetTemporada.getLastColumn();
let rangeTemporada = sheetTemporada.getRange(2, 1, lastRowTemporada, lastColumnTemporada).getDisplayValues();
/*
let sheetLog = ss.getSheetByName("Log");
let lastRowLog = sheetLog.getLastRow();
let lastColumnLog = sheetLog.getLastColumn();
let titulosColunas = [];
*/

const MSG = {
  OK: "Operação realizada com sucesso",
  COMANDO_INVALIDO:
    "Comando inválido",
  PROPRIEDADE_INVALIDA:
    "Propriedade inválida",
  DATA_INVALIDA:
    "Datas inválidas",
  RESERVA_NAO_ENCONTRADA:
    "Reserva não encontrada",
  PLANILHA_NAO_ENCONTRADA:
    "Planilha não encontrada",
  ERRO_SINCRONIZACAO:
    "Erro na sincronização",
  ERRO_INTERNO:
    "Erro interno"
};

console.log("MUDOU SHEET = " + mudouSheet + " LINHA = " + mudouLinha + " COLUNA = " + mudouColuna);

function doPost(request) {

  console.log('ENTROU NO POST');

  const emailUsuario = Session.getActiveUser().getEmail();
  const usuariosAutorizados = [
    "airton.aragao@gmail.com",
    "airtonaragao@gmail.com",
    "contatoacw@gmail.com",
    "tatianatymburiba@gmail.com"
  ];

  if (!usuariosAutorizados.includes(emailUsuario)) {
    //    throw new Error("Usuário não autorizado");
  }

  if (!isJSONObject(request.postData.contents)) throw new Error("Não objeto: ", request);

  const requestPost = JSON.parse(request.postData.contents);
  console.log(`doPost`, requestPost.comando, 'Planilha: ', requestPost.planilha, request);
  let _id = Number(requestPost.id);
  const _idConsulta = requestPost.idConsulta;
  let _comando = requestPost.comando;
  const _planilha = requestPost.planilha;
  const _idPropriedade = requestPost.idPropriedade;

  let _entrada = requestPost.entrada;
  if (!_entrada) _entrada = requestPost.inicio;
  let _saida = requestPost.saida;
  if (!_saida) _saida = requestPost.fim;
  //  const _valorLocacao = requestPost.valorLocacao;

  //  const _valorLocacao = normalizeToJsNumberString(requestPost.valorLocacao);
  const _valorLocacao = requestPost.valorLocacao;
  const _valorPago = requestPost.valorPago;
  let _valorDiaria = 0;
  const _valorBasico = requestPost.valorBasico;
  if (_valorBasico) _valorDiaria = Number(_valorBasico);

  const _tarifaBasica = requestPost.valorBasico;
  const _debitos = requestPost.debitos;
  const _acompanhante_1 = requestPost.acompanhante_1;
  const _veiculo_1 = requestPost.veiculo_1;
  const _status = requestPost.status;
  const _origem = requestPost.origem;
  const _idEvento = requestPost.idEvento;
  const _idContact = requestPost.idContact;
  const _nomeInteressado = requestPost.nome;
  const _emailInteressado = requestPost.email;
  const _cpfInteressado = requestPost.cpf;
  const _celularInteressado = requestPost.celular;
  const _endereco = requestPost.endereco;
  const _bairro = requestPost.bairro;
  const _cidade = requestPost.cidade;
  const _cep = requestPost.CEP;
  const _uf = requestPost.UF;
  const _calendario = requestPost.calendario;
  const _notificacao = requestPost.notificacao;
  const _idFirebase = requestPost.idFirebase;
  const _aceitaRegras = requestPost.aceitaRegras;
  const _local = requestPost.local;
  const _bloco = requestPost.bloco;
  const _apartamento = requestPost.apartamento;
  const _lotacao = requestPost.lotacao;
  const _qtdQuartos = requestPost.qtdQuartos;
  const _fotos = requestPost.fotos;
  const _taxaLimpeza = requestPost.taxaLimpeza;
  const _taxaEnxoval = requestPost.taxaEnxoval;
  const _taxaEnergia = requestPost.taxaEnergia;
  const _disponibilidade = requestPost.disponibilidade;
  const _jsonTarifas = requestPost.jsonTarifas;
  const _jsonCalendarios = requestPost.jsonCalendarios;

  let mensagem = 'Mensagem inicial';
  let result = { "status": "200", "message": mensagem };

  if (!_comando) throw new Error(result = { "status": "400", "message": "Comando ausente" });
  if (!_planilha) throw new Error(result = { "status": "400", "message": "Planilha ausente" });

  // Rever essa maneira de processar financeiro
  if (_planilha == "Financeiro") {
    var _resultFinanceiro = processaPostFinanceiro();
    return ContentService
      .createTextOutput(_resultFinanceiro)
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (result.status != '200')
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);

  const info = getInfoAba(_planilha, _idPropriedade);
  if (!info) {
    throw new Error("Aba não encontrada");
  }

  let sheetDados = info.sheetDados;
  let rangeDados = info.rangeDados;
  let lastRowDados = info.lastRowDados;
  let lastColumnDados = info.lastColumnDados;
  let arrayIdPropriedadeDados = info.arrayIdPropriedadeDados;
  let _arrayIdEventDados = info.arrayIdEventDados;
  let arrayIdConsulta = info.arrayIdConsulta;
  let _rangeJSON = info.rangeJson;

  if (_entrada) {
    const [diaE, mesE, anoE] = _entrada.split('/').map(Number);
    _entradaDate = _inicioDate = criarDataComFusoBrasileiro(diaE, mesE, anoE);
  }
  if (_saida) {
    const [diaS, mesS, anoS] = _saida.split('/').map(Number);
    _saidaDate = _fimDate = criarDataComFusoBrasileiro(diaS, mesS, anoS);
  }

  if (_comando !== 'RESERVAR' && _comando !== 'ATUALIZAR PROPRIEDADE') {
    if (!_idConsulta) {
      mensagem = "idConsulta inválida: " + _idConsulta;
      result = { status: "400", message: mensagem };
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    const indexId = arrayIdConsulta.indexOf(_idConsulta);
    if (indexId === -1) {
      mensagem = "idConsulta inexistente: " + _idConsulta;
      result = { status: "400", message: mensagem };
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    _id = indexId + 2;
  }

  if (result.status != '200')
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);

  switch (_comando) {
    case 'RESERVAR': {
      if (!_idPropriedade) {
        mensagem = "Reserva sem informar propriedade";
        result = { status: "500", message: mensagem };
        break;
      }
      const linhaPropriedade = rangePropriedade.find(linha => linha[0] === _idPropriedade);
      if (!linhaPropriedade) {
        mensagem = "Propriedade não encontrada: " + _idPropriedade;
        result = { status: "500", message: mensagem };
        break;
      }
      const arrayCalendarios = linhaPropriedade[31];
      const valorDiaria = linhaPropriedade[36];
      if (!arrayCalendarios || !valorDiaria) {
        mensagem = `Propriedade: ${_idPropriedade} - Reserva sem calendários ou diária`;
        result = { status: "500", message: mensagem };
        break;
      }
      if (checarData(_inicioDate) === false || checarData(_fimDate) === false) {
        mensagem = `Datas inválidas: Início ${_inicioDate} - Fim ${_fimDate}`;
        result = { status: "400", message: mensagem };
        break;
      }
      if (_fimDate <= _inicioDate) {
        mensagem = "Inicio >= Fim";
        result = { "status": "400", "message": mensagem };
        break;
      }
      let _calendarioPeriodosEspeciais = linhaPropriedade[32];
      let _jsonCalendarios = JSON.parse(linhaPropriedade[31]);
      let _calendarioProprio = _jsonCalendarios[0].icalId;
      if (_valorDiaria == null || _valorDiaria === 0) _valorDiaria = linhaPropriedade[36];
      if (_taxaLimpeza == null || _taxaLimpeza === 0) _taxaLimpeza = linhaPropriedade[15];
      if (_taxaEnxoval == null || _taxaEnxoval === 0) _taxaEnxoval = linhaPropriedade[17];
      if (_taxaEnergia == null || _taxaEnergia === 0) _taxaEnergia = linhaPropriedade[19];
      var _saidaReserva = new Date(_fimDate); _saidaReserva.setDate(new Date(_fimDate).getDate() + 1);
      var _descriptionObj =
        { "idPropriedade": _idPropriedade, "local": _idPropriedade.substring(0, 2), "valorLocacao": _valorLocacao, "valorPago": _valorPago, "nomeInteressado": _nomeInteressado, "celularInteressado": _celularInteressado, "cpfInteressado": _cpfInteressado, "emailInteressado": _emailInteressado, "pessoas": _lotacao, "entrada": _entrada, "saida": _saida, "idContact": "" };
      var _description = JSON.stringify(_descriptionObj);
      var _eventoCriado = {
        "id": _idPropriedade.toLowerCase() +
          new Date(new Date(new Date(_entradaDate)).toISOString()).getTime().toString() +
          new Date(new Date(new Date(_saidaDate)).toISOString()).getTime().toString() +
          'proprio',
        "location": _idPropriedade,
        "summary": _nomeInteressado,
        "description": _description,
        "start": { "date": _entradaDate.toISOString().substring(0, 10) },
        "end": { "date": _saidaReserva.toISOString().substring(0, 10) },
        "colorId": 3,
        "status": "confirmed",
        "extendedProperties": {
          "private": {
            _descriptionObj
          }
        }
      };
      try {
        result.message = "vai para bloqueiaCalendarReserva"
        var _resultadoReserva =
          JSON.parse(bloqueiaCalendarReserva(_entradaDate, _saidaDate, arrayCalendarios, _idPropriedade, JSON.stringify(_eventoCriado)));
        result.message = _resultadoReserva.status;

        request = requestPost;
        request.idEvento = _eventoCriado.id;
        makeemailReservar(request);

        if (_resultadoReserva.status == 'RESERVADA') {
          var _codigoReserva = new Date().getTime().toString();
          let _rangeFormaJson = "A" + (lastRowDados + 1).toString() + ":AZ" + (lastRowDados + 1).toString();
          var values = [[
            _codigoReserva,
            _idPropriedade,
            _idPropriedade.substr(0, 2),
            _entradaDate,
            _saidaDate,
            _valorLocacao ? Number(_valorLocacao) : 0,
            _valorPago ? JSON.stringify(_valorPago) : '[{}]',
            _nomeInteressado ? _nomeInteressado : '',
            _celularInteressado ? _celularInteressado : '',
            _cpfInteressado ? _cpfInteressado : '',
            _emailInteressado ? _emailInteressado : '',
            '',
            '=TEXT(D' + (lastRowDados + 1).toString() + '; "dd/mm/yyyy")',
            '=TEXT(E' + (lastRowDados + 1).toString() + '; "dd/mm/yyyy")',
            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', '', '', '',
            _eventoCriado.id,
            '', '', '', '', '', '', '',
            'TEMPORADA',
            '',
            'RESERVADA',
            '=ARRAYFORMULA("{" & TEXTJOIN(", "; TRUE; IF(A$1:AZ$1 <> ""; """" & A$1:AZ$1 & """: " & IF(A$1:AZ$1 = "valorPago"; "" & TEXTJOIN(", "; TRUE; FILTER(' + _rangeFormaJson + '; A$1:AZ$1 = "valorPago")) & ""; IF(LEFT(' + _rangeFormaJson + '; 1) = "{"; ' + _rangeFormaJson + '; IF(LEFT(' + _rangeFormaJson + '; 1) = "["; ' + _rangeFormaJson + '; """" & ' + _rangeFormaJson + ' & """"))); ""))) & "}"'
          ]];
          sheetDados.appendRow(values[0]);
          lastRowDados = sheetDados.getLastRow;
          sheetDados.sort(42);
          result.message = "vai mandar o mail de reservada"
          request.subject = "Reserva confirmada para " + _nomeInteressado;
          result = {
            "status": "200",
            "message": _resultadoReserva.message,
            "disponibilidade": true,
          };
        } else {
          result = {
            "status": "500", "message": _resultadoReserva.message, "disponibilidade": false,
          }
          request.subject = "Reserva NÃO confirmada para " + _nomeInteressado;
        }

        MailApp.sendEmail({
          to: 'airtonaragao@gmail.com',
          //          cc: request.emailInteressado,
          subject: request.subject,
          htmlBody: request.message,
        });

        break;
      }
      catch (erro) {
        result.message = "Deu erro"
        mensagem = "Erro na solicitação da reserva: " + erro;
        result = { "status": "500", "message": mensagem, "erro": erro.stack, "disponibilidade": false };
        mandaemailErro(result.message);
        break;
      }
    } // Encerra RESERVAR
    case 'CANCELAR': {
      for (_elementoPropriedade of rangePropriedade) {
        if (_elementoPropriedade[0] == sheetDados.getRange(_id, 2).getValue()) {
          var arrayCalendarios = JSON.parse(_elementoPropriedade[31]);
          var _calendarPropriedade = arrayCalendarios[0].icalId;
          break;
        }
      }
      var _idEventoCancelar = sheetDados.getRange(_id, 42).getValue();
      try {
        CalendarApp.getCalendarById(_calendarPropriedade).getEventById(_idEventoCancelar).deleteEvent();
        sheetDados.deleteRow(_id);
        lastRowDados = sheetDados.getLastRow();
        result = { "status": "200", "message": "Reserva cancelada" };
      }
      catch (erro) {
        mensagem = "Erro no tratamento de evento: " + _idEventoCancelar + ' ' + erro;
        result = { "status": "500", "message": mensagem, "erro": erro.stack };
        mandaemailErro(result.message);
      }
      console.log(result.status, result.message);
      break;
    } // encerra CANCELAR
    case "ALTERAR": {
      // MUDAR PARA DAR SÓ UMA CHAMADA
      try {
        if (_valorLocacao) sheetDados.getRange(_id, 6).setValue(_valorLocacao);
        if (_valorPago) { // garante que só entrem valores com , como separador decimal
          const valorPagoFormatado = _valorPago.map(item => {
            const itemFormatado = {};
            for (const chave in item) {
              const valor = item[chave];

              if (['valor', 'comissao'].includes(chave)) {
                // Trata número ou string ("1234.56", "1.234,56")
                const valorNumerico = typeof valor === 'number'
                  ? valor
                  : parseFloat(
                    valor
                      .toString()
                      .replace(/\./g, '')
                      .replace(',', '.')
                  );

                // Se não for número válido, mantém o original como está
                itemFormatado[chave] = isNaN(valorNumerico) ? valor : valorNumerico;
              } else {
                // Mantém campos como data, banco, etc.
                itemFormatado[chave] = valor;
              }
            }

            return itemFormatado;
          });

          sheetDados.getRange(_id, 7).setValue(JSON.stringify(valorPagoFormatado));
        }

        //        if (_valorPago) { sheetDados.getRange(_id, 7).setValue(JSON.stringify(_valorPago)) };

        if (_status == "CONCILIADA") sheetDados.getRange(_id, lastColumnDados - 1).setValue("CONCILIADA");
        if (_nomeInteressado) sheetDados.getRange(_id, 8).setValue(_nomeInteressado);
        if (_celularInteressado) sheetDados.getRange(_id, 9).setValue(_celularInteressado);
        if (_cpfInteressado) sheetDados.getRange(_id, 10).setValue(_cpfInteressado);
        if (_emailInteressado) sheetDados.getRange(_id, 11).setValue(_emailInteressado);
        if (_endereco) sheetDados.getRange(_id, 21).setValue(_endereco);
        if (_bairro) sheetDados.getRange(_id, 22).setValue(_bairro);
        if (_cep) sheetDados.getRange(_id, 23).setValue(_cep);
        if (_cidade) sheetDados.getRange(_id, 24).setValue(_cidade);
        if (_uf) sheetDados.getRange(_id, 25).setValue(_uf);
        //        if (_limpezaEntrada) sheetDados.getRange(_id, 44).setValue(_limpezaEntrada);
        //        if (_enxoval) sheetDados.getRange(_id, 45).setValue(_enxoval);
        //        if (_energia) sheetDados.getRange(_id, 46).setValue(_energia);
        if (_acompanhante_1) sheetDados.getRange(_id, 28).setValue(_acompanhante_1);
        if (_veiculo_1) sheetDados.getRange(_id, 26).setValue(_veiculo_1);
        result = {
          "status": "200", "message": "Alteração feita!"
        };
        if (_debitos) {
          _comando = "DEBITAR";
          console.log("Vai processar financeiro");
          processaPostFinanceiro();
        }
        break;
      }
      catch (erro) {
        mensagem = "Erro em ALTERAR: " + erro;
        result = { "status": "500", "message": mensagem, "erro": erro.stack };
        mandaemailErro(result.message);
        break;
      }
    } // Encerra ALTERAR
    case 'ATUALIZAR PROPRIEDADE': {
      if (!_idPropriedade || _idPropriedade == "") {
        mensagem = "idPropriedade em branco";
        result = { "status": "400", "message": mensagem };
        break;
      }
      if (_idPropriedade) {
        _id = 1;
        for (var i = 0; i < lastRowPropriedade; i++) {
          if (rangePropriedade[i][0] == _idPropriedade) { _id = i + 1; break };
        }
        if (_id == 1) {
          mensagem = "idPropriedade inexistente: " + _idPropriedade;
          result = { "status": "400", "message": mensagem };
          break;
        }
      }
      try {
        if (_cpfInteressado) sheetPropriedade.getRange(_id, 2).setValue(_cpfInteressado);
        if (_nomeInteressado) sheetPropriedade.getRange(_id, 3).setValue(_nomeInteressado);
        if (_emailInteressado) sheetPropriedade.getRange(_id, 4).setValue(_emailInteressado);
        if (_celularInteressado) sheetPropriedade.getRange(_id, 5).setValue(_celularInteressado);
        if (_lotacao) sheetPropriedade.getRange(_id, 9).setValue(_lotacao);
        if (_qtdQuartos) sheetPropriedade.getRange(_id, 10).setValue(_qtdQuartos);
        if (_fotos) sheetPropriedade.getRange(_id, 14).setValue(_fotos);
        if (_taxaLimpeza) sheetPropriedade.getRange(_id, 16).setValue(_taxaLimpeza);
        if (_taxaEnxoval) sheetPropriedade.getRange(_id, 18).setValue(_taxaEnxoval);
        if (_taxaEnergia) sheetPropriedade.getRange(_id, 20).setValue(_taxaEnergia);
        if (_disponibilidade) sheetPropriedade.getRange(_id, 26).setValue(_disponibilidade);
        //        if (_calendario) sheetPropriedade.getRange(_id, 32).setValue(_calendario);
        //        if (_jsonCalendarios) sheetPropriedade.getRange(_id, 32).setValue(_jsonCalendarios);
        //        if (_jsonTarifas) sheetPropriedade.getRange(_id, 33).setValue(_jsonTarifas);
        if (_tarifaBasica) sheetPropriedade.getRange(_id, 37).setValue(_tarifaBasica);
        //        var titulosColunas = []; titulosColunas = rangePropriedade[0];
        //        var dadosColunas = []; dadosColunas = rangePropriedade[_id-1];
        //        var novoJson = JSON.stringify(produzJson(titulosColunas, dadosColunas, _planilha));
        //        sheetPropriedade.getRange(_id, lastColumnDados).setValue(JSON.parse(novoJson));
        result = { "status": "200", "message": "Propriedade atualizada" };
        break;
      }
      catch (erro) {
        mensagem = "Erro na atualização da Propriedade: " + erro;
        result = { "status": "500", "message": mensagem, "erro": erro.stack };
        mandaemailErro(result.message);
        break;
      }
    } // encerra ATUALIZAR PROPRIEDADE
    default: {
      console.log('ERRO: COMANDO INVALIDO');
      mensagem = "Comando inválido: " + _comando;
      result = { "status": "500", "message": mensagem };
      break;
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);

  function processaPostFinanceiro() {
    let _spreadSheetId = "16T6pTdMVjhL83BDAtiQyY8Kj0DJjaEjE4XzvyOifzC4" // PLANILHA FINANCEIRO
    let ss = SpreadsheetApp.openById(_spreadSheetId);
    const meses =
      ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
    switch (_comando) {
      case "": { return; }
      case "DEBITAR":
      case "DEBITAR TOTAL":
      case "ZERAR": {
        if (!_debitos) throw new Error("SEM DADOS DE DEBITOS: " + _idPropriedade);
        let sheetDados = ss.getSheetByName(_idPropriedade);
        if (!sheetDados) throw new Error("SEM PLANILHA DE PROPRIEDADE: " + _idPropriedade);
        const lastRowDados = sheetDados.getLastRow();
        const lastColumnDados = 16;
        let rangeDados = sheetDados.getRange(1, 1, lastRowDados, lastColumnDados).getDisplayValues();
        let titulosColunas = []; titulosColunas = rangeDados[0];
        let _dataHoje = new Date();
        let noteJSON = []
        let objNote = {
          "Data": _dataHoje.toLocaleDateString('pt-BR'),
          "Valor": 0,
          "Observacao": ""
        };
        let arrayDebitos = _debitos;
        for (const debito of arrayDebitos) {
          let linhaDados = 0;
          for (const linha of rangeDados) {
            linhaDados = linhaDados + 1;
            if (linha[0] == "TOTAL DESPESA") { break; };
            if (linha[0] == "RECEITA") { break; };
            if (linha[0] == "RESERVAS") { break; }
            if (linha[0] == "DIARIAS GRATIS") { break; }
            if (linha[0] == "DESPESA" || linha[0] == "TIPO") { continue };
            if (linhaDados === 1) { continue; }
            if (linha[0] === debito.tipoDespesa) {
              const _indiceColuna = titulosColunas.indexOf(debito.mesDespesa);
              if (_comando == "ZERAR") {
                sheetDados.getRange(linhaDados, _indiceColuna + 1).setValue("=0");
                objNote.Observacao = "Lançamentos zerados";
                noteJSON.push(objNote);
                sheetDados.getRange(linhaDados, _indiceColuna + 1).setNote(JSON.stringify(noteJSON));
                break;
              }
              const _debitosAnteriores = sheetDados.getRange(linhaDados, _indiceColuna + 1).getValue();
              const _debitoAtualizado = ("=" + _debitosAnteriores + "+" + debito.valor)
                .replace(/\./g, ",").replace(/==/g, "=");
              sheetDados.getRange(linhaDados, _indiceColuna + 1).setValue(_debitoAtualizado);
              const _notesAnteriores = sheetDados.getRange(linhaDados, _indiceColuna + 1).getNote();
              (_notesAnteriores == null || _notesAnteriores == '' || !isJSONObject(_notesAnteriores))
                ? noteJSON = [] : noteJSON = JSON.parse(_notesAnteriores);
              objNote.Valor = debito.valor;
              objNote.Observacao = debito.notaDespesa;
              noteJSON.push(objNote);
              sheetDados.getRange(linhaDados, _indiceColuna + 1).setNote(JSON.stringify(noteJSON));
              break;
            }
          } // Encerra for de linhas
        } // Encerra for de debitos
        var mensagem = "Debitos processados: " + _idPropriedade;
        result = { "status": "200", "message": mensagem };
        return (JSON.stringify(result));
      } // Encerra DEBITAR, DEBITAR TOTAL, ZERAR
    } // Encerra Switch COMANDO
  } // Encerra processaPostFinanceiro
} // Encerra POST

function doGet(request) {

  const emailUsuario = Session.getActiveUser().getEmail();
  const usuariosAutorizados = [
    "airton.aragao@gmail.com",
    "airtonaragao@gmail.com",
    "contatoacw@gmail.com",
    "tatianatymburiba@gmail.com"
  ];

  if (!usuariosAutorizados.includes(emailUsuario)) {
    //   throw new Error("Usuário não autorizado");
  }

  console.log('Planilha: ', request.parameter.planilha, 'ID: ', request.parameter.id, 'Comando: ', request.parameter.comando);
  console.log(`doGet`, request.queryString);
  var result = { "status": "200", "message": "Tudo OK" };
  let _comando = request.parameter.comando;
  let _planilha = request.parameter.planilha;
  let _id = request.parameter.id;
  let _idPropriedadeFiltro = request.parameter.idPropriedadeFiltro;
  // REVER
  if (_idPropriedadeFiltro == "TODAS") _idPropriedadeFiltro = "";
  let _emailUsuarioFiltro = request.parameter.emailUsuarioFiltro;
  let _celularUsuarioFiltro = request.parameter.celularUsuarioFiltro;
  let _idConsultaFiltro = request.parameter.idConsultaFiltro;
  let _idConsulta = request.parameter.idConsulta;
  let _idEventoFiltro = request.parameter.idEventFiltro;
  let _idOrigemFiltro = request.parameter.idOrigemFiltro;
  let _emailFirebaseFiltro = request.parameter.emailFirebase;
  let _idFirebase = request.parameter.idFirebase;
  let _entrada = request.parameter.entrada;
  let _saida = request.parameter.saida;
  let _inicio = request.parameter.inicio;
  let _fim = request.parameter.fim;
  //  let _valorLocacao = request.parameter.valorLocacao;
  //  let _valorLocacao = normalizeToJsNumberString(request.parameter.valorLocacao);
  let _valorLocacao = request.parameter.valorLocacao;

  let _valorPago = request.parameter.valorPago;
  let _valorBasico = request.parameter.valorTarifaBasica;
  let _valorDiaria = (typeof request.parameter["valorTarifaBasica"] === "number" && request.parameter["valorTarifaBasica"] > 0)
    ? request.parameter["valorTarifaBasica"] : 0;
  let _taxaLimpeza = (typeof request.parameter["valorTaxaLimpeza"] === "number" && request.parameter["valorTaxaLimpeza"] > 0)
    ? request.parameter["valorTaxaLimpeza"] : 0;
  let _taxaEnxoval = (typeof request.parameter["valorTaxaEnxoval"] === "number" && request.parameter["valorTaxaEnxoval"] > 0)
    ? request.parameter["valorTaxaEnxoval"] : 0;
  let _taxaEnergia = (typeof request.parameter["valorTaxaEnergia"] === "number" && request.parameter["valorTaxaEnergia"] > 0)
    ? request.parameter["valorTaxaEnergia"] : 0;
  let _acompanhante_1 = request.parameter.acompanhante_1;
  let _veiculo_1 = request.parameter.veiculo_1;
  let _origem = request.parameter.origem;
  let _nomeInteressado = request.parameter.nomeInteressado;
  let _celularInteressado = request.parameter.celularInteressado;
  let _cpfInteressado = request.parameter.cpfInteressado;
  let _emailInteressado = request.parameter.emailInteressado;
  let _endereco = request.parameter.endereco;
  let _bairro = request.parameter.bairro;
  let _cidade = request.parameter.cidade;
  let _cep = request.parameter.CEP;
  let _uf = request.parameter.UF;
  let _notificacao = request.parameter.notificacao;
  let _aceitaRegras = request.parameter.aceitaRegras;
  let _disponibilidade = request.parameter.disponibilidade;
  let _idEvento = request.parameter.idEvento;
  let _idContact = request.parameter.idContact;
  let _calendario = request.parameter.calendario;
  let _jsonReservas = request.parameter.jsonReservas;

  const _mensagemZap = request.parameter.mensagemZap;
  if(_mensagemZap) {
    let _mensagemZapProcessada = JSON.parse(processaMensagemZap(_mensagemZap));
    _comando = _mensagemZapProcessada.comando;
    _planilha = _mensagemZapProcessada.planilha;
    _idPropriedadeFiltro = _mensagemZapProcessada.propriedade;
    let _propriedadesArray = _mensagemZapProcessada.propriedades;
    _local = _mensagemZapProcessada.local;
    let _periodo = _mensagemZapProcessada.periodo;
    _inicio = _mensagemZapProcessada.dataInicio;
    _fim = _mensagemZapProcessada.dataFim;
    _nomeInteressado = _mensagemZapProcessada.nome;
    _valorLocacao = _mensagemZapProcessada.valor;

   console.log ("Retorno mensagem ZAP: " + JSON.stringify(_mensagemZapProcessada));
   console.log ("Planilha " + _planilha)
//    return ContentService.createTextOutput("Retorno mensagem ZAP: " + _mensagemZapProcessada);
  }
  if (_inicio) {
    var [day, month, year] = _inicio.split('/');
    var _inicioDate = new Date(+year, month - 1, +day);
    _inicioDate.setHours(00, 00, 00, 000);
  }
  if (_fim) {
    var [day, month, year] = _fim.split('/');
    var _fimDate = new Date(+year, month - 1, +day);
    _fimDate.setHours(00, 00, 00, 000);
  }
  // Rever essa maneira de processar financeiro
  if (_planilha == "Financeiro") {
    var _resultFinanceiro = processaGetFinanceiro();
    return ContentService
      .createTextOutput(_resultFinanceiro)
      .setMimeType(ContentService.MimeType.JSON);
  }

  console.log("Planilha do zap: ", _planilha)
  const info = getInfoAba(_planilha, _idPropriedadeFiltro);
  if (!info) {
    throw new Error("Aba não encontrada");
  }
  let sheetDados = info.sheetDados;
  let rangeDados = info.rangeDados;
  let lastRowDados = info.lastRowDados;
  let lastColumnDados = info.lastColumnDados;
  let arrayIdPropriedadeDados = info.arrayIdPropriedadeDados;
  let _arrayIdEventDados = info.arrayIdEventDados;
  let arrayIdConsulta = info.arrayIdConsulta;
  let _rangeJSON = info.rangeJson;

  if (!['SETAR RESERVA', 'SIMULAR', 'NOTIFICAR', 'SINCRONIZAR', 'CONTABILIZAR', 'AUTORIZAR', 'ALERTAR', 'SOMAR', 'LISTAR', 'CONCILIAR', 'COMPLEMENTAR', ''].includes(_comando)) {
    return ContentService.createTextOutput("Comando inválido: " + _comando);
  }

  if (!['SINCRONIZAR', 'CONTABILIZAR', 'SIMULAR', 'LISTAR', 'SOMAR', 'CONCILIAR', 'COMPLEMENTAR', ''].includes(_comando)) {

    if (!_idConsulta) {
      throw new Error("idConsulta inválida: " + _idConsulta);
      //      return ContentService.createTextOutput("idConsulta inválida: " + _idConsulta);
    }
    const indexId = arrayIdConsulta.indexOf(_idConsulta);
    if (indexId === -1) {
      throw new Error("idConsulta inexistente: " + _idConsulta);
      //      return ContentService.createTextOutput("idConsulta inexistente: " + _idConsulta);
    }
    _id = indexId + 2;
  }

  switch (_comando) {
    case "SETAR RESERVA": {
      var mensagem = 'Mensagem inicial';
      var result = { "status": "200", "message": mensagem };
      result = {
        "status": "400",
        "message": "Reserva não setada",
        "Resultado": {
          "idPropriedade": null,
          "local": null,
          "calendario": null,
          "valorLocacao": null,
          "valorPago": 0,
          "taxaEnxoval": 0,
          "nomeInteressado": null,
          "celularInteressado": null,
          "cpfInteressado": null,
          "endereco": null,
          "cidade": null,
          "cep": null,
          "uf": null,
          "veiculo_1": null,
          "acompanhante_1": null,
          "disponibilidade": false
        }
      };
      for (_elementoReserva of rangeDados) {
        if (_elementoReserva[0] == _idConsulta) {
          result = {
            "status": "200",
            "message": "Reserva setada",
            "Resultado": JSON.parse(_elementoReserva[lastColumnReserva - 1])
          }
          break;
        }
      }
      break;
    } // Encerra SETAR RESERVA
    case "SIMULAR": {
      result = {
        "status": "200",
        "message": 'Mensagem inicial',
        "Resultado": {
          "disponibilidade": false,
          "valor": "0",
          "dataEntrada": _inicio,
          "dataSaida": _fim,
          "menorEstadiaPeriodo": " ",
          "datasEspeciaisReserva": " ",
          "diasReserva": " ",
          "valorDiasNormais": " ",
          "valorBasicoDiaria": " ",
          "qtdDiasEspeciais": " ",
          "valorDiasEspeciais": " ",
          "tarifaBasica": "",
          "taxaLimpeza": "",
          "taxaEnxoval": "",
          "taxaEnergia": "",
          "possibilidade": false
        }
      }
      if (checarData(_inicioDate) === false || checarData(_fimDate) === false) {
        mensagem = `Datas inválidas: Início ${_inicioDate} - Fim ${_fimDate}`;
        result = { status: "400", message: mensagem };
        break;
      }
      if (_fimDate <= _inicioDate) {
        result.status = "400"; result.message = "Inicio >= Fim";
        break;
      }

      var linhaPropriedade = rangePropriedade.findIndex(function (row) {
        return row[0] === _idPropriedadeFiltro;
      });

      let _calendarioPeriodosEspeciais = rangePropriedade[linhaPropriedade][32];
      let _jsonCalendarios = JSON.parse(rangePropriedade[linhaPropriedade][31]);
      let _calendarioProprio = _jsonCalendarios[0].icalId;
      if (_valorDiaria == 0) _valorDiaria = rangePropriedade[linhaPropriedade][36];
      if (_taxaLimpeza == 0) _taxaLimpeza = rangePropriedade[linhaPropriedade][15];
      if (_taxaEnxoval == 0) _taxaEnxoval = rangePropriedade[linhaPropriedade][17];
      if (_taxaEnergia == 0) _taxaEnergia = rangePropriedade[linhaPropriedade][19];

      try {
        const _resultadoConsulta =
          JSON.parse(analisaConsulta(_idPropriedadeFiltro, _calendarioProprio, _calendarioPeriodosEspeciais, _inicioDate, _fimDate, _valorDiaria));
        result = {
          "status": "200",
          "message": _resultadoConsulta.message,
          "Resultado": {
            "disponibilidade": _resultadoConsulta.disponibilidade,
            "valor": _resultadoConsulta.valor,
            "dataEntrada": _inicio,
            "dataSaida": _fim,
            "menorEstadiaPeriodo": _resultadoConsulta.menorEstadiaPeriodo,
            "datasEspeciaisReserva": _resultadoConsulta.datasEspeciaisReserva,
            "diasReserva": _resultadoConsulta.diasReserva,
            "valorDiasNormais": _resultadoConsulta.valorDiasNormais,
            "qtdDiasEspeciais": _resultadoConsulta.qtdDiasEspeciais,
            "valorDiasEspeciais": _resultadoConsulta.valorDiasEspeciais,
            "valorBasicoDiaria": _resultadoConsulta.valorBasicoDiaria,
            "taxaLimpeza": _taxaLimpeza,
            "taxaEnxoval": _taxaEnxoval,
            "taxaEnergia": _taxaEnergia,
            "possibilidade": true
          }
        };
        if (_resultadoConsulta.status == "SUCESSO" && _resultadoConsulta.disponibilidade === true) result.message == "Simulação OK";
        if (_resultadoConsulta.status == "SUCESSO" && _resultadoConsulta.disponibilidade === false) result.message == "Indisponível";
      }
      catch (erro) {
        mensagem = "Erro na solicitação da Consulta: " + erro + erro.stack;
        result = { "status": "400", "message": mensagem, "erro": erro.stack }
        mandaemailErro(result.message);
      }
      break;
    } // Encerra SIMULAR
    // Transferir esse NOTIFICAR para o POST, já que altera 
    case 'NOTIFICAR': {
      try {
        if (_notificacao) sheetDados.getRange(_id, 18).setValue(_notificacao);
        sheetDados.getRange(_id, lastColumnDados).setValue('');
        result = { "status": "200", "message": "Reserva alterada" };
        break;
      }
      catch (erro) {
        mensagem = "Erro na atualização da Reserva: " + erro;
        result = { "status": "500", "message": mensagem, "erro": erro.stack };
        mandaemailErro(result.message);
        break;
      }
    } // Encerra NOTIFICAR
    // SINCRONIZAR também altera mas é um processamento em batch
    case 'SINCRONIZAR': {
      mensagem = "Sincronização ok";
      result = { "status": "200", "message": mensagem };
      if (_idPropriedadeFiltro == "ASB402") preparaEventosASB402();
      try {
        if (!_idPropriedadeFiltro) {
          sincroniza('', '')
        }
        else sincroniza(_idPropriedadeFiltro, '');
        break;
      }
      catch (erro) {
        mensagem = "Erro na sincronização: " + erro;
        result = { "status": "500", "message": mensagem, "erro": erro.stack };
        break;
      }
    } // Encerra SINCRONIZAR
    case 'CONTABILIZAR': {
      mensagem = "Contabilização ok";
      result = { "status": "200", "message": mensagem };
      try {
        if (!_idPropriedadeFiltro || _idPropriedadeFiltro == "TODAS ") {
          contabilizaReceitas('TODAS')
        }
        else contabilizaReceitas(_idPropriedadeFiltro);
        break;
      }
      catch (erro) {
        mensagem = "Erro na contabilização: " + erro;
        result = { "status": "500", "message": mensagem, "erro": erro.stack };
        mandaemailErro(result.message);
        break;
      }
    } // Encerra CONTABILIZAR
    case 'AUTORIZAR': {
      if (sheetDados.getRange(_id, lastColumnDados).getValue() != "RESERVADA") {
        status = 'ERRO:SEM RESERVA';
        break;
      }
      autorizacaoEnviada = autorizaEstadia(request);
      status = autorizacaoEnviada;
      break;
    } // Encerra AUTORIZAR
    case "ALERTAR": {
      try {
        sheetDados.getRange(_id, lastColumnDados).setValue('');
        result = { "status": "200", "message": "Alerta registrado!" };
        break;
      }
      catch (erro) {
        mensagem = "Erro na atualização da Reserva: " + erro;
        result = { "status": "500", "message": mensagem, "erro": erro.stack };
        mandaemailErro(result.message);
        break;
      }
    } // Encerra ALERTAR
    // Analisar a separação do SOMAR
    case "SOMAR":
    case "LISTAR": {
      let retornoDados = null;
      let arrayDeDados = {};
      let arrayDeLinhas = [];
      //      let arrayDeEntradas = [];
      let linhaInicial = 2;
      let linhaFinal = lastRowDados;
      if (_idConsultaFiltro) {
        const index = arrayIdConsulta.indexOf(_idConsultaFiltro);
        if (index !== -1) {
          const idConvertido = index + 1;
          if (idConvertido >= 2 && idConvertido <= lastRowDados) {
            linhaInicial = idConvertido;
            linhaFinal = idConvertido;
          }
        }
      }
      var arrayDeTotais = [{
        "idPropriedade": "TODAS",
        "Diarias": 0,
        "Reservas": 0,
        "Entradas": 0,
        "Estadias": 0,
        "Valor": 0,
        "Pago": 0
      }];
      let linhaDados = 0;
      for (let linha of rangeDados) {
        let diasReservados = 0;
        linhaDados = linhaDados + 1;
        if (linhaDados == 1) continue; // Linha de titulos
        if (linhaFinal == linhaInicial && (Number(_id) >= 2 && Number(_id) <= lastRowDados)) {
          if (linhaDados < linhaFinal) continue;
          if (linhaDados > linhaFinal) break;
        }
        if (_planilha.startsWith("Reserva") || _planilha.startsWith("Estadia")) {
          if (_idPropriedadeFiltro) {
            if (linha[1] < _idPropriedadeFiltro) continue;
            if (linha[1] > _idPropriedadeFiltro) break;
          }
        }
        if (_planilha == "Propriedade") {
          if (_idPropriedadeFiltro && _idPropriedadeFiltro != "" && linha[0] != _idPropriedadeFiltro) continue;
        }
        try {
          var novoJson = JSON.parse(linha[lastColumnDados - 1]);
          arrayDeLinhas.push(novoJson);
        }
        catch (_erro) {
          console.log("Erro ao fazer parse do JSON:");
          console.log("Última linha válida:", arrayDeLinhas[arrayDeLinhas.length - 1]);
          console.log("Mensagem do erro:", _erro.message);
          console.log("Stack trace:", _erro.stack);
          throw new Error("Erro de parse");
        }

        if ((_planilha.startsWith("Reserva") || _planilha.startsWith("Estadia")) && (_comando == "SOMAR")) {
          let [day, month, year] = novoJson.entrada.split('/');
          var dateInicio = new Date(`${year}-${month}-${day}`);
          [day, month, year] = novoJson.saida.split('/');
          var dateFim = new Date(`${year}-${month}-${day}`);
          diasReservados = diasReservados + calculaDias(dateInicio, dateFim);
          const cleanedString = novoJson.valorLocacao.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
          var valorLocacaoLinha = parseFloat(cleanedString);
          let somaValorPagoLinha = 0;
          if (isJSONObject(novoJson.valorPago)) somaValorPagoLinha =
            JSON.parse(novoJson.valorPago).reduce((a, b) => a + (b.valor || 0), 0);
          let index = arrayDeTotais.map(item => item.idPropriedade).indexOf(linha[1]);
          if (index === -1)
            arrayDeTotais.push({
              "idPropriedade": linha[1],
              "Diarias": 0, "Reservas": 0, "Estadias": 0, "Valor": 0, "Pago": 0
            });

          let obj = arrayDeTotais.find(item => item.idPropriedade === linha[1]);

          if (obj) {
            obj.Diarias = obj.Diarias + diasReservados;
            arrayDeTotais[0].Diarias = arrayDeTotais[0].Diarias + diasReservados;
            arrayDeTotais[0].Diarias = arrayDeTotais[0].Diarias + diasReservados;
            obj.Valor = obj.Valor + valorLocacaoLinha;
            obj.Valor = parseFloat(obj.Valor.toFixed(2));
            obj.Pago = obj.Pago + somaValorPagoLinha;
            arrayDeTotais[0].Valor = arrayDeTotais[0].Valor + valorLocacaoLinha;
            arrayDeTotais[0].Valor = parseFloat(arrayDeTotais[0].Valor.toFixed(2));
            arrayDeTotais[0].Pago = arrayDeTotais[0].Pago + somaValorPagoLinha;
            if (_planilha == "Reserva") {
              obj.Reservas = obj.Reservas + 1;
              arrayDeTotais[0].Reservas = arrayDeTotais[0].Reservas + 1;
            }
            if (_planilha == "Estadia") {
              obj.Estadias = obj.Estadias + 1;
              arrayDeTotais[0].Estadias = arrayDeTotais[0].Estadias + 1;
            };
          }
        }
      } // Encerra for de linhas

      arrayDeDados[_planilha] = arrayDeLinhas;

      if (_planilha != "Propriedade") {
        arrayDeDados["Totais"] = arrayDeTotais;
        //        arrayDeDados["Entrada"] = arrayDeEntradas;
      }
/*      
      if (arrayDeLinhas.length == 0) {
        arrayDeDados[_planilha] = {};
        //        arrayDeEntradas["Entrada"] = {};
        result.status = "400";
        result.message = "Nenhuma reserva ou propriedade corresponde aos critérios";
        return ContentService
          .createTextOutput(JSON.stringify(arrayDeDados))
          .setMimeType(ContentService.MimeType.JSON);
      }
*/
if (arrayDeLinhas.length == 0) {

  arrayDeDados[_planilha] = {};

  result.status = "400";
  result.message = "Nenhuma reserva ou propriedade corresponde aos critérios";

  retornoDados = arrayDeDados;

}
/*
      if ((linhaInicial == linhaFinal) || (_planilha == "Propriedade" && arrayDeLinhas.length == 1)) {
        var objetoDeDados = {};
        objetoDeDados[_planilha] = arrayDeLinhas[0];
        return ContentService
          .createTextOutput(JSON.stringify(objetoDeDados))
          .setMimeType(ContentService.MimeType.JSON);
      }
*/
else if ((linhaInicial == linhaFinal) || (_planilha == "Propriedade" && arrayDeLinhas.length == 1)) {
  let objetoDeDados = {};
  objetoDeDados[_planilha] = arrayDeLinhas[0];
  result.status = "200";
  result.message = "Registro encontrado";
  retornoDados = objetoDeDados;
}

else {
  result.status = "200";
  result.message = "Consulta realizada";
  retornoDados = arrayDeDados;
}

/*
      return ContentService
        .createTextOutput(JSON.stringify(arrayDeDados))
        .setMimeType(ContentService.MimeType.JSON);
*/

result.data = retornoDados;
break;

    } // Encerra LISTAR
    case "CONCILIAR": {
      let linhaDados = 0;
      var arrayDeDados = {};
      var arrayDeLinhas = [];
      let startIndex = 0;
      if (_idPropriedadeFiltro && _idPropriedadeFiltro.trim() !== "")
        startIndex = arrayIdPropriedadeDados.findIndex(linha => linha == _idPropriedadeFiltro);
      for (var linha of rangeDados.slice(startIndex)) {
        linhaDados = linhaDados + 1;
        if (linhaDados == 1) continue; // Linha de titulos
        if (linha[lastColumnDados - 2] == 'CONCILIADA') continue;
        if (linha[lastColumnDados - 2] == 'CONTABILIZADA') continue;
        if (_idPropriedadeFiltro && _idPropriedadeFiltro.trim() !== "") {
          if (linha[1] < _idPropriedadeFiltro) continue;
          if (linha[1] > _idPropriedadeFiltro) break;
        }
        var novoJson = JSON.parse(linha[lastColumnDados - 1]);
        const cleanedString = novoJson["valorLocacao"].replace('R$ ', '').replace(/\./g, '').replace(',', '.');
        var valorLocacaoLinha = parseFloat(cleanedString);
        var jsonConcilia = {
          "idConsulta": novoJson.idConsulta,
          "idPropriedade": novoJson.idPropriedade,
          "entrada": novoJson.entrada,
          "saida": novoJson.saida,
          "valorLocacao": novoJson.valorLocacao,
          "valorPago": novoJson.valorPago,
          "valorRecebido": novoJson.valorPago.reduce((a, b) => a + (b.valor || 0), 0),
          "nomeInteressado": novoJson.nomeInteressado,
          "idEvent": novoJson.idEvent,
          "origem": novoJson.origem,
          "STATUS": novoJson.STATUS
        }
        arrayDeLinhas.push(jsonConcilia);
      } // Encerra for de linhas
      arrayDeDados[_planilha] = arrayDeLinhas;
      if (arrayDeLinhas.length == 0) {
        arrayDeDados[_planilha] = [];
        result.status = "200";
        result.message = "Nenhuma estadia a conciliar";
        return ContentService
          .createTextOutput(JSON.stringify(arrayDeDados))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService
        .createTextOutput(JSON.stringify(arrayDeDados))
        .setMimeType(ContentService.MimeType.JSON);
    } //  Encerra CONCILIAR
    case "COMPLEMENTAR": {
      result = {
        "status": "200", "message": "Complementação feita!"
      };
      const _arrayReservasComplementar = ajustarJsonReservasComplementar(_jsonReservas);
      for (const objetoReserva of _arrayReservasComplementar) {
        var index = _arrayIdEventDados.indexOf(objetoReserva.id);
        if (index == -1) {
          throw new Error("Erro em COMPLEMENTAR: idEvento não encontrado");
        }
        var linha = linhaInicial = linhaFinal = index + 2;
        try {
          sheetDados.getRange(linha, 6).setValue(objetoReserva.valorReserva);
          sheetDados.getRange(linha, 8).setValue(objetoReserva.nome);
          continue;
        }
        catch (erro) {
          throw new Error("Erro em COMPLEMENTAR: não conseguiu atualizar ");
        }
      } //Encerra for de reservas a complementar
      return ContentService
        .createTextOutput(JSON.stringify(arrayDeDados))
        .setMimeType(ContentService.MimeType.JSON);
    } // Encerra COMPLEMENTAR

    default: {
      const index = _idConsultaFiltro ? arrayIdConsulta.indexOf(_idConsultaFiltro) : -1;
      if (index !== -1) {
        const linha = index + 2;
        if (linha >= 2 && linha <= lastRowDados) {
          linhaInicial = linhaFinal = linha;
        }
      }

      arrayDeDados = {}
      arrayDeTotais = [];
      let linhaDados = 0;

      for (var linha of rangeDados) {
        linhaDados = linhaDados + 1;
        if (linhaDados == 1) continue; // Linha de titulos
        // Exclusões específicas
        if (linhaFinal == linhaInicial && (Number(_id) >= 2 && Number(_id) <= lastRowDados)) {
          if (linhaDados < linhaFinal) continue;
          if (linhaDados > linhaFinal) break;
        }
        if (_idPropriedadeFiltro) {
          if (linha[1] < _idPropriedadeFiltro) continue;
          if (linha[1] > _idPropriedadeFiltro) break;
        }
        var novoJson = JSON.parse(linha[lastColumnDados - 1]);
        arrayDeLinhas.push(novoJson);
      }

      var objetoTotais = {
        "Reservas": lastRowDados - 1,
        "Estadias": 9999999,
        //        "Entradas": arrayDeEntradas.length,
        "Diarias": 0
      };
      arrayDeDados["Totais"] = objetoTotais;
      arrayDeDados[_planilha] = arrayDeLinhas;
      if (arrayDeLinhas.length == 0) {
        arrayDeDados[_planilha] = {};
        result.status = "400";
        result.message = "Nenhuma reserva corresponde aos critérios";
        return ContentService
          .createTextOutput(JSON.stringify(arrayDeDados))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (linhaInicial == linhaFinal) {
        var objetoDeDados = {};
        objetoDeDados[_planilha] = arrayDeLinhas[0];
        return ContentService
          .createTextOutput(JSON.stringify(objetoDeDados))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService
        .createTextOutput(JSON.stringify(arrayDeDados))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

if (_mensagemZap) {
  return ContentService
  .createTextOutput(montaRetornoZap(_comando, result))
    .setMimeType(ContentService.MimeType.TEXT);
}
if (!_mensagemZap) {
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

  function processaGetFinanceiro() {
    let _spreadSheetId = "16T6pTdMVjhL83BDAtiQyY8Kj0DJjaEjE4XzvyOifzC4" // Cópia com layout ajustado
    let ss = SpreadsheetApp.openById(_spreadSheetId);
    switch (_comando) {
      case "": { return; }
      case "SOMAR":
      case "SOMAR TOTAL": {
        const meses =
          ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO", "TOTAL"];
        const mesAtual = new Date().getMonth(); // Janeiro = 0, Fevereiro = 1, ...
        const mesesAteAnterior = meses.slice(0, mesAtual); // Meses até o mês anterior
        let arrayDePropriedades = [{
          "idPropriedade": "TODAS",
          "despesas": [],
          "diariasGratis": 0,
          "totalDespesas":
          {
            "TIPO": "TOTAL DESPESAS",
            "JANEIRO": 0,
            "FEVEREIRO": 0,
            "MARÇO": 0,
            "ABRIL": 0,
            "MAIO": 0,
            "JUNHO": 0,
            "JULHO": 0,
            "AGOSTO": 0,
            "SETEMBRO": 0,
            "OUTUBRO": 0,
            "NOVEMBRO": 0,
            "DEZEMBRO": 0,
            "TOTAL": 0,
            "MEDIA": 0
          },
          "receitas": [],
          "diariasPagas": 0,
          "totalReceitas":
          {
            "TIPO": "TOTAL RECEITAS",
            "JANEIRO": 0,
            "FEVEREIRO": 0,
            "MARÇO": 0,
            "ABRIL": 0,
            "MAIO": 0,
            "JUNHO": 0,
            "JULHO": 0,
            "AGOSTO": 0,
            "SETEMBRO": 0,
            "OUTUBRO": 0,
            "NOVEMBRO": 0,
            "DEZEMBRO": 0,
            "TOTAL": 0,
            "MEDIA": 0
          },
          "diariasTotais": 0,
          "resultado":
          {
            "TIPO": "RESULTADO",
            "JANEIRO": 0,
            "FEVEREIRO": 0,
            "MARÇO": 0,
            "ABRIL": 0,
            "MAIO": 0,
            "JUNHO": 0,
            "JULHO": 0,
            "AGOSTO": 0,
            "SETEMBRO": 0,
            "OUTUBRO": 0,
            "NOVEMBRO": 0,
            "DEZEMBRO": 0,
            "TOTAL": 0,
            "MEDIA": 0
          }
        }];
        for (const propriedade of arrayIdPropriedade) {
          if (!propriedade || propriedade.trim() == '') break;
          if (_idPropriedadeFiltro != '' && _idPropriedadeFiltro != 'TODAS' && propriedade != _idPropriedadeFiltro) continue;
          let tipoLinha = "DESPESA";
          let sheetDados = ss.getSheetByName(propriedade);
          if (!sheetDados) throw new Error("SEM PLANILHA DE PROPRIEDADE: " + propriedade);
          const lastRowDados = sheetDados.getLastRow();
          const lastColumnDados = sheetDados.getLastColumn();
          let rangeDados = sheetDados.getRange(1, 1, lastRowDados, lastColumnDados).getDisplayValues();

          let titulosColunas = []; titulosColunas = rangeDados[0];
          titulosColunas[0] = "TIPO";

          // Daqui

          let ultimaColunaArray = rangeDados
            .slice(1)               // ignora cabeçalho
            .map(r => r[r.length - 1]);  // pega a última coluna

          // 1️⃣ Parse de todas as linhas de uma vez
          let ultimaColunaObjetos = ultimaColunaArray
            .map(str => {
              try {
                return JSON.parse(str);
              } catch (e) {
                return null; // ignora inválidos
              }
            })
            .filter(obj => obj !== null);

          // 2️⃣ Itera sobre os objetos já parseados
          let objPropriedade = {
            idPropriedade: propriedade,
            despesas: [],
            totalDespesas: {},
            receitas: [],
            totalReceitas: {},
            resultado: {},
            diariasGratis: {},
            diariasPagas: {},
            diariasTotais: {}
          };

          let secaoAtual = "despesas";
          for (let data of ultimaColunaObjetos) {
            if (data.TIPO === "TOTAL DESPESA") {
              objPropriedade.totalDespesas = data;
              secaoAtual = "receitas";
              continue;
            }
            if (data.TIPO === "TOTAL RECEITA") {
              objPropriedade.totalReceitas = data;
              secaoAtual = "resultado";
              continue;
            }
            if (secaoAtual === "despesas") {
              objPropriedade.despesas.push(data);
              continue;
            }
            if (secaoAtual === "receitas") {
              objPropriedade.receitas.push(data);
              continue;
            }
            if (data.TIPO === "RESULTADO") {
              objPropriedade.resultado = data;
              continue;
            }
            if (data.TIPO === "DIARIAS GRATIS") {
              objPropriedade.diariasGratis = data;
              continue;
            }
            if (data.TIPO === "DIARIAS PAGAS") {
              objPropriedade.diariasPagas = data;
              continue;
            }
            if (data.TIPO === "DIARIAS TOTAIS") {
              objPropriedade.diariasTotais = data;
              continue;
            }
          }

          arrayDePropriedades.push(objPropriedade);
          var arrayDeFinancas = { FINANCAS: arrayDePropriedades };
          return JSON.stringify(arrayDeFinancas);


          // Praqui
          /*
                    var objPropriedade = {
                      "idPropriedade": propriedade,
                      "diariasGratis": [],
                      "despesas": [],
                      "totalDespesas": {},
                      "diariasPagas": [],
                      "receitas": [],
                      "totalReceitas": {},
                      "diariasTotais": {},
                      "resultado": {}
                    }
          */
          let linhaDados = 0;

          for (const linha of rangeDados) { // Pega json da linha de dados
            linhaDados = linhaDados + 1;
            if (linha[0] == "DESPESA" || linha[0] == "TIPO") { tipoLinha = "DESPESA"; continue };
            if (linha[0] == "RECEITA") { tipoLinha = "RECEITA"; continue };
            if (linhaDados === 1) { continue; }
            if (_comando == "SOMAR TOTAL" &&
              (linha[0] != "TOTAL RECEITA" && linha[0] != "TOTAL DESPESA" && linha[0] != "RESULTADO")) { continue; }
            var novoJson = JSON.parse(sheetDados.getRange(linhaDados, lastColumnDados).getValue());
            if (linha[0] === "TOTAL DESPESA") {
              objPropriedade.totalDespesas = novoJson;
              continue;
            }
            if (linha[0] === "TOTAL RECEITA") {
              //              arrayDeTotaisReceitas.push(JSON.parse(novoJson));
              objPropriedade.totalReceitas = novoJson;
              continue;
            }
            if (linha[0] === "RESULTADO") {
              objPropriedade.resultado = novoJson;
              tipoLinha = "DIARIAS";
              continue;
            }
            if (linha[0] === "DIARIAS TOTAIS") {
              objPropriedade.diariasTotais = novoJson;
              break;
            }
            if (tipoLinha === "DESPESA") { objPropriedade.despesas.push(novoJson); continue };
            if (tipoLinha === "RECEITA") { objPropriedade.receitas.push(novoJson); continue };
            if (linha[0] === "DIARIAS GRATIS") { objPropriedade.diariasGratis.push(novoJson); continue };
            if (tipoLinha === "DIARIAS PAGAS") { objPropriedade.diariasPagas.push(novoJson); continue };
          } // Encerra for linhas

          // Função auxiliar para adicionar valores e arredondar
          function adicionarEArredondar(totalAtual, valorNovo) {
            let total = (parseFloat(totalAtual) || 0) + (parseFloat(valorNovo) || 0);
            return Math.round(total * 100) / 100; // Arredonda para 2 casas decimais
          }
          /*
                    let valorReceitasPraCalcularMedia = 0;
                    let valorDespesasPraCalcularMedia = 0;
                    let valorResultadosPraCalcularMedia = 0;
                    meses.forEach((mes, index) => {
                      let valorReceitas = parseFloat(objPropriedade.totalReceitas[mes]) || 0;
                      arrayDePropriedades[0].totalReceitas[mes] = adicionarEArredondar(arrayDePropriedades[0].totalReceitas[mes], valorReceitas);
                      valorReceitasPraCalcularMedia = adicionarEArredondar(valorReceitasPraCalcularMedia, valorReceitas);
                      let valorDespesas = parseFloat(objPropriedade.totalDespesas[mes]) || 0;
                      arrayDePropriedades[0].totalDespesas[mes] = adicionarEArredondar(arrayDePropriedades[0].totalDespesas[mes], valorDespesas);
                      valorDespesasPraCalcularMedia = adicionarEArredondar(valorDespesasPraCalcularMedia, valorDespesas);
                      let valorResultados = parseFloat(objPropriedade.resultado[mes]) || 0;
                      arrayDePropriedades[0].resultado[mes] = adicionarEArredondar(arrayDePropriedades[0].resultado[mes], valorResultados);
                      valorResultadosPraCalcularMedia = adicionarEArredondar(valorResultadosPraCalcularMedia, valorResultados);
                    });
          
                    arrayDePropriedades[0].totalReceitas.MEDIA = Math.trunc(valorReceitasPraCalcularMedia / mesesAteAnterior.length * 100) / 100;
                    arrayDePropriedades[0].totalDespesas.MEDIA = Math.trunc(valorDespesasPraCalcularMedia / mesesAteAnterior.length * 100) / 100;
                    arrayDePropriedades[0].resultado.MEDIA = Math.trunc(valorResultadosPraCalcularMedia / mesesAteAnterior.length * 100) / 100;
          */
          arrayDePropriedades.push(objPropriedade)
        }// Encerra for Propriedade

        var arrayDeFinancas = {};
        arrayDeFinancas["FINANCAS"] = arrayDePropriedades;



        return JSON.stringify(arrayDeFinancas);
      } // Encerra SOMAR
    } // Encerra Switch COMANDO
  } // Encerra processaGetFinanceiro

} // Encerra GET

function principal(e) {
  //   return;
  if (e) {
    // triggerUid agenda 16953042
    // triggerUid tempo (hora impar) 16805210
    // triggerUid tempo (hora par) 16856863
    // triggerUid alteração planilha 14892313
    if (e.triggerUid != '14892313') {
      preparaEventosASB402();
      sincroniza('', e.triggerUid);
      return;
    }
  }

  var sheetDados = ss.getSheetByName(mudouSheet);
  var lastRowDados = sheetDados.getLastRow();
  var lastColumnDados = sheetDados.getLastColumn();
  var rangeDados = sheetDados.getRange(1, 1, lastRowDados, lastColumnDados).getDisplayValues();
  var titulosColunas = []; titulosColunas = rangeDados[0];
  var dadosColunas = []; dadosColunas = rangeDados[(mudouLinha - 1)];
  var arrayIdConsulta = sheetDados.getRange(1, 1, lastRowDados, 1).getDisplayValues().flat();

  if (mudouLinha != 1 && mudouColuna != lastColumnDados) {
    //    sheetDados.getRange(mudouLinha, lastColumnDados).setValue('');
    //    var novoJson = JSON.stringify(produzJson(titulosColunas, dadosColunas, "Reserva"));
    //    sheetDados.getRange(mudouLinha, lastColumnDados).setValue(novoJson);
    throw new Error('MUDOU PLANILHA: ' + mudouSheet + " linha: " + mudouLinha + " coluna: " + mudouColuna + " LIMPOU JSON");
  }
  /*
    // NADA A PARTIR DAQUI ESTÁ SENDO EXECUTADO
    if (mudouSheet != 'Consulta') { throw new Error('MUDOU OUTRA PLANILHA'); }
    if (mudouLinha == 1) { throw new Error('MUDOU LINHA 1'); }
    if (sheetConsulta.getRange(mudouLinha, 50).getValue() != 'APPGYVER' &&
      (!sheetConsulta.getRange(mudouLinha, 4).getValue() || !sheetConsulta.getRange(mudouLinha, 5).getValue())) {
      console.log('SEM DATA');
      return;
    }
    var comando = '';
    var status = '';
    var dataIn = sheetConsulta.getRange(mudouLinha, 4).getValue();
    var dataOut = sheetConsulta.getRange(mudouLinha, 5).getValue();
    if (sheetConsulta.getRange(mudouLinha, 51).getValue() == 'CADASTRAR') { }
    if (sheetConsulta.getRange(mudouLinha, 50).getValue() == 'WEB') {
      var dateParts = dataIn.split("-");
      var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
      sheetConsulta.getRange(mudouLinha, 4).setValue(dateObject);
      dateParts = dataOut.split("-");
      dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
      sheetConsulta.getRange(mudouLinha, 5).setValue(dateObject);
    }
    if (mudouSheet == 'Consulta') {
      var request = new requestConsulta();
      comando = sheetConsulta.getRange(mudouLinha, lastColumnConsulta - 1).getValue();
    }
    if (mudouColuna == 5) {
      var valorEstadia = calculaValor(request);
      sheetConsulta.getRange(mudouLinha, 6).setValue(valorEstadia);
    }
    if (comparaDatas(request.entradaDate, request.saidaDate) == 'NOK') {
      sheetConsulta.getRange(mudouLinha, lastColumnConsulta).setValue('DATAS NOK');
      return;
    }
  
    console.log(mudouSheet, comando);
  
    switch (comando) {
      case '': {
        return;
      }
      case 'RESERVAR': {
        if (!request.idPropriedade) {
          status = 'ERRO:SEM PROPRIEDADE';
          break;
        }
        status = veConflitosConsulta(request);
        if (status == 'INDISPONIVEL') {
          sheetConsulta.getRange(mudouLinha, lastColumnConsulta - 1).setValue('');
          sheetConsulta.getRange(mudouLinha, lastColumnConsulta).setValue('INDISPONIVEL');
          break;
        }
        // STATUS DISPONIVEL
  
        if (reservaCalendarConsulta(request) != 'RESERVADA') throw new Error('Erro em reserva DISPONIVEL: ', request.idPropriedade);
  
        sheetConsulta.getRange(mudouLinha, 6).setValue(calculaValor(request));
        request.valor = sheetConsulta.getRange(mudouLinha, 6).getValue();
        sheetConsulta.getRange(mudouLinha, lastColumnConsulta - 1).setValue('');
        sheetConsulta.getRange(mudouLinha, lastColumnConsulta).setValue('RESERVADA');
  
        rangeConsulta = sheetConsulta.getRange(mudouLinha, 1, 1, lastColumnConsulta);
        sheetReserva.insertRowAfter(sheetReserva.getLastRow());
        var target_range = sheetReserva.getRange((sheetReserva.getLastRow() + 1), 1, 1, lastColumnReserva);
        sheetReserva.getRange(sheetReserva.getLastRow(), 13).setValue('=TEXT(D' + lastRowReserva.toString() + '; "dd/mm/yyyy")');
        sheetReserva.getRange(sheetReserva.getLastRow(), 14).setValue('=TEXT(E' + lastRowReserva.toString() + '; "dd/mm/yyyy")');
        rangeConsulta.copyTo(target_range);
  
        makeemailReservar(request);
        MailApp.sendEmail({
          to: 'airtonaragao@gmail.com',
          cc: request.emailInteressado,
          subject: request.subject,
          htmlBody: request.message,
        });
  
        for (let i = lastRowConsulta; i >= 1; i--) {
          if ((request.idPropriedade == sheetConsulta.getRange(i, 2).getValue()) &&
            (request.localConsulta == sheetConsulta.getRange(i, 3).getValue()) &&
            (request.emailInteressadoConsulta = sheetConsulta.getRange(i, 11).getValue()))
            sheetConsulta.deleteRow(i);
        }
        break;
      }
      case 'ALTERAR': {
        if (sheetReserva.getRange(mudouLinha, lastColumnReserva).getValue() != "RESERVADA") {
          status = 'ERRO:SEM RESERVA';
          break;
        }
        liberaCalendar(request);
        resultadoConflitos = veConflitosConsulta(request);
        status = 'INDISPONIVEL';
        if (resultadoConflitos == "DISPONIVEL") status = reservaCalendarConsulta(request);
        break;
      }
      case 'CANCELAR': {
        liberaCalendar(request);
        status = "CANCELADA";
        break;
      }
      case 'AUTORIZAR': {
        if (sheetReserva.getRange(mudouLinha, lastColumnReserva).getValue() != "RESERVADA") {
          status = 'ERRO:SEM RESERVA';
          break;
        }
        autorizacaoEnviada = autorizaEstadia(request);
        status = autorizacaoEnviada;
        break;
      }
      case "INDICAR": {
        request.idPropriedade = '';
        sheetConsulta.getRange(mudouLinha, 2).setValue('');
        propriedadesDisponiveis = selecionaPropriedades(request, 'INDICAR');
        if (propriedadesDisponiveis.length == 0) status = 'INDISPONIVEIS';
        if (propriedadesDisponiveis.length != 0) status = 'INDICADAS';
        break;
      }
      default: {
        console.log('ERRO: COMANDO INVALIDO');
        status = 'ERRO: COMANDO INVALIDO';
        break;
      }
    }
  */
  // atualizaContatosConsulta(request);
  console.log('ENCERROU PRINCIPAL');
  return;
}

// ========================================
// FUNÇÕES DE TESTE PARA doGet E doPost
// ========================================

/**
 * Testa a função doGet com parâmetros simulados
 */

/**
 * Testa a função doPost com dados simulados
 */
function testarDoPost() {
  // Simula o objeto 'e' que o doPost recebe
  const eventoSimulado = {
    parameter: {
      nome: 'Maria',
      email: 'maria@email.com'
    },
    parameters: {
      nome: ['Maria'],
      email: ['maria@email.com']
    },
    postData: {
      contents: '{"nome": "Maria", "email": "maria@email.com", "mensagem": "Teste de POST"}',
      type: 'application/json'
    }
  };

  console.log('=== TESTE doPost ===');
  console.log('Parâmetros enviados:', eventoSimulado.parameter);
  console.log('Dados POST:', eventoSimulado.postData.contents);

  try {
    const resultado = doPost(eventoSimulado);
    console.log('Resultado:', resultado);

    // Se retorna HtmlOutput ou TextOutput
    if (resultado && typeof resultado.getContent === 'function') {
      console.log('Conteúdo retornado:', resultado.getContent());
    }

  } catch (error) {
    console.error('Erro no doPost:', error);
  }
}

/**
 * Testa doGet com diferentes cenários
 */
function testarDoGetCenarios() {
  const cenarios = [
    {
      nome: 'Sem parâmetros',
      evento: { parameter: {}, parameters: {} }
    },
    {
      nome: 'Com ID',
      evento: {
        parameter: { id: '123' },
        parameters: { id: ['123'] }
      }
    },
    {
      nome: 'Múltiplos parâmetros',
      evento: {
        parameter: { nome: 'Ana', tipo: 'cliente', status: 'ativo' },
        parameters: {
          nome: ['Ana'],
          tipo: ['cliente'],
          status: ['ativo']
        }
      }
    }
  ];

  console.log('=== TESTE doGet - MÚLTIPLOS CENÁRIOS ===');

  cenarios.forEach((cenario, index) => {
    console.log(`\n--- Cenário ${index + 1}: ${cenario.nome} ---`);
    console.log('Parâmetros:', cenario.evento.parameter);

    try {
      const resultado = doGet(cenario.evento);
      console.log('✅ Sucesso:', resultado);
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  });
}

/**
 * Testa doPost com diferentes tipos de dados
 */
function testarDoPostCenarios() {
  const cenarios = [
    {
      nome: 'JSON simples',
      evento: {
        parameter: {},
        parameters: {},
        postData: {
          contents: '{"nome": "Pedro", "idade": 25}',
          type: 'application/json'
        }
      }
    },
    {
      nome: 'Form data',
      evento: {
        parameter: { nome: 'Carlos', email: 'carlos@test.com' },
        parameters: {
          nome: ['Carlos'],
          email: ['carlos@test.com']
        },
        postData: {
          contents: 'nome=Carlos&email=carlos@test.com',
          type: 'application/x-www-form-urlencoded'
        }
      }
    },
    {
      nome: 'JSON complexo',
      evento: {
        parameter: {},
        parameters: {},
        postData: {
          contents: JSON.stringify({
            usuario: {
              nome: 'Ana',
              dados: {
                idade: 28,
                cidade: 'São Paulo'
              }
            },
            acao: 'criar'
          }),
          type: 'application/json'
        }
      }
    }
  ];

  console.log('=== TESTE doPost - MÚLTIPLOS CENÁRIOS ===');

  cenarios.forEach((cenario, index) => {
    console.log(`\n--- Cenário ${index + 1}: ${cenario.nome} ---`);
    console.log('POST Data:', cenario.evento.postData.contents);

    try {
      const resultado = doPost(cenario.evento);
      console.log('✅ Sucesso:', resultado);
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  });
}

/**
 * Função auxiliar para criar mock de evento personalizado
 */
function criarEventoTeste(parametros = {}, postData = null) {
  const evento = {
    parameter: parametros,
    parameters: {}
  };

  // Converte parâmetros simples para o formato parameters
  Object.keys(parametros).forEach(key => {
    evento.parameters[key] = [parametros[key]];
  });

  // Adiciona postData se fornecido
  if (postData) {
    evento.postData = {
      contents: typeof postData === 'object' ? JSON.stringify(postData) : postData,
      type: typeof postData === 'object' ? 'application/json' : 'application/x-www-form-urlencoded'
    };
  }

  return evento;
}

/**
 * Exemplo de uso da função auxiliar
 */
function exemploTestePersonalizado() {
  console.log('=== TESTE PERSONALIZADO ===');

  // Teste GET personalizado
  /*
  doGet comando=LISTAR&planilha=Propriedade&inicio&fim&valorBasico&valorTaxaLimpeza&valorTaxaEnxoval&bloco&apartamento&valorTaxaEnergia&calendario&idEvento&lotacao&disponibilidade&veiculo_1&acompanhante_1&idContato&origem&idConsulta&idPropriedadeFiltro&valorLocacao&valorPago=%5B%7B%7D%5D&nomeInteressado&celularInteressado&cpfInteressado&emailInteressado&endereco&bairro&CEP&UF&cidade
  */
  const eventoGet = criarEventoTeste({
    usuario: 'admin',
    acao: 'listar',
    limite: '10'
  });

  console.log('Testando GET personalizado:');
  try {
    const resultadoGet = doGet(eventoGet);
    console.log('Resultado GET:', resultadoGet);
  } catch (error) {
    console.error('Erro GET:', error);
  }

  // Teste POST personalizado
  const eventoPost = criarEventoTeste(
    { acao: 'salvar' },
    { nome: 'Produto X', preco: 99.99, categoria: 'eletrônicos' }
  );

  console.log('\nTestando POST personalizado:');
  try {
    const resultadoPost = doPost(eventoPost);
    console.log('Resultado POST:', resultadoPost);
  } catch (error) {
    console.error('Erro POST:', error);
  }
}

// ========================================
// EXEMPLO DE FUNÇÕES doGet E doPost
// (substitua pelas suas próprias funções)
// ========================================

/**
 * Exemplo de função doGet
 */

/**
 * Exemplo de função doPost
 */
/*
function doPost(e) {
  const parametros = e.parameter;
  let dados = {};
  
  // Tenta fazer parse do JSON se houver postData
  if (e.postData) {
    try {
      dados = JSON.parse(e.postData.contents);
    } catch (error) {
      // Se não for JSON válido, usa os parâmetros normais
      dados = parametros;
    }
  } else {
    dados = parametros;
  }
  
  // Simula processamento dos dados
  const resposta = {
    status: 'sucesso',
    mensagem: 'Dados recebidos com sucesso',
    dados: dados,
    timestamp: new Date().toISOString()
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(resposta))
    .setMimeType(ContentService.MimeType.JSON);
}
*/

