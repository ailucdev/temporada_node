#!/bin/bash

echo "=== Configuração do Ambiente de Desenvolvimento: Temporada Node ==="

# 1. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js v20+ antes de continuar."
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✔ Node.js detectado: $NODE_VERSION"

# 2. Verificar Git
if ! command -v git &> /dev/null; then
    echo "❌ Git não está instalado. Por favor, instale o Git."
    exit 1
fi
echo "✔ Git detectado."

# 3. Instalar dependências das funções
echo "📦 Instalando dependências npm na pasta 'functions'..."
cd functions || exit
npm install
cd ..

# 4. Criar estrutura de credenciais locais (ignoradas pelo git)
echo "📁 Criando pastas de segurança..."
mkdir -p functions/secrets

# 5. Criar template do arquivo .env.local
ENV_LOCAL_FILE="functions/.env.local"
if [ ! -f "$ENV_LOCAL_FILE" ]; then
    echo "📝 Criando template de variáveis de ambiente locais em '$ENV_LOCAL_FILE'..."
    cat <<EOT >> "$ENV_LOCAL_FILE"
# Token estático para autenticação das rotas API em desenvolvimento
API_KEY=notria_onaicul

# IDs das Planilhas do Google Sheets (pegar da URL da planilha no Drive)
SPREADSHEET_TEMPORADA_ID=1CUhKifJkV3WVnylNHtF1W9mZdCrkeoTZ1-p_xZxD7xI
SPREADSHEET_FINANCEIRO_ID=1fVGJsRJMZXLEn0NjxMNOfvqf3XIMi0ryPMHFZD1F11Q

# Caminho para o arquivo JSON da conta de serviço (relativo à raiz da pasta functions)
GOOGLE_APPLICATION_CREDENTIALS=secrets/service-account.json
EOT
    echo "✔ Template .env.local criado. AJUSTE os valores conforme necessário."
else
    echo "ℹ O arquivo '$ENV_LOCAL_FILE' já existe. Mantendo configurações atuais."
fi

# 6. Explicar próximos passos
echo ""
echo "=== Passos Manuais Necessários ==="
echo "1. Adicione a chave JSON da Conta de Serviço do Google em:"
echo "   -> functions/secrets/service-account.json"
echo "2. Instale o Firebase CLI globalmente se ainda não tiver:"
echo "   -> npm install -g firebase-tools"
echo "3. Faça login no Firebase e configure o projeto:"
echo "   -> firebase login"
echo "   -> firebase use default"
echo "4. Inicie o emulador local:"
echo "   -> cd functions && npm run serve"
echo ""
echo "=== Configuração Concluída! ==="
