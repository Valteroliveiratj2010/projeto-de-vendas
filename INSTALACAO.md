# 🚀 Guia de Instalação - Sistema de Vendas

Este guia irá te ajudar a configurar e executar o Sistema de Vendas completo com suporte offline (PWA).

## 📋 Pré-requisitos

### Software Necessário
- **Node.js** versão 16.0.0 ou superior
- **PostgreSQL** versão 12.0 ou superior
- **npm** ou **yarn** (vem com Node.js)

### Verificar Instalações
```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar PostgreSQL
psql --version
```

## 🗄️ Configuração do Banco de Dados

### 1. Instalar PostgreSQL
- **Windows**: Baixar do [site oficial](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Criar Banco de Dados
```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar banco de dados
CREATE DATABASE sistema_vendas;

-- Verificar se foi criado
\l

-- Sair
\q
```

### 3. Configurar Usuário (Opcional)
```sql
-- Criar usuário específico
CREATE USER sistema_user WITH PASSWORD 'sua_senha_aqui';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE sistema_vendas TO sistema_user;
```

## ⚙️ Configuração do Projeto

### 1. Instalar Dependências
```bash
# Navegar para o diretório do projeto
cd projeto-de-vendas

# Instalar dependências
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar arquivo .env com suas configurações
```

**Conteúdo do arquivo `.env`:**
```env
# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_vendas
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações de Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# Configurações JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=24h

# Configurações WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=seu_numero_whatsapp
```

### 3. Configurar Banco de Dados
```bash
# Executar script de configuração do banco
npm run db:setup
```

**O que este comando faz:**
- Cria todas as tabelas necessárias
- Insere dados de exemplo (clientes e produtos)
- Configura índices para performance
- Estabelece relacionamentos entre tabelas

## 🚀 Executando o Sistema

### 1. Modo Desenvolvimento
```bash
# Iniciar servidor com auto-reload
npm run dev
```

### 2. Modo Produção
```bash
# Construir para produção
npm run build

# Iniciar servidor de produção
npm start
```

### 3. Acessar o Sistema
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/health
- **Documentação**: http://localhost:3000/api/docs

## 📱 Funcionalidades PWA

### 1. Instalação como App
- Abrir o sistema no navegador
- Clicar no ícone de instalação na barra de endereços
- Ou usar menu do navegador → "Instalar app"

### 2. Funcionalidades Offline
- Sistema funciona sem internet
- Dados são salvos localmente
- Sincronização automática quando online

### 3. Atalhos Rápidos
- **Nova Venda**: Ctrl/Cmd + Shift + V
- **Novo Cliente**: Ctrl/Cmd + Shift + C
- **Busca Global**: Ctrl/Cmd + K

## 🔧 Comandos Úteis

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev          # Inicia servidor com nodemon

# Banco de Dados
npm run db:setup     # Configura banco inicial
npm run db:migrate   # Executa migrações

# Produção
npm start            # Inicia servidor de produção
npm run build        # Constrói para produção
```

### Comandos de Banco
```bash
# Conectar ao banco
psql -U postgres -d sistema_vendas

# Ver tabelas
\dt

# Ver estrutura de uma tabela
\d nome_da_tabela

# Sair
\q
```

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
# Windows: Serviços → PostgreSQL
# macOS/Linux: sudo systemctl status postgresql

# Verificar configurações no .env
# Testar conexão manual
psql -U postgres -d sistema_vendas
```

### Erro de Porta em Uso
```bash
# Verificar processos na porta 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000

# Matar processo
# Windows: taskkill /PID <PID>
# macOS/Linux: kill -9 <PID>
```

### Problemas de Dependências
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📊 Estrutura do Projeto

```
projeto-de-vendas/
├── config/                 # Configurações do banco
├── routes/                 # Rotas da API
├── scripts/                # Scripts de configuração
├── public/                 # Frontend (PWA)
│   ├── css/               # Estilos
│   ├── js/                # JavaScript
│   └── manifest.json      # Configuração PWA
├── server.js              # Servidor principal
├── package.json           # Dependências
└── README.md              # Documentação
```

## 🔒 Configurações de Segurança

### 1. Variáveis de Ambiente
- **NUNCA** commitar arquivo `.env`
- Use senhas fortes para banco e JWT
- Configure firewall adequadamente

### 2. Banco de Dados
- Use usuário específico (não postgres)
- Configure permissões mínimas necessárias
- Ative SSL em produção

### 3. Servidor
- Configure HTTPS em produção
- Use helmet.js (já configurado)
- Configure rate limiting adequado

## 📈 Monitoramento e Logs

### 1. Logs do Sistema
```bash
# Ver logs em tempo real
npm run dev

# Logs de erro são exibidos no console
# Em produção, configure sistema de logs
```

### 2. Métricas de Performance
- Tempo de resposta das APIs
- Uso de memória e CPU
- Conexões ativas no banco

## 🚀 Deploy em Produção

### 1. Preparação
```bash
# Configurar NODE_ENV=production
# Configurar banco de produção
# Configurar domínio e SSL
```

### 2. Plataformas Recomendadas
- **Railway**: Deploy automático
- **Render**: Fácil configuração
- **VPS**: Controle total
- **Heroku**: Simples de usar

### 3. Variáveis de Produção
```env
NODE_ENV=production
PORT=3000
DB_HOST=seu_host_producao
DB_NAME=sistema_vendas_prod
JWT_SECRET=chave_super_secreta_producao
```

## 📞 Suporte

### 1. Documentação
- README.md principal
- Comentários no código
- Este guia de instalação

### 2. Logs e Debug
- Console do navegador
- Logs do servidor
- Service Worker logs

### 3. Comunidade
- GitHub Issues
- Stack Overflow
- Fóruns de desenvolvimento

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. **Testar Funcionalidades**: Navegar por todas as páginas
2. **Criar Dados**: Adicionar clientes, produtos e vendas
3. **Testar Offline**: Desconectar internet e usar sistema
4. **Configurar Email**: Testar envio de relatórios
5. **Personalizar**: Adaptar cores e layout conforme necessário

---

## ✨ Sistema Pronto!

Se você chegou até aqui, o Sistema de Vendas está funcionando perfeitamente! 

**Funcionalidades disponíveis:**
- ✅ Dashboard com estatísticas
- ✅ Gestão completa de clientes
- ✅ Controle de produtos e estoque
- ✅ Sistema de vendas e pagamentos
- ✅ Orçamentos conversíveis
- ✅ Relatórios detalhados
- ✅ Suporte offline completo
- ✅ Interface responsiva e moderna

**Acesse:** http://localhost:3000

**Boa sorte com suas vendas! 🚀💰** 