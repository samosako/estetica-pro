const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/profissionais
router.get('/', (req, res) => {
  const profissionais = db.prepare('SELECT * FROM profissionais ORDER BY nome').all();
  res.json(profissionais);
});

// POST /api/profissionais
router.post('/', (req, res) => {
  const { nome, cor, bg } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
  }
  if (!cor || !bg) {
    return res.status(400).json({ error: 'Os campos "cor" e "bg" são obrigatórios.' });
  }

  const stmt = db.prepare('INSERT INTO profissionais (nome, cor, bg) VALUES (?, ?, ?)');
  const result = stmt.run(nome.trim(), cor.trim(), bg.trim());

  const novo = db.prepare('SELECT * FROM profissionais WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(novo);
});

// PUT /api/profissionais/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cor, bg } = req.body;

  const prof = db.prepare('SELECT * FROM profissionais WHERE id = ?').get(id);
  if (!prof) {
    return res.status(404).json({ error: 'Profissional não encontrado.' });
  }

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
  }
  if (!cor || !bg) {
    return res.status(400).json({ error: 'Os campos "cor" e "bg" são obrigatórios.' });
  }

  db.prepare('UPDATE profissionais SET nome = ?, cor = ?, bg = ? WHERE id = ?')
    .run(nome.trim(), cor.trim(), bg.trim(), id);

  const atualizado = db.prepare('SELECT * FROM profissionais WHERE id = ?').get(id);
  res.json(atualizado);
});

// DELETE /api/profissionais/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const prof = db.prepare('SELECT * FROM profissionais WHERE id = ?').get(id);
  if (!prof) {
    return res.status(404).json({ error: 'Profissional não encontrado.' });
  }

  db.prepare('DELETE FROM profissionais WHERE id = ?').run(id);
  res.json({ message: 'Profissional removido com sucesso.', id: Number(id) });
});

module.exports = router;
