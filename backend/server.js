const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const dashboardRoutes = require("./routes/dashboard");
const vendasRoutes = require("./routes/vendas");
const clientesRoutes = require("./routes/clientes");
const produtosRoutes = require("./routes/produtos");
const orcamentosRoutes = require("./routes/orcamentos");
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

// API Routes - Usando arquivos de rotas separados
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vendas", vendasRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/orcamentos", orcamentosRoutes);

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