const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'estetica.db');

const db = new Database(DB_PATH);

// Habilita WAL para melhor performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Cria as tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    tel        TEXT,
    cpf        TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS profissionais (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT NOT NULL,
    cor        TEXT NOT NULL,
    bg         TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS agendamentos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    data            TEXT    NOT NULL,
    hora            INTEGER NOT NULL,
    min             INTEGER NOT NULL DEFAULT 0,
    dur             INTEGER NOT NULL DEFAULT 60,
    cliente_id      INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    procedimento    TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'pendente'
                    CHECK(status IN ('confirmado','pendente','cancelado','noshow','encaixe')),
    profissional_id INTEGER NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    obs             TEXT,
    valor           REAL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

module.exports = db;
