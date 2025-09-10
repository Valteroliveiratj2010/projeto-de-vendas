const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const dashboardRoutes = require("./routes/dashboard");
const path = require("path");
const fs = require("fs");
const app = express();

const PORT = 3000;

// Middleware para desabilitar cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Last-Modified", new Date().toUTCString());
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "../frontend"), {
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
}));

// Mock data
const clientes = [
  { id: 1, nome: "João Silva", email: "joao@email.com", telefone: "(11) 99999-9999" },
  { id: 2, nome: "Maria Santos", email: "maria@email.com", telefone: "(11) 88888-8888" },
  { id: 3, nome: "Pedro Oliveira", email: "pedro@email.com", telefone: "(11) 77777-7777" },
  { id: 4, nome: "Ana Costa", email: "ana@email.com", telefone: "(11) 66666-6666" },
  { id: 5, nome: "Carlos Ferreira", email: "carlos@email.com", telefone: "(11) 55555-5555" }
];

const produtos = [
  { id: 1, nome: "Smartphone Samsung", preco: 899.90, estoque: 15, categoria: "Eletrônicos" },
  { id: 2, nome: "Notebook Dell", preco: 2500.00, estoque: 8, categoria: "Eletrônicos" },
  { id: 3, nome: "Mesa de Escritório", preco: 450.00, estoque: 25, categoria: "Móveis" },
  { id: 4, nome: "Fone Bluetooth", preco: 199.90, estoque: 3, categoria: "Eletrônicos" },
  { id: 5, nome: "Cadeira Gamer", preco: 650.00, estoque: 12, categoria: "Móveis" },
  { id: 6, nome: "Monitor 24\"", preco: 800.00, estoque: 7, categoria: "Eletrônicos" },
  { id: 7, nome: "Teclado Mecânico", preco: 350.00, estoque: 20, categoria: "Eletrônicos" },
  { id: 8, nome: "Mouse Gamer", preco: 150.00, estoque: 18, categoria: "Eletrônicos" }
];

const vendas = [
  { id: 1, data: "2024-01-15", valor_total: 899.90, cliente_id: 1, produtos: [{id:1, nome:"Smartphone Samsung", preco:899.90, quantidade:1}] },
  { id: 2, data: "2024-01-16", valor_total: 2500.00, cliente_id: 2, produtos: [{id:2, nome:"Notebook Dell", preco:2500.00, quantidade:1}] },
  { id: 3, data: "2024-01-17", valor_total: 450.00, cliente_id: 3, produtos: [{id:3, nome:"Mesa de Escritório", preco:450.00, quantidade:1}] },
  { id: 4, data: "2024-01-18", valor_total: 199.90, cliente_id: 4, produtos: [{id:4, nome:"Fone Bluetooth", preco:199.90, quantidade:1}] },
  { id: 5, data: "2024-01-19", valor_total: 650.00, cliente_id: 5, produtos: [{id:5, nome:"Cadeira Gamer", preco:650.00, quantidade:1}] },
  { id: 6, data: "2024-01-20", valor_total: 800.00, cliente_id: 1, produtos: [{id:6, nome:"Monitor 24\"", preco:800.00, quantidade:1}] },
  { id: 7, data: "2024-01-21", valor_total: 350.00, cliente_id: 2, produtos: [{id:7, nome:"Teclado Mecânico", preco:350.00, quantidade:1}] },
  { id: 8, data: "2024-01-22", valor_total: 150.00, cliente_id: 3, produtos: [{id:8, nome:"Mouse Gamer", preco:150.00, quantidade:1}] },
  { id: 9, data: "2024-01-23", valor_total: 1249.90, cliente_id: 4, produtos: [{id:1, nome:"Smartphone Samsung", preco:899.90, quantidade:1}, {id:4, nome:"Fone Bluetooth", preco:199.90, quantidade:1}] },
  { id: 10, data: "2024-01-24", valor_total: 2850.00, cliente_id: 5, produtos: [{id:2, nome:"Notebook Dell", preco:2500.00, quantidade:1}, {id:5, nome:"Cadeira Gamer", preco:650.00, quantidade:1}] }
];

