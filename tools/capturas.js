#!/usr/bin/env node
// Capturas y comprobaciones de una página a 320, 360, 768 y 1280 px con el Chrome instalado (sin dependencias:
// usa el protocolo DevTools con el WebSocket nativo de Node ≥ 22).
//
//   node tools/servir.js                      (en otra terminal)
//   node tools/capturas.js [ruta] [--salida carpeta]
//   node tools/capturas.js /resistencias-inmersion.html --salida capturas
//
// Comprueba en cada ancho: scroll horizontal, errores de consola y peticiones fallidas o a otros dominios.
// Capturas: página entera, cabecera, menú abierto (móvil) / megamenú (escritorio), buscador y página sin JS.
// Variables: CHROME (ruta del navegador), BASE (por defecto http://localhost:8000).
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

if (typeof WebSocket === 'undefined') { console.error('Hace falta Node ≥ 22 (WebSocket nativo).'); process.exit(1); }

const args = process.argv.slice(2);
const RUTA = args.find(a => a.startsWith('/')) || '/resistencias-inmersion.html';
const SALIDA = path.resolve(args.includes('--salida') ? args[args.indexOf('--salida') + 1] : path.join(os.tmpdir(), 'brototermic-capturas'));
const BASE = process.env.BASE || 'http://localhost:8000';
const PUERTO = 9333;
const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('No encuentro Chrome: indica su ruta en la variable CHROME.'); process.exit(1); }

const espera = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(SALIDA, { recursive: true });

