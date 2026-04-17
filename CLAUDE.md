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

## Current Limitations

- No backend — all data is hardcoded mock data
- No persistence — page refresh loses all changes
- Hardcoded date: April 16, 2025
- AI/WhatsApp features are UI-only (not implemented)
