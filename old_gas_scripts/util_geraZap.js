function whatsAppLink(numTel, msg) 

{
  /* função genérica para formar link Click to Chat no WhatsApp, a partir de um número formatado e uma mensagem qualquer
  numTel - Exemplo: número do Brasil, Brasília: +55 (61) 3303-1000 deve ser passado como 556133031000
  msg - uma string contendo a mensagem que será codificada abaixo. Há limitações ainda não tratadas nesse código */
  
  var url = "http://wa.me/"
             + numTel 
             +"?text=" 
             + encodeRFC5987ValueChars2(msg);
  return url;
}

function encodeRFC5987ValueChars2(str) {
  return encodeURIComponent(str).
    // Note that although RFC3986 reserves "!", RFC5987 does not,
    // so we do not need to escape it
    replace(/['()]/g, c => "%" + c.charCodeAt(0).toString(16)). // i.e., %27 %28 %29 %2a (Note that valid encoding of "" is %2A
                                                                 // which necessitates calling toUpperCase() to properly encode)
    // The following are not required for percent-encoding per RFC5987,
    // so we can allow for a little better readability over the wire: |`^
    replace(/%(7C|60|5E)/g, (str, hex) => String.fromCharCode(parseInt(hex, 16)));
}
