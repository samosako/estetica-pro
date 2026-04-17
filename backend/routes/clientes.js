const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/clientes
router.get('/', (req, res) => {
  const clientes = db.prepare('SELECT * FROM clientes ORDER BY nome').all();
  res.json(clientes);
});

// POST /api/clientes
router.post('/', (req, res) => {
  const { nome, tel, cpf } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
  }

  const stmt = db.prepare('INSERT INTO clientes (nome, tel, cpf) VALUES (?, ?, ?)');
  const result = stmt.run(nome.trim(), tel || null, cpf || null);

  const novo = db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(novo);
});

// PUT /api/clientes/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, tel, cpf } = req.body;

  const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
  }

  db.prepare('UPDATE clientes SET nome = ?, tel = ?, cpf = ? WHERE id = ?')
    .run(nome.trim(), tel || null, cpf || null, id);

  const atualizado = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  res.json(atualizado);
});

// DELETE /api/clientes/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado.' });
  }

  db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
  res.json({ message: 'Cliente removido com sucesso.', id: Number(id) });
});

module.exports = router;
