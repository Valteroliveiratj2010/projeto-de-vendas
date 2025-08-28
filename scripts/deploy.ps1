# 🚀 SCRIPT DE DEPLOY AUTOMATIZADO - SISTEMA DE VENDAS (WINDOWS)
# Uso: .\scripts\deploy.ps1

# Configurações
$ErrorActionPreference = "Stop"
$APP_NAME = "sistema-vendas"
$APP_DIR = "C:\$APP_NAME"
$DB_NAME = "sistema_vendas_zc4o"
$DB_USER = "sistema_user"
$DB_PASSWORD = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Funções de log
function Write-Log {
    param([string]$Message, [string]$Type = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Type) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "STEP" { "Blue" }
        default { "Green" }
    }
    Write-Host "[$timestamp] [$Type] $Message" -ForegroundColor $color
}

function Write-Step {
    param([string]$Message)
    Write-Log $Message "STEP"
}

function Write-Warn {
    param([string]$Message)
    Write-Log $Message "WARN"
}

function Write-Error {
    param([string]$Message)
    Write-Log $Message "ERROR"
}

# Verificar se é administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "Este script deve ser executado como Administrador!"
    exit 1
}

Write-Log "🚀 Iniciando deploy do Sistema de Vendas no Windows..."
Write-Log "📁 Diretório da aplicação: $APP_DIR"
Write-Log "🗄️ Nome do banco: $DB_NAME"
Write-Log "👤 Usuário do banco: $DB_USER"

# Passo 1: Verificar/Instalar Chocolatey
Write-Step "1. Verificando Chocolatey..."
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Log "📦 Instalando Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Log "✅ Chocolatey instalado"
} else {
    Write-Log "✅ Chocolatey já está instalado"
}

# Passo 2: Verificar/Instalar Node.js
Write-Step "2. Verificando Node.js..."
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Log "📦 Instalando Node.js..."
    choco install nodejs -y
    refreshenv
    Write-Log "✅ Node.js instalado: $(node --version)"
    Write-Log "✅ NPM instalado: $(npm --version)"
} else {
    Write-Log "✅ Node.js já está instalado: $(node --version)"
}

# Passo 3: Verificar/Instalar PostgreSQL
Write-Step "3. Verificando PostgreSQL..."
if (!(Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Log "📦 Instalando PostgreSQL..."
    choco install postgresql -y
    refreshenv
    Write-Log "✅ PostgreSQL instalado"
} else {
    Write-Log "✅ PostgreSQL já está instalado"
}

# Passo 4: Verificar/Instalar PM2
Write-Step "4. Verificando PM2..."
if (!(Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Log "📦 Instalando PM2..."
    npm install -g pm2
    Write-Log "✅ PM2 instalado: $(pm2 --version)"
} else {
    Write-Log "✅ PM2 já está instalado: $(pm2 --version)"
}

# Passo 5: Configurar PostgreSQL
Write-Step "5. Configurando PostgreSQL..."
try {
    # Iniciar serviço PostgreSQL
    Start-Service postgresql-x64-15
    Set-Service postgresql-x64-15 -StartupType Automatic
    
    # Criar banco e usuário
    $env:PGPASSWORD = "postgres"
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>$null
    psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>$null
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>$null
    psql -U postgres -c "ALTER USER $DB_USER CREATEDB;" 2>$null
    
    Write-Log "✅ PostgreSQL configurado"
} catch {
    Write-Warn "⚠️ Erro ao configurar PostgreSQL: $($_.Exception.Message)"
    Write-Warn "⚠️ Configure manualmente o banco de dados"
}

# Passo 6: Configurar aplicação
Write-Step "6. Configurando aplicação..."
if (Test-Path $APP_DIR) {
    Write-Log "📁 Aplicação já existe, atualizando..."
    Set-Location $APP_DIR
    git pull origin master
} else {
    Write-Log "📁 Clonando aplicação..."
    Set-Location C:\
    git clone https://github.com/Valteroliveiratj2010/projeto-de-vendas.git $APP_NAME
    Set-Location $APP_DIR
}

# Passo 7: Instalar dependências
Write-Step "7. Instalando dependências..."
npm install

# Passo 8: Configurar variáveis de ambiente
Write-Step "8. Configurando variáveis de ambiente..."
if (!(Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Write-Log "📝 Arquivo .env criado a partir do exemplo"
}

# Atualizar .env com configurações de produção
$envContent = Get-Content ".env"
$envContent = $envContent -replace "DB_HOST=localhost", "DB_HOST=localhost"
$envContent = $envContent -replace "DB_NAME=sistema_vendas", "DB_NAME=$DB_NAME"
$envContent = $envContent -replace "DB_USER=postgres", "DB_USER=$DB_USER"
$envContent = $envContent -replace "DB_PASSWORD=sua_senha_aqui", "DB_PASSWORD=$DB_PASSWORD"
$envContent = $envContent -replace "NODE_ENV=development", "NODE_ENV=production"

# Adicionar JWT_SECRET se não existir
if ($envContent -notmatch "JWT_SECRET=") {
    $jwtSecret = -join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    $envContent += "JWT_SECRET=$jwtSecret"
    Write-Log "🔑 JWT_SECRET gerado automaticamente"
}

$envContent | Set-Content ".env"
Write-Log "📝 Arquivo .env configurado para produção"

# Passo 9: Configurar banco de dados
Write-Step "9. Configurando banco de dados..."
try {
    npm run db:setup
    Write-Log "✅ Banco de dados configurado"
} catch {
    Write-Warn "⚠️ Erro ao configurar banco: $($_.Exception.Message)"
}

# Passo 10: Configurar PM2
Write-Step "10. Configurando PM2..."
pm2 delete $APP_NAME 2>$null
pm2 start server.js --name $APP_NAME
pm2 startup
pm2 save

# Passo 11: Configurar IIS (opcional)
Write-Step "11. Configurando IIS..."
try {
    # Verificar se IIS está instalado
    $iisFeature = Get-WindowsFeature -Name "Web-Server"
    if ($iisFeature.InstallState -eq "Installed") {
        Write-Log "✅ IIS já está instalado"
    } else {
        Write-Log "📦 Instalando IIS..."
        Install-WindowsFeature -Name "Web-Server" -IncludeManagementTools
        Write-Log "✅ IIS instalado"
    }
    
    # Configurar URL Rewrite
    Write-Log "📦 Instalando URL Rewrite..."
    choco install urlrewrite -y
    
    # Criar configuração de proxy reverso
    $webConfigPath = "$APP_DIR\web.config"
    $webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions logicalGrouping="MatchAll" trackAllCaptures="false" />
                    <action type="Rewrite" url="http://localhost:3000/{R:1}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
"@
    $webConfig | Out-File -FilePath $webConfigPath -Encoding UTF8
    Write-Log "✅ Configuração do IIS criada"
} catch {
    Write-Warn "⚠️ Erro ao configurar IIS: $($_.Exception.Message)"
}

# Passo 12: Configurar firewall
Write-Step "12. Configurando firewall..."
try {
    New-NetFirewallRule -DisplayName "Sistema Vendas HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
    New-NetFirewallRule -DisplayName "Sistema Vendas HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
    Write-Log "✅ Firewall configurado (HTTP, HTTPS)"
} catch {
    Write-Warn "⚠️ Erro ao configurar firewall: $($_.Exception.Message)"
}

# Passo 13: Verificar status
Write-Step "13. Verificando status da aplicação..."
Start-Sleep -Seconds 5
pm2 status
pm2 logs $APP_NAME --lines 10

# Passo 14: Informações finais
Write-Step "14. Deploy concluído! 🎉"
Write-Host ""
Write-Log "📋 RESUMO DO DEPLOY:"
Write-Log "   🌐 Aplicação: http://localhost:3000"
Write-Log "   🌐 IIS: http://localhost"
Write-Log "   📁 Diretório: $APP_DIR"
Write-Log "   🗄️ Banco: $DB_NAME"
Write-Log "   👤 Usuário DB: $DB_USER"
Write-Log "   🔑 Senha DB: $DB_PASSWORD"
Write-Log "   📱 PM2: pm2 status"
Write-Log "   📊 Logs: pm2 logs $APP_NAME"
Write-Host ""
Write-Warn "⚠️  IMPORTANTE:"
Write-Warn "   - Salve a senha do banco: $DB_PASSWORD"
Write-Warn "   - Configure SSL/HTTPS se necessário"
Write-Warn "   - Configure domínio personalizado se necessário"
Write-Host ""
Write-Log "🚀 Sistema de Vendas deployado com sucesso no Windows!"
Write-Log "📖 Para mais informações, consulte: DEPLOY.md" 