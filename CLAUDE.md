# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EstéticaPro** — a beauty salon scheduling system UI prototype. Static HTML/CSS/JS only, no build system, no dependencies installed locally.

## Running the App

Open `agenda.html` directly in a browser. No build step required. All dependencies (Tailwind CSS, Google Fonts) load via CDN.

## Files

- `agenda.html` — Main scheduling application
- `logo-preview.html` — Brand identity exploration (4 logo concepts)

## Architecture

Single-file SPA using vanilla ES6 JavaScript with Tailwind CSS (CDN). All state lives in global arrays; rendering is done via manual DOM manipulation.

**Data model (global scope in `agenda.html`):**
- `agendamentos[]` — appointment objects `{ hora, min, dur, cliente, proc, status, prof, obs }`
- `clientes[]` — client records `{ nome, tel, cpf }`
- `professionals[]` — professional config `{ nome, cor, bg }`
- `historicoClientes[]` — at-risk tracking `{ nome, diasSemVisita, retornoMarcado, tel }`

**Key render functions:**
- `renderAgenda()` — full calendar grid redraw
- `renderMiniCal()` — sidebar mini-calendar
- `renderRisco()` — at-risk clients list

**Appointment status values:** `confirmado`, `pendente`, `cancelado`, `noshow`, `encaixe`

## Design System

CSS custom properties drive theming:
- `--lavender: #7c5cbf` (primary), `--rose: #b85678`, `--teal: #3d9e8e`, `--amber: #b07e28`
- `--bg: #eeeae4`, `--surface: #f8f5f1`, `--text: #1a1628`

Language: Portuguese (pt-BR). All user-facing text and variable names are in Portuguese.

## GitHub Repository

**Repositório:** https://github.com/samosako/estetica-pro  
**Branch principal:** `master`

### Auto-sync configurado

Toda alteração feita via Claude Code (ferramentas `Edit` ou `Write`) é automaticamente:
1. Adicionada ao staging (`git add -A`)
2. Commitada com mensagem `Atualizar <nome-do-arquivo>`
3. Enviada ao GitHub (`git push`)

O hook está em `.claude/settings.json` → `PostToolUse` matcher `Write|Edit`, rodando em modo `async` para não bloquear o fluxo de trabalho.

### Comandos manuais úteis

```bash
git status          # ver mudanças locais
git log --oneline   # histórico de commits
git push            # forçar push manual se necessário
```

### GitHub CLI

O `gh` CLI está instalado em `C:\Program Files\GitHub CLI\gh.exe`.  
Autenticado como usuário `samosako`.

## Current Limitations

- No backend — all data is hardcoded mock data
- No persistence — page refresh loses all changes
- Hardcoded date: April 16, 2025
- AI/WhatsApp features are UI-only (not implemented)