const orcamentos = [
  { id: 1, data: "2024-01-10", valor_total: 1200.00, status: "Pendente", cliente_id: 1, produtos: [{id:1, nome:"Smartphone Samsung", preco:899, quantidade:1}, {id:4, nome:"Fone Bluetooth", preco:199, quantidade:1}] },
  { id: 2, data: "2024-01-11", valor_total: 2500.00, status: "Aprovado", cliente_id: 2, produtos: [{id:2, nome:"Notebook Dell", preco:2500, quantidade:1}] },
  { id: 3, data: "2024-01-12", valor_total: 450.00, status: "Rejeitado", cliente_id: 3, produtos: [{id:3, nome:"Mesa de Escritório", preco:450, quantidade:1}] },
  { id: 4, data: "2024-01-13", valor_total: 199.90, status: "Pendente", cliente_id: 4, produtos: [{id:4, nome:"Fone Bluetooth", preco:199.90, quantidade:1}] },
  { id: 5, data: "2024-01-14", valor_total: 650.00, status: "Aprovado", cliente_id: 5, produtos: [{id:5, nome:"Cadeira Gamer", preco:650, quantidade:1}] }
];
// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

// API Routes - Clientes
// API Routes - Clientes
app.get("/api/clientes", (req, res) => {
  res.json(clientes);
});

app.get("/api/clientes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const cliente = clientes.find(c => c.id === id);
  if (cliente) {
    res.json(cliente);
  } else {
    res.status(404).json({ error: "Cliente não encontrado" });
  }
});

app.post("/api/clientes", (req, res) => {
  const novoCliente = {
    id: clientes.length + 1,
    nome: req.body.nome,
    email: req.body.email,
    telefone: req.body.telefone
  };
  clientes.push(novoCliente);
  res.json(novoCliente);
});

app.put("/api/clientes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    clientes[index] = { ...clientes[index], ...req.body };
    res.json(clientes[index]);
  } else {
    res.status(404).json({ error: "Cliente não encontrado" });
  }
});

app.delete("/api/clientes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    clientes.splice(index, 1);
    res.json({ message: "Cliente removido com sucesso" });
  } else {
    res.status(404).json({ error: "Cliente não encontrado" });
  }
});

// API Routes - Produtos
app.get("/api/produtos", (req, res) => {
  res.json(produtos);
});

app.get("/api/produtos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const produto = produtos.find(p => p.id === id);
  if (produto) {
    res.json(produto);
  } else {
    res.status(404).json({ error: "Produto não encontrado" });
  }
});

app.post("/api/produtos", (req, res) => {
  const novoProduto = {
    id: produtos.length + 1,
    nome: req.body.nome,
    preco: parseFloat(req.body.preco),
    estoque: parseInt(req.body.estoque),
    categoria: req.body.categoria
  };
  produtos.push(novoProduto);
  res.json(novoProduto);
});

app.put("/api/produtos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = produtos.findIndex(p => p.id === id);
  if (index !== -1) {
    produtos[index] = { ...produtos[index], ...req.body };
    res.json(produtos[index]);
  } else {
    res.status(404).json({ error: "Produto não encontrado" });
  }
});

app.delete("/api/produtos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = produtos.findIndex(p => p.id === id);
  if (index !== -1) {
    produtos.splice(index, 1);
    res.json({ message: "Produto removido com sucesso" });
  } else {
    res.status(404).json({ error: "Produto não encontrado" });
  }
});

// API Routes - Vendas
app.get("/api/vendas", (req, res) => {
  res.json(vendas);
});

app.get("/api/vendas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const venda = vendas.find(v => v.id === id);
  if (venda) {
    res.json(venda);
  } else {
    res.status(404).json({ error: "Venda não encontrada" });
  }
});

app.post("/api/vendas", (req, res) => {
  const novaVenda = {
    id: vendas.length + 1,
    data: req.body.data,
    valor_total: parseFloat(req.body.valor_total),
    cliente_id: parseInt(req.body.cliente_id),
    produtos: req.body.produtos || []
  };
  vendas.push(novaVenda);
  res.json(novaVenda);
});

app.put("/api/vendas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = vendas.findIndex(v => v.id === id);
  if (index !== -1) {
    vendas[index] = { ...vendas[index], ...req.body };
    res.json(vendas[index]);
  } else {
    res.status(404).json({ error: "Venda não encontrada" });
  }
});

app.delete("/api/vendas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = vendas.findIndex(v => v.id === id);
  if (index !== -1) {
    vendas.splice(index, 1);
    res.json({ message: "Venda removida com sucesso" });
  } else {
    res.status(404).json({ error: "Venda não encontrada" });
  }
});

// API Routes - Orçamentos
app.get("/api/orcamentos", (req, res) => {
  res.json(orcamentos);
});

app.get("/api/orcamentos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const orcamento = orcamentos.find(o => o.id === id);
  if (orcamento) {
    res.json(orcamento);
  } else {
    res.status(404).json({ error: "Orçamento não encontrado" });
  }
});

app.post("/api/orcamentos", (req, res) => {
  const novoOrcamento = {
    id: orcamentos.length + 1,
    data: req.body.data,
    valor_total: parseFloat(req.body.valor_total),
    status: req.body.status,
    cliente_id: parseInt(req.body.cliente_id),
    produtos: req.body.produtos || []
  };
  orcamentos.push(novoOrcamento);
  res.json(novoOrcamento);
});

app.put("/api/orcamentos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = orcamentos.findIndex(o => o.id === id);
  if (index !== -1) {
    orcamentos[index] = { ...orcamentos[index], ...req.body };
    res.json(orcamentos[index]);
  } else {
    res.status(404).json({ error: "Orçamento não encontrado" });
  }
});

app.delete("/api/orcamentos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = orcamentos.findIndex(o => o.id === id);
  if (index !== -1) {
    orcamentos.splice(index, 1);
    res.json({ message: "Orçamento removido com sucesso" });
  } else {
    res.status(404).json({ error: "Orçamento não encontrado" });
  }
});

// API Route - Dashboard
app.get("/api/dashboard", (req, res) => {
  const totalClientes = clientes.length;
  const totalProdutos = produtos.length;
  const totalVendas = vendas.length;
  const totalOrcamentos = orcamentos.length;
  
  // Calcular vendas por mês
  const vendasPorMes = vendas.reduce((acc, venda) => {
    const mes = venda.data.substring(0, 7); // YYYY-MM
    acc[mes] = (acc[mes] || 0) + venda.valor_total;
    return acc;
  }, {});
  
  // Calcular produtos mais vendidos
  const produtosMaisVendidos = vendas.reduce((acc, venda) => {
    venda.produtos.forEach(produto => {
      const produtoId = produto.id;
      acc[produtoId] = (acc[produtoId] || 0) + produto.quantidade;
    });
    return acc;
  }, {});
  
  // Converter para array e ordenar
  const produtosMaisVendidosArray = Object.entries(produtosMaisVendidos)
    .map(([id, quantidade]) => ({
      id: parseInt(id),
      quantidade,
      nome: produtos.find(p => p.id === parseInt(id))?.nome || 'Produto não encontrado'
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);
  
  // Calcular produtos em estoque baixo
  const produtosEstoqueBaixo = produtos.filter(p => p.estoque < 10);
  
  // Vendas recentes (últimas 10)
  const vendasRecentes = vendas
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, 10)
    .map(venda => ({
      ...venda,
      cliente_nome: clientes.find(c => c.id === venda.cliente_id)?.nome || 'Cliente não encontrado'
    }));
  
  res.json({
    totalClientes,
    totalProdutos,
    totalVendas,
    totalOrcamentos,
    vendasPorMes,
    produtosMaisVendidos: produtosMaisVendidosArray,
    produtosEstoqueBaixo,
    vendasRecentes
  });
});

// Rota para servir o index.html
app.get("/", (req, res) => {
  fs.readFile(path.join(__dirname, "../frontend/index.html"), "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Erro ao carregar página");
      return;
    }
    
    // Cache busting para index.html
    const timestamp = Date.now();
    const updatedData = data.replace(/v=\\d+/g, `v=${timestamp}`);
    
    res.send(updatedData);
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});