async function conectar() {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-capturas-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--disable-extensions', 'about:blank'], { stdio: 'ignore' });
  let pagina;
  for (let i = 0; i < 50 && !pagina; i++) {
    await espera(200);
    try { pagina = (await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json()).find(t => t.type === 'page'); } catch {}
  }
  if (!pagina) throw new Error('Chrome no responde en el puerto de depuración');
  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let id = 0;
  const pendientes = new Map();
  const oyentes = [];
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.id && pendientes.has(m.id)) {
      const { ok, mal } = pendientes.get(m.id);
      pendientes.delete(m.id);
      m.error ? mal(new Error(m.error.message)) : ok(m.result);
    } else if (m.method) oyentes.forEach(f => f(m));
  };
  const enviar = (method, params = {}) => new Promise((ok, mal) => {
    pendientes.set(++id, { ok, mal });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const cerrar = () => { ws.close(); chrome.kill(); };
  return { enviar, oyentes, cerrar };
}

async function main() {
  const { enviar, oyentes, cerrar } = await conectar();
  const incidencias = [];
  let ancho = 0;
  oyentes.push(m => {
    if (m.method === 'Runtime.exceptionThrown') incidencias.push(`[${ancho}px] Excepción JS: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') incidencias.push(`[${ancho}px] Consola: ${m.params.entry.text} ${m.params.entry.url || ''}`);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) incidencias.push(`[${ancho}px] HTTP ${m.params.response.status}: ${m.params.response.url}`);
    if (m.method === 'Network.requestWillBeSent') {
      const u = m.params.request.url;
      if (!u.startsWith(BASE) && !u.startsWith('data:')) incidencias.push(`[${ancho}px] Petición a otro dominio: ${u}`);
    }
  });
  await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable'].map(m => enviar(m)));

  const evaluar = async expr => (await enviar('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
  const cargar = async (sinJs = false) => {
    await enviar('Emulation.setScriptExecutionDisabled', { value: sinJs });
    await enviar('Page.navigate', { url: BASE + RUTA });
    await espera(400);
    await evaluar('new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r))');
    await evaluar('document.fonts.ready.then(() => true)');
    await espera(300);
  };
  // fueraDeVentana: captureBeyondViewport. Chrome redimensiona la ventana un instante, salta la media query de
  // 768 px y el JS cierra los paneles abiertos (es lo correcto en la web), así que solo se usa con todo cerrado.
  const capturar = async (nombre, clip, fueraDeVentana = !clip) => {
    const alto = clip?.alto ?? await evaluar('document.documentElement.scrollHeight');
    const { data } = await enviar('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: fueraDeVentana,
      clip: { x: 0, y: clip?.y ?? 0, width: ancho, height: Math.min(alto, 16000), scale: 1 },
    });
    const archivo = path.join(SALIDA, `${nombre}.png`);
    fs.writeFileSync(archivo, Buffer.from(data, 'base64'));
    return archivo;
  };

  const resumen = [];
  for (const [w, h] of [[320, 640], [360, 780], [768, 1024], [1280, 800]]) {
    ancho = w;
    await enviar('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
    await enviar('Emulation.setTouchEmulationEnabled', { enabled: w < 1280 });
    await cargar();
    const medidas = await evaluar(`({
      scroll: document.documentElement.scrollWidth, ventana: innerWidth,
      alto: document.documentElement.scrollHeight,
      anchos: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed').slice(0, 5).map(e => e.tagName + '.' + e.className)
    })`);
    if (medidas.scroll > medidas.ventana) incidencias.push(`[${w}px] Scroll horizontal: ${medidas.scroll} > ${medidas.ventana} (${medidas.anchos.join(', ')})`);
    const archivos = [await capturar(`${w}-arriba`, { y: 0, alto: h })];
    // Las imágenes con loading="lazy" solo cargan al entrar en la ventana: para la página entera se fuerzan
    await evaluar(`Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); })).then(() => true)`);
    archivos.push(await capturar(`${w}-pagina`));
    // Zonas de la página (de un elemento a otro), con todos los paneles cerrados
    const zona = async (nombre, desde, hasta) => {
      const r = await evaluar(`(() => {
        const a = document.querySelector(${JSON.stringify(desde)}), b = document.querySelector(${JSON.stringify(hasta)});
        if (!a || !b) return null;
        const y = a.getBoundingClientRect().top + scrollY, fin = b.getBoundingClientRect().bottom + scrollY;
        return { y: Math.max(0, Math.round(y - 16)), alto: Math.round(fin - y + 32) };
      })()`);
      if (r) archivos.push(await capturar(nombre, r, true));
    };
    await zona(`${w}-productos`, '.producto:nth-child(1)', '.producto:nth-child(2)');
    await zona(`${w}-final`, '.categoria__lateral', '.pie');

    if (w < 768) {
      await evaluar('document.querySelector(".cabecera__menu").click(); document.querySelector(".menu__boton").click(); true');
      await espera(200);
      archivos.push(await capturar(`${w}-menu`, { y: 0, alto: h }));
      await evaluar('const c = document.querySelector(".buscador__campo"); c.value = "termo"; c.dispatchEvent(new Event("input")); true');
      await espera(450);
      archivos.push(await capturar(`${w}-buscador`, { y: 0, alto: h }));
    } else {
      await evaluar('document.querySelector(".menu__boton").click(); true');
      await espera(200);
      archivos.push(await capturar(`${w}-megamenu`, { y: 0, alto: h }));
      await evaluar('const c = document.querySelector(".buscador__campo"); c.value = "sensores"; c.dispatchEvent(new Event("input")); true');
      await espera(450);
      archivos.push(await capturar(`${w}-buscador`, { y: 0, alto: h }));
    }
    await cargar(true);
    archivos.push(await capturar(`${w}-sin-js`, { y: 0, alto: h }));
    await enviar('Emulation.setScriptExecutionDisabled', { value: false });
    resumen.push(`${w}px: alto ${medidas.alto}px, scroll horizontal ${medidas.scroll > medidas.ventana ? 'SÍ' : 'no'}`);
  }
  cerrar();

  console.log(`Capturas en ${SALIDA}`);
  resumen.forEach(r => console.log('  ' + r));
  if (incidencias.length) { console.log('\nIncidencias:'); [...new Set(incidencias)].forEach(i => console.log('  ' + i)); process.exitCode = 1; }
  else console.log('\nSin incidencias: ni scroll horizontal, ni errores de consola, ni peticiones fallidas o a terceros.');
}

main().catch(e => { console.error(e); process.exit(1); });
