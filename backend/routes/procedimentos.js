const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET /api/procedimentos — lista todos
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM procedimentos ORDER BY nome ASC').all();
    res.json(rows);
  } catch (err) {
    console.error('[procedimentos] GET /:', err);
    res.status(500).json({ error: 'Erro ao buscar procedimentos.' });
  }
});

// POST /api/procedimentos — cria novo
router.post('/', (req, res) => {
  const { nome, valor, dur } = req.body;
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO procedimentos (nome, valor, dur) VALUES (?, ?, ?)'
    );
    const result = stmt.run(
      nome.trim(),
      parseFloat(valor) || 0,
      parseInt(dur, 10)  || 60
    );
    const criado = db.prepare('SELECT * FROM procedimentos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(criado);
  } catch (err) {
    console.error('[procedimentos] POST /:', err);
    res.status(500).json({ error: 'Erro ao criar procedimento.' });
  }
});

// PUT /api/procedimentos/:id — atualiza
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, valor, dur } = req.body;
  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
  }
  try {
    const existe = db.prepare('SELECT id FROM procedimentos WHERE id = ?').get(id);
    if (!existe) return res.status(404).json({ error: 'Procedimento não encontrado.' });

    db.prepare(
      'UPDATE procedimentos SET nome = ?, valor = ?, dur = ? WHERE id = ?'
    ).run(nome.trim(), parseFloat(valor) || 0, parseInt(dur, 10) || 60, id);

    const atualizado = db.prepare('SELECT * FROM procedimentos WHERE id = ?').get(id);
    res.json(atualizado);
  } catch (err) {
    console.error('[procedimentos] PUT /:id:', err);
    res.status(500).json({ error: 'Erro ao atualizar procedimento.' });
  }
});

// DELETE /api/procedimentos/:id — remove
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const existe = db.prepare('SELECT id FROM procedimentos WHERE id = ?').get(id);
    if (!existe) return res.status(404).json({ error: 'Procedimento não encontrado.' });

    db.prepare('DELETE FROM procedimentos WHERE id = ?').run(id);
    res.json({ ok: true, id: parseInt(id, 10) });
  } catch (err) {
    console.error('[procedimentos] DELETE /:id:', err);
    res.status(500).json({ error: 'Erro ao deletar procedimento.' });
  }
});

module.exports = router;
