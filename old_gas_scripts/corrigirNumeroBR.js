        function corrigirNumeroBR(numeroStr) {
          let s = numeroStr.trim();
          if (s.includes(',')) {
            // Decimal no formato brasileiro
            s = s.replace(/\./g, ''); // remove milhar
            s = s.replace(',', '.');  // troca vírgula decimal por ponto
          } else {
            // Decimal no formato americano
            // Remove apenas pontos de milhar (entre dígitos e seguidos de 3 dígitos)
            s = s.replace(/(\d)\.(?=\d{3}(\D|$))/g, '$1');
            // Mantém ponto decimal se houver
          }
          return s;
        }
