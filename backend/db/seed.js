const db = require('./database');

function seed() {
  // Não repopula se já houver dados
  const jaTemDados = db.prepare('SELECT COUNT(*) as total FROM profissionais').get();
  if (jaTemDados.total > 0) {
    console.log('Banco já possui dados. Seed ignorado.');
    return;
  }

  console.log('Populando banco com dados de exemplo...');

  // Profissionais
  const inserirProfissional = db.prepare(
    'INSERT INTO profissionais (nome, cor, bg) VALUES (?, ?, ?)'
  );

  const profissionais = [
    { nome: 'Ana Clara',     cor: '#7c5cbf', bg: '#ede8f7' },
    { nome: 'Beatriz Lima',  cor: '#b85678', bg: '#f7e8ee' },
    { nome: 'Camila Rocha',  cor: '#3d9e8e', bg: '#e8f5f3' },
  ];

  const profIds = profissionais.map(p => {
    const result = inserirProfissional.run(p.nome, p.cor, p.bg);
    return result.lastInsertRowid;
  });

  // Clientes
  const inserirCliente = db.prepare(
    'INSERT INTO clientes (nome, tel, cpf) VALUES (?, ?, ?)'
  );

  const clientes = [
    { nome: 'Fernanda Souza',    tel: '(11) 99234-5678', cpf: '123.456.789-00' },
    { nome: 'Juliana Mendes',    tel: '(11) 98765-4321', cpf: '234.567.890-11' },
    { nome: 'Priscila Alves',    tel: '(21) 97654-3210', cpf: '345.678.901-22' },
    { nome: 'Tatiana Oliveira',  tel: '(31) 96543-2109', cpf: '456.789.012-33' },
    { nome: 'Vanessa Rodrigues', tel: '(41) 95432-1098', cpf: '567.890.123-44' },
  ];

  const clienteIds = clientes.map(c => {
    const result = inserirCliente.run(c.nome, c.tel, c.cpf);
    return result.lastInsertRowid;
  });

  // Agendamentos para 2025-04-16
  const inserirAgendamento = db.prepare(`
    INSERT INTO agendamentos
      (data, hora, min, dur, cliente_id, procedimento, status, profissional_id, obs, valor)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const agendamentos = [
    {
      data: '2025-04-16', hora: 9,  min: 0,  dur: 60,
      cliente_id: clienteIds[0], procedimento: 'Botox',
      status: 'confirmado', profissional_id: profIds[0],
      obs: 'Primeira aplicação', valor: 350.00
    },
    {
      data: '2025-04-16', hora: 10, min: 30, dur: 90,
      cliente_id: clienteIds[1], procedimento: 'Limpeza de Pele',
      status: 'confirmado', profissional_id: profIds[1],
      obs: null, valor: 180.00
    },
    {
      data: '2025-04-16', hora: 11, min: 0,  dur: 45,
      cliente_id: clienteIds[2], procedimento: 'Design de Sobrancelha',
      status: 'pendente', profissional_id: profIds[2],
      obs: null, valor: 80.00
    },
    {
      data: '2025-04-16', hora: 14, min: 0,  dur: 60,
      cliente_id: clienteIds[3], procedimento: 'Massagem',
      status: 'encaixe', profissional_id: profIds[0],
      obs: 'Encaixe de última hora', valor: 150.00
    },
    {
      data: '2025-04-16', hora: 15, min: 30, dur: 120,
      cliente_id: clienteIds[4], procedimento: 'Coloração',
      status: 'confirmado', profissional_id: profIds[1],
      obs: 'Mechas + hidratação', valor: 280.00
    },
    {
      data: '2025-04-16', hora: 16, min: 0,  dur: 30,
      cliente_id: clienteIds[0], procedimento: 'Design de Sobrancelha',
      status: 'cancelado', profissional_id: profIds[2],
      obs: 'Cliente cancelou por telefone', valor: 80.00
    },
  ];

  const inserirTodos = db.transaction(() => {
    agendamentos.forEach(a => {
      inserirAgendamento.run(
        a.data, a.hora, a.min, a.dur,
        a.cliente_id, a.procedimento, a.status,
        a.profissional_id, a.obs, a.valor
      );
    });
  });

  inserirTodos();

  console.log(`Seed concluído: ${profissionais.length} profissionais, ${clientes.length} clientes, ${agendamentos.length} agendamentos.`);
}

module.exports = seed;
