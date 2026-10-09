#!/usr/bin/env node
// Valida docs/plan-paginas.csv contra las reglas de AGENTS.md §3.2.
// Uso: node tools/validar-plan.js   (sale con código 1 si hay errores)
// Sin dependencias: solo módulos nativos de Node.

'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const CSV = path.join(RAIZ, 'docs', 'plan-paginas.csv');

// Lector CSV mínimo (comillas dobles, comillas escapadas "" y saltos de línea dentro de campo)
function leerCsv(texto) {
  texto = texto.replace(/^﻿/, '');
  const filas = [];
  let fila = [], campo = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo.replace(/\r$/, '')); filas.push(fila); fila = []; campo = ''; }
    else campo += c;
  }
  if (campo || fila.length) { fila.push(campo.replace(/\r$/, '')); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.filter(f => f.length > 1).map(f => Object.fromEntries(cab.map((k, i) => [k, f[i] ?? ''])));
}

const normalizar = s => s.toLowerCase().normalize('NFC');
// Palabras vacías: no cuentan al comprobar que la keyword sigue en el title
const VACIAS = new Set(['de', 'del', 'el', 'la', 'los', 'las', 'y', 'e', 'o', 'en', 'para', 'por', 'a', 'con']);
// Singular aproximado («procesos» = «proceso»), suficiente para comparar keywords
const raiz = p => p.replace(/(es|s)$/, '');
const palabras = s => normalizar(s).replace(/\[por verificar gsc\]/g, '')
  .split(/[^\p{L}\p{N}]+/u).filter(p => p && !VACIAS.has(p)).map(raiz);

const filas = leerCsv(fs.readFileSync(CSV, 'utf8'));
const errores = [];
const avisos = [];

if (filas.length !== 52) errores.push(`Hay ${filas.length} páginas; deben ser 52.`);

// Páginas que no conservan «Vitoria» por una decisión registrada (docs/decisiones.md)
const EXCEPCIONES_VITORIA = new Set(['index.html']);

// Columnas que no pueden repetirse entre páginas
const UNICAS = ['archivo', 'title_nuevo_propuesto', 'meta_nueva_propuesta', 'h1_propuesto'];
const vistos = Object.fromEntries(UNICAS.map(c => [c, new Map()]));
let productos = 0;

for (const f of filas) {
  const id = f.archivo;
  for (const campo of UNICAS) {
    const v = f[campo];
    if (vistos[campo].has(v)) errores.push(`${id}: ${campo} repetido con ${vistos[campo].get(v)}: «${v}»`);
    else vistos[campo].set(v, id);
  }

  const t = f.title_nuevo_propuesto;
  if ([...t].length > 60) errores.push(`${id}: title de ${[...t].length} caracteres (máx. 60): «${t}»`);
  if (!/\| BROTOTERMIC( Vitoria)?$/.test(t)) avisos.push(`${id}: el title no acaba en «| BROTOTERMIC» ni en «| BROTOTERMIC Vitoria»: «${t}»`);

  const m = f.meta_nueva_propuesta;
  const lm = [...m].length;
  if (lm < 140 || lm > 155) errores.push(`${id}: meta de ${lm} caracteres (140-155).`);

  // Regla del 2026-10-09: si el title antiguo contenía «Vitoria», el nuevo lo conserva
  // (excepción aprobada en el HITO-1: el inicio, porque con «Vitoria» no cabe en 60 caracteres)
  if (/vitoria/i.test(f.title_antiguo) && !EXCEPCIONES_VITORIA.has(id)) {
    if (!/Vitoria/.test(t)) errores.push(`${id}: el title antiguo contenía «Vitoria» y el nuevo no: «${t}»`);
    else if (!/\| BROTOTERMIC Vitoria$/.test(t)) avisos.push(`${id}: conserva «Vitoria», pero no con el formato «Producto | BROTOTERMIC Vitoria»: «${t}»`);
  }

  // La keyword principal debe estar en el title (todas sus palabras, sin importar mayúsculas)
  const enTitle = new Set(palabras(t));
  const faltan = palabras(f.keyword_principal).filter(p => !enTitle.has(p));
  if (faltan.length) avisos.push(`${id}: palabras de la keyword que no están en el title: ${faltan.join(', ')}`);

  if (f.num_productos !== '') productos += Number(f.num_productos);
}

console.log(`plan-paginas.csv: ${filas.length} páginas, ${productos} productos en categorías.`);
for (const a of avisos) console.log('AVISO  ' + a);
for (const e of errores) console.log('ERROR  ' + e);
console.log(errores.length ? `\n${errores.length} error(es).` : '\nSin errores.');
process.exit(errores.length ? 1 : 0);
