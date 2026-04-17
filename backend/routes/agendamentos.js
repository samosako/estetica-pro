const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

const STATUS_VALIDOS = ['confirmado', 'pendente', 'cancelado', 'noshow', 'encaixe'];

// Query base — join com clientes e profissionais para retornar nomes junto
const SELECT_BASE = `
  SELECT
    a.*,
    c.nome  AS cliente_nome,
    c.tel   AS cliente_tel,
    p.nome  AS profissional_nome,
    p.cor   AS profissional_cor,
    p.bg    AS profissional_bg
  FROM agendamentos a
  JOIN clientes      c ON c.id = a.cliente_id
  JOIN profissionais p ON p.id = a.profissional_id
`;

// GET /api/agendamentos?data=YYYY-MM-DD
router.get('/', (req, res) => {
  const { data } = req.query;

  if (data) {
    // Valida formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return res.status(400).json({ error: 'Parâmetro "data" deve estar no formato YYYY-MM-DD.' });
    }
    const agendamentos = db.prepare(SELECT_BASE + ' WHERE a.data = ? ORDER BY a.hora, a.min').all(data);
    return res.json(agendamentos);
  }

  const agendamentos = db.prepare(SELECT_BASE + ' ORDER BY a.data, a.hora, a.min').all();
  res.json(agendamentos);
});

// POST /api/agendamentos
router.post('/', (req, res) => {
  const { data, hora, min, dur, cliente_id, procedimento, status, profissional_id, obs, valor } = req.body;

  // Validações obrigatórias
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return res.status(400).json({ error: 'Campo "data" é obrigatório e deve estar no formato YYYY-MM-DD.' });
  }
  if (hora === undefined || hora === null) {
    return res.status(400).json({ error: 'Campo "hora" é obrigatório.' });
  }
  if (!procedimento || procedimento.trim() === '') {
    return res.status(400).json({ error: 'Campo "procedimento" é obrigatório.' });
  }
  if (!cliente_id) {
    return res.status(400).json({ error: 'Campo "cliente_id" é obrigatório.' });
  }
  if (!profissional_id) {
    return res.status(400).json({ error: 'Campo "profissional_id" é obrigatório.' });
  }

  const statusFinal = status || 'pendente';
  if (!STATUS_VALIDOS.includes(statusFinal)) {
    return res.status(400).json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.` });
  }

  // Verifica se cliente e profissional existem
  const cliente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(cliente_id);
  if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });

  const prof = db.prepare('SELECT id FROM profissionais WHERE id = ?').get(profissional_id);
  if (!prof) return res.status(404).json({ error: 'Profissional não encontrado.' });

  const stmt = db.prepare(`
    INSERT INTO agendamentos
      (data, hora, min, dur, cliente_id, procedimento, status, profissional_id, obs, valor)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data,
    Number(hora),
    Number(min) || 0,
    Number(dur) || 60,
    Number(cliente_id),
    procedimento.trim(),
    statusFinal,
    Number(profissional_id),
    obs || null,
    valor !== undefined ? Number(valor) : null
  );

  const novo = db.prepare(SELECT_BASE + ' WHERE a.id = ?').get(result.lastInsertRowid);
  res.status(201).json(novo);
});

// PUT /api/agendamentos/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { data, hora, min, dur, cliente_id, procedimento, status, profissional_id, obs, valor } = req.body;

  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(id);
  if (!agendamento) {
    return res.status(404).json({ error: 'Agendamento não encontrado.' });
  }

  if (data && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return res.status(400).json({ error: 'Campo "data" deve estar no formato YYYY-MM-DD.' });
  }
  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.` });
  }

  if (cliente_id) {
    const cliente = db.prepare('SELECT id FROM clientes WHERE id = ?').get(cliente_id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
  }
  if (profissional_id) {
    const prof = db.prepare('SELECT id FROM profissionais WHERE id = ?').get(profissional_id);
    if (!prof) return res.status(404).json({ error: 'Profissional não encontrado.' });
  }

  db.prepare(`
    UPDATE agendamentos SET
      data            = ?,
      hora            = ?,
      min             = ?,
      dur             = ?,
      cliente_id      = ?,
      procedimento    = ?,
      status          = ?,
      profissional_id = ?,
      obs             = ?,
      valor           = ?
    WHERE id = ?
  `).run(
    data            !== undefined ? data            : agendamento.data,
    hora            !== undefined ? Number(hora)    : agendamento.hora,
    min             !== undefined ? Number(min)     : agendamento.min,
    dur             !== undefined ? Number(dur)     : agendamento.dur,
    cliente_id      !== undefined ? Number(cliente_id) : agendamento.cliente_id,
    procedimento    !== undefined ? procedimento.trim() : agendamento.procedimento,
    status          !== undefined ? status          : agendamento.status,
    profissional_id !== undefined ? Number(profissional_id) : agendamento.profissional_id,
    obs             !== undefined ? obs             : agendamento.obs,
    valor           !== undefined ? Number(valor)   : agendamento.valor,
    id
  );

  const atualizado = db.prepare(SELECT_BASE + ' WHERE a.id = ?').get(id);
  res.json(atualizado);
});

// PATCH /api/agendamentos/:id/status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Campo "status" é obrigatório.' });
  }
  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}.` });
  }

  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(id);
  if (!agendamento) {
    return res.status(404).json({ error: 'Agendamento não encontrado.' });
  }

  db.prepare('UPDATE agendamentos SET status = ? WHERE id = ?').run(status, id);

  const atualizado = db.prepare(SELECT_BASE + ' WHERE a.id = ?').get(id);
  res.json(atualizado);
});

// DELETE /api/agendamentos/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(id);
  if (!agendamento) {
    return res.status(404).json({ error: 'Agendamento não encontrado.' });
  }

  db.prepare('DELETE FROM agendamentos WHERE id = ?').run(id);
  res.json({ message: 'Agendamento removido com sucesso.', id: Number(id) });
});

module.exports = router;
