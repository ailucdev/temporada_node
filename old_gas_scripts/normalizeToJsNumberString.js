function normalizeToJsNumberString(raw) {
// Normaliza qualquer "bagunça" como "1.234.567.89" -> "1234567.89"
// Retorna string pronta para Number(), ex: "1234567.89" ou "884" (sem decimal)
  if (raw == null) return "0";
  let s = String(raw).trim();

  // preserva sinal negativo, se existir
  let sign = "";
  if (s.startsWith('-')) { sign = "-"; s = s.slice(1); }

  // remove tudo que não seja digito ou . ou ,
  s = s.replace(/[^0-9.,]/g, '');

  // acha última ocorrência de . ou ,
  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  const lastSepIndex = Math.max(lastDot, lastComma);

  if (lastSepIndex === -1) {
    // sem separador: só dígitos
    const digitsOnly = s.replace(/[^0-9]/g, '') || '0';
    return sign + digitsOnly;
  }

  const sepChar = s[lastSepIndex];
  const decimalsPartRaw = s.slice(lastSepIndex + 1).replace(/[^0-9]/g, '');
  const decimalsLen = decimalsPartRaw.length;

  // remove todos os caracteres não-dígito para ficar só com dígitos
  const digitsOnly = s.replace(/[^0-9]/g, '') || '0';

  // se a parte após o último separador tem 1 ou 2 dígitos -> considera decimal
  if (decimalsLen >= 1 && decimalsLen <= 2) {
    if (digitsOnly.length <= decimalsLen) {
      // número < 1, ex: ".89" ou ",5" -> 0.89
      const frac = digitsOnly.padStart(decimalsLen, '0').slice(-decimalsLen);
      return sign + '0' + '.' + frac;
    } else {
      const intPart = digitsOnly.slice(0, digitsOnly.length - decimalsLen);
      const fracPart = digitsOnly.slice(-decimalsLen);
      return sign + intPart + '.' + fracPart;
    }
  } else {
    // caso a parte após último separador tenha >2 dígitos -> provavelmente são separadores de milhar
    // então tratamos como inteiro (remove tudo que não é dígito)
    return sign + digitsOnly;
  }
}

// Converte para Number e formata em pt-BR com 2 casas (ex: "1.234,56")
function parseAndFormatBR(raw) {
  const jsNumStr = normalizeToJsNumberString(raw);
  const num = Number(jsNumStr);
  if (isNaN(num)) return '0,00';
  try {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  } catch (e) {
    return num.toFixed(2).replace('.', ',');
  }
}
