# 🚀 GUIA COMPLETO DE DEPLOY - SISTEMA DE VENDAS

## 📋 PRÉ-REQUISITOS

### **Sistema Operacional:**
- ✅ Windows 10/11, macOS, ou Linux
- ✅ Node.js 16.0.0 ou superior
- ✅ NPM ou Yarn

### **Banco de Dados:**
- ✅ PostgreSQL 12 ou superior
- ✅ Acesso ao banco com permissões de criação de tabelas

### **Serviços Externos (Opcionais):**
- ✅ Conta Gmail para envio de emails
- ✅ Conta Twilio para WhatsApp
- ✅ VAPID keys para push notifications

---

## 🎯 OPÇÕES DE DEPLOY

### **1. 🏠 DEPLOY LOCAL (Desenvolvimento)**
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Configurar banco de dados
npm run db:setup

# Iniciar servidor
npm run dev
```

### **2. 🌐 DEPLOY EM SERVIDOR VPS/DEDICADO**

#### **Passo 1: Preparar Servidor**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar PM2 (Process Manager)
sudo npm install -g pm2
```

#### **Passo 2: Configurar PostgreSQL**
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE sistema_vendas;
CREATE USER sistema_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE sistema_vendas TO sistema_user;
\q
```

#### **Passo 3: Deploy da Aplicação**
```bash
# Clonar repositório
git clone https://github.com/Valteroliveiratj2010/projeto-de-vendas.git
cd projeto-de-vendas

# Instalar dependências
npm install

# Configurar ambiente
cp env.example .env
nano .env  # Editar configurações
```

#### **Passo 4: Configurar .env para Produção**
```env
# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_vendas
DB_USER=sistema_user
DB_PASSWORD=sua_senha_segura

# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# Configurações JWT
JWT_SECRET=chave_super_secreta_para_producao
JWT_EXPIRES_IN=24h

# Configurações WhatsApp
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=seu_numero_whatsapp
```

#### **Passo 5: Configurar Banco e Iniciar**
```bash
# Configurar banco de dados
npm run db:setup

# Iniciar com PM2
pm2 start server.js --name "sistema-vendas"

# Configurar PM2 para iniciar com o sistema
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs sistema-vendas
```

### **3. ☁️ DEPLOY EM PLATAFORMAS CLOUD**

#### **A) Heroku**
```bash
# Instalar Heroku CLI
# Criar app no Heroku Dashboard

# Deploy
heroku create seu-app-vendas
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
git push heroku master

# Configurar variáveis
heroku config:set JWT_SECRET=sua_chave_secreta
heroku config:set EMAIL_USER=seu_email
heroku config:set EMAIL_PASS=sua_senha
```

#### **B) Railway**
```bash
# Conectar repositório GitHub
# Configurar variáveis de ambiente no dashboard
# Deploy automático a cada push
```

#### **C) Render**
```bash
# Conectar repositório GitHub
# Configurar build command: npm install
# Configurar start command: npm start
# Configurar variáveis de ambiente
```

#### **D) DigitalOcean App Platform**
```bash
# Conectar repositório GitHub
# Configurar build e start commands
# Configurar variáveis de ambiente
# Deploy automático
```

---

## 🔧 CONFIGURAÇÕES DE PRODUÇÃO

### **1. Segurança**
```javascript
// server.js - Configurações de produção
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
```

### **2. Rate Limiting**
```javascript
// Limitar requests em produção
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por IP
  message: 'Muitas requisições, tente novamente mais tarde.'
});
```

### **3. Logs e Monitoramento**
```bash
# PM2 logs
pm2 logs sistema-vendas --lines 100

# Monitoramento
pm2 monit

# Reiniciar aplicação
pm2 restart sistema-vendas
```

---

## 🌐 CONFIGURAÇÃO DE DOMÍNIO

### **1. Nginx (Recomendado)**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **2. SSL/HTTPS (Let's Encrypt)**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📱 CONFIGURAÇÃO PWA

### **1. Manifest.json**
```json
{
  "name": "Sistema de Vendas",
  "short_name": "Vendas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6"
}
```

### **2. Service Worker**
- ✅ Já configurado para cache offline
- ✅ Atualização automática de recursos
- ✅ Fallback para modo offline

---

## 🔍 VERIFICAÇÃO PÓS-DEPLOY

### **1. Testes Básicos**
```bash
# Verificar se o servidor está rodando
curl http://localhost:3000

# Verificar banco de dados
npm run db:setup

# Testar rotas da API
curl http://localhost:3000/api/clientes
```

### **2. Testes de Funcionalidade**
- ✅ Login e autenticação
- ✅ CRUD de clientes, produtos, vendas
- ✅ Geração de PDFs
- ✅ Envio de emails
- ✅ Push notifications
- ✅ Sincronização offline

---

## 🚨 TROUBLESHOOTING

### **Problemas Comuns:**

#### **1. Erro de Conexão com Banco**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar configurações de conexão
sudo nano /etc/postgresql/*/main/postgresql.conf
```

#### **2. Erro de Porta em Uso**
```bash
# Verificar processos na porta 3000
sudo lsof -i :3000

# Matar processo se necessário
sudo kill -9 PID
```

#### **3. Erro de Permissões**
```bash
# Corrigir permissões de arquivos
sudo chown -R $USER:$USER /caminho/para/app
sudo chmod -R 755 /caminho/para/app
```

---

## 📞 SUPORTE

### **Logs Importantes:**
- **Aplicação:** `pm2 logs sistema-vendas`
- **Nginx:** `sudo tail -f /var/log/nginx/error.log`
- **PostgreSQL:** `sudo tail -f /var/log/postgresql/postgresql-*.log`

### **Comandos Úteis:**
```bash
# Reiniciar aplicação
pm2 restart sistema-vendas

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar status dos serviços
sudo systemctl status nginx postgresql
```

---

## 🎉 DEPLOY CONCLUÍDO!

Após seguir todos os passos, seu sistema estará disponível em:
- **Local:** http://localhost:3000
- **Produção:** https://seu-dominio.com

**✅ Sistema funcionando com todas as funcionalidades!**
**✅ PWA configurado para uso offline!**
**✅ Banco de dados configurado e funcionando!**
**✅ Segurança e performance otimizadas!** 