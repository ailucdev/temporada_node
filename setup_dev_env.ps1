Write-Host "=== Configuração do Ambiente de Desenvolvimento: Temporada Node (Windows) ===" -ForegroundColor Cyan

# 1. Verificar Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Node.js não está instalado. Por favor, instale o Node.js v20+ antes de continuar." -ForegroundColor Red
    Exit
}
Write-Host "✔ Node.js detectado: $(node -v)" -ForegroundColor Green

# 2. Verificar Git
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "❌ Git não está instalado. Por favor, instale o Git." -ForegroundColor Red
    Exit
}
Write-Host "✔ Git detectado." -ForegroundColor Green

# 3. Instalar dependências das funções
Write-Host "📦 Instalando dependências npm na pasta 'functions'..." -ForegroundColor Yellow
Set-Location functions
npm install
Set-Location ..

# 4. Criar estrutura de credenciais locais
Write-Host "📁 Criando pastas de segurança..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "functions/secrets" | Out-Null

# 5. Criar template do arquivo .env.local
$envLocalPath = "functions/.env.local"
if (-not (Test-Path $envLocalPath)) {
    Write-Host "📝 Criando template de variáveis de ambiente locais em '$envLocalPath'..." -ForegroundColor Yellow
    $envContent = @"
# Token estático para autenticação das rotas API em desenvolvimento
API_KEY=notria_onaicul

# IDs das Planilhas do Google Sheets (pegar da URL da planilha no Drive)
SPREADSHEET_TEMPORADA_ID=1CUhKifJkV3WVnylNHtF1W9mZdCrkeoTZ1-p_xZxD7xI
SPREADSHEET_FINANCEIRO_ID=1fVGJsRJMZXLEn0NjxMNOfvqf3XIMi0ryPMHFZD1F11Q

# Caminho para o arquivo JSON da conta de serviço (relativo à raiz da pasta functions)
GOOGLE_APPLICATION_CREDENTIALS=secrets/service-account.json
"@
    Set-Content -Path $envLocalPath -Value $envContent
    Write-Host "✔ Template .env.local criado. AJUSTE os valores conforme necessário." -ForegroundColor Green
} else {
    Write-Host "ℹ O arquivo '$envLocalPath' já existe. Mantendo configurações atuais." -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Passos Manuais Necessários ===" -ForegroundColor Cyan
Write-Host "1. Adicione a chave JSON da Conta de Serviço do Google em:"
Write-Host "   -> functions/secrets/service-account.json"
Write-Host "2. Instale o Firebase CLI globalmente se ainda não tiver:"
Write-Host "   -> npm install -g firebase-tools"
Write-Host "3. Faça login no Firebase e configure o projeto:"
Write-Host "   -> firebase login"
Write-Host "   -> firebase use default"
Write-Host "4. Inicie o emulador local:"
Write-Host "   -> Set-Location functions; npm run serve"
Write-Host ""
Write-Host "=== Configuração Concluída! ===" -ForegroundColor Green
