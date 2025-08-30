# 🚀 Sistema de Vendas - Projeto Completo

## 📋 Descrição

Sistema completo de gestão de vendas desenvolvido em Node.js com interface web responsiva. Inclui funcionalidades de autenticação, dashboard, gestão de produtos, clientes, vendas, relatórios e notificações push.

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- Sistema de login/logout seguro
- Autenticação JWT
- Proteção de rotas
- Middleware de autenticação

### 📊 Dashboard
- Visão geral das vendas
- Gráficos e estatísticas
- Métricas em tempo real
- Indicadores de performance

### 🛍️ Gestão de Produtos
- Cadastro de produtos
- Categorização
- Controle de estoque
- Preços e descrições

### 👥 Gestão de Clientes
- Cadastro de clientes
- Histórico de compras
- Dados de contato
- Segmentação

### 💰 Gestão de Vendas
- Registro de vendas
- Orçamentos
- Controle de pagamentos
- Histórico completo

### 📈 Relatórios
- Relatórios de vendas
- Análise de performance
- Exportação para PDF
- Filtros por período

### 🔔 Notificações
- Sistema de notificações push
- Notificações por email
- Integração com WhatsApp
- Alertas em tempo real

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **Nodemailer** - Envio de emails
- **Web-push** - Notificações push

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização responsiva
- **JavaScript ES6+** - Funcionalidades
- **Chart.js** - Gráficos
- **FontAwesome** - Ícones

### Funcionalidades
- **PWA** - Progressive Web App
- **Service Worker** - Cache offline
- **Responsividade** - Mobile-first design
- **CSP** - Content Security Policy

## 🚀 Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Git

### Passos para instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/sistema-vendas.git
cd sistema-vendas
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
npm run setup-db
```

5. **Configure o email**
```bash
npm run setup-email
```

6. **Configure as notificações push**
```bash
npm run setup-push
```

7. **Inicie o servidor**
```bash
npm start
```

## 📱 Como usar

### Acesso ao sistema
- **URL:** `http://localhost:3000`
- **Usuário padrão:** `admin@exemplo.com`
- **Senha padrão:** `123456`

### Funcionalidades principais
1. **Login** - Acesse com suas credenciais
2. **Dashboard** - Visualize métricas e estatísticas
3. **Produtos** - Gerencie o catálogo
4. **Clientes** - Cadastre e gerencie clientes
5. **Vendas** - Registre transações
6. **Relatórios** - Analise performance

## 🔧 Scripts disponíveis

```bash
# Desenvolvimento
npm start          # Inicia o servidor
npm run dev        # Modo desenvolvimento com reload

# Configuração
npm run setup-db   # Configura banco de dados
npm run setup-email # Configura sistema de email
npm run setup-push # Configura notificações push

# Manutenção
npm run clean      # Limpa dados de teste
npm run check      # Verifica estrutura do banco
```

## 📁 Estrutura do projeto

```
projeto-de-vendas/
├── config/           # Configurações
├── data/            # Dados do banco
├── docs/            # 📚 Documentação técnica
├── middleware/      # Middlewares
├── public/          # Arquivos públicos
│   ├── css/        # Estilos
│   ├── js/         # JavaScript
│   ├── test-files/ # 🧪 Arquivos de teste (dev only)
│   └── html/       # Páginas HTML
├── routes/          # Rotas da API
├── scripts/         # Scripts de configuração
├── utils/           # Utilitários
├── server.js        # Servidor principal
└── package.json     # Dependências
```

## 📚 **Documentação**

- **📖 [Documentação Técnica](./docs/README.md)** - Guia completo de desenvolvimento
- **🚀 [Instalação](./docs/INSTALACAO.md)** - Como instalar e configurar
- **☁️ [Deploy](./docs/DEPLOY.md)** - Como fazer deploy em produção

## 🌐 API Endpoints

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/logout` - Logout do usuário
- `GET /auth/verify` - Verificar token

### Produtos
- `GET /produtos` - Listar produtos
- `POST /produtos` - Criar produto
- `PUT /produtos/:id` - Atualizar produto
- `DELETE /produtos/:id` - Deletar produto

### Clientes
- `GET /clientes` - Listar clientes
- `POST /clientes` - Criar cliente
- `PUT /clientes/:id` - Atualizar cliente
- `DELETE /clientes/:id` - Deletar cliente

### Vendas
- `GET /vendas` - Listar vendas
- `POST /vendas` - Criar venda
- `PUT /vendas/:id` - Atualizar venda
- `DELETE /vendas/:id` - Deletar venda

## 🔒 Segurança

- **CSP** - Content Security Policy implementado
- **JWT** - Tokens seguros para autenticação
- **Validação** - Validação de entrada em todas as rotas
- **Sanitização** - Dados sanitizados antes do processamento

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- **Desktop** (>1024px) - Sidebar sempre visível
- **Tablet** (768px-1024px) - Sidebar colapsável
- **Mobile** (<768px) - Sidebar oculta por padrão

## 🚧 Status atual

### ✅ Concluído
- Sistema de autenticação
- Dashboard funcional
- CRUD de produtos, clientes e vendas
- Sistema de relatórios
- Notificações push
- Interface responsiva

### 🔄 Em desenvolvimento
- Correção da responsividade da sidebar
- Otimizações de performance
- Testes automatizados

### 📋 Próximas funcionalidades
- Integração com WhatsApp Business
- Sistema de backup automático
- Dashboard avançado com mais métricas
- API REST completa
- Documentação da API

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome** - [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

## 🙏 Agradecimentos

- Comunidade Node.js
- Contribuidores do projeto
- Usuários que testaram e reportaram bugs

## 📞 Suporte

Para suporte, envie um email para [suporte@exemplo.com](mailto:suporte@exemplo.com) ou abra uma issue no GitHub.

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!** 