const express = require('express');
const cors    = require('cors');
const db      = require('./db/database');
const seed    = require('./db/seed');

const app  = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Roda o seed na inicialização
seed();

// Rotas
app.use('/api/clientes',      require('./routes/clientes'));
app.use('/api/profissionais', require('./routes/profissionais'));
app.use('/api/agendamentos',  require('./routes/agendamentos'));
app.use('/api/procedimentos', require('./routes/procedimentos'));

// Rota raiz — health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'EstéticaPro API rodando na porta 3001' });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Handler de erros genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`EstéticaPro API rodando na porta ${PORT}`);
});
