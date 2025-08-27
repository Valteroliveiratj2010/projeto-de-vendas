#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMATIZADO - SISTEMA DE VENDAS
# Uso: chmod +x scripts/deploy.sh && ./scripts/deploy.sh

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar se é root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root!"
   exit 1
fi

# Configurações
APP_NAME="sistema-vendas"
APP_DIR="/home/$USER/$APP_NAME"
DB_NAME="sistema_vendas"
DB_USER="sistema_user"
DB_PASSWORD="$(openssl rand -base64 32)"
NODE_VERSION="18"

log "🚀 Iniciando deploy do Sistema de Vendas..."
log "📁 Diretório da aplicação: $APP_DIR"
log "🗄️ Nome do banco: $DB_NAME"
log "👤 Usuário do banco: $DB_USER"

# Passo 1: Atualizar sistema
step "1. Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Passo 2: Instalar Node.js
step "2. Instalando Node.js $NODE_VERSION..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log "✅ Node.js instalado: $(node --version)"
    log "✅ NPM instalado: $(npm --version)"
else
    log "✅ Node.js já está instalado: $(node --version)"
fi

# Passo 3: Instalar PostgreSQL
step "3. Instalando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    log "✅ PostgreSQL instalado e iniciado"
else
    log "✅ PostgreSQL já está instalado"
fi

# Passo 4: Configurar PostgreSQL
step "4. Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || warn "Banco $DB_NAME já existe"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || warn "Usuário $DB_USER já existe"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || warn "Privilégios já concedidos"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;" 2>/dev/null || warn "Permissão CREATEDB já concedida"

# Passo 5: Instalar PM2
step "5. Instalando PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    log "✅ PM2 instalado: $(pm2 --version)"
else
    log "✅ PM2 já está instalado: $(pm2 --version)"
fi

# Passo 6: Clonar/atualizar aplicação
step "6. Configurando aplicação..."
if [ -d "$APP_DIR" ]; then
    log "📁 Aplicação já existe, atualizando..."
    cd "$APP_DIR"
    git pull origin master
else
    log "📁 Clonando aplicação..."
    cd /home/$USER
    git clone https://github.com/Valteroliveiratj2010/projeto-de-vendas.git $APP_NAME
    cd "$APP_DIR"
fi

# Passo 7: Instalar dependências
step "7. Instalando dependências..."
npm install

# Passo 8: Configurar variáveis de ambiente
step "8. Configurando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    cp env.example .env
    log "📝 Arquivo .env criado a partir do exemplo"
fi

# Atualizar .env com configurações de produção
sed -i "s/DB_HOST=localhost/DB_HOST=localhost/" .env
sed -i "s/DB_NAME=sistema_vendas/DB_NAME=$DB_NAME/" .env
sed -i "s/DB_USER=postgres/DB_USER=$DB_USER/" .env
sed -i "s/DB_PASSWORD=sua_senha_aqui/DB_PASSWORD=$DB_PASSWORD/" .env
sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env

# Gerar JWT_SECRET se não existir
if ! grep -q "JWT_SECRET=" .env; then
    echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env
    log "🔑 JWT_SECRET gerado automaticamente"
fi

log "📝 Arquivo .env configurado para produção"

# Passo 9: Configurar banco de dados
step "9. Configurando banco de dados..."
npm run db:setup

# Passo 10: Configurar PM2
step "10. Configurando PM2..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start server.js --name $APP_NAME
pm2 startup
pm2 save

# Passo 11: Configurar Nginx (opcional)
step "11. Configurando Nginx..."
if ! command -v nginx &> /dev/null; then
    log "📦 Instalando Nginx..."
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Criar configuração do Nginx
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
if [ ! -f "$NGINX_CONF" ]; then
    sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Ativar site
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl reload nginx
    log "✅ Nginx configurado e ativo"
else
    log "✅ Configuração do Nginx já existe"
fi

# Passo 12: Configurar firewall
step "12. Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
log "✅ Firewall configurado (SSH, HTTP, HTTPS)"

# Passo 13: Verificar status
step "13. Verificando status da aplicação..."
sleep 5
pm2 status
pm2 logs $APP_NAME --lines 10

# Passo 14: Informações finais
step "14. Deploy concluído! 🎉"
echo ""
log "📋 RESUMO DO DEPLOY:"
log "   🌐 Aplicação: http://localhost:3000"
log "   🌐 Nginx: http://$(hostname -I | awk '{print $1}')"
log "   📁 Diretório: $APP_DIR"
log "   🗄️ Banco: $DB_NAME"
log "   👤 Usuário DB: $DB_USER"
log "   🔑 Senha DB: $DB_PASSWORD"
log "   📱 PM2: pm2 status"
log "   📊 Logs: pm2 logs $APP_NAME"
echo ""
warn "⚠️  IMPORTANTE:"
warn "   - Salve a senha do banco: $DB_PASSWORD"
warn "   - Configure SSL/HTTPS se necessário"
warn "   - Configure domínio personalizado se necessário"
echo ""
log "🚀 Sistema de Vendas deployado com sucesso!"
log "📖 Para mais informações, consulte: DEPLOY.md" 