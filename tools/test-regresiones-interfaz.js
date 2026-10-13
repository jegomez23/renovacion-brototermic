#!/usr/bin/env node
// Regresiones reales de menú y formulario. Node >= 22 y Chrome instalado, sin dependencias npm.
// Ejecutar después del build: npm run test:interfaz. No realiza envíos de correo ni POST.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { servir } = require('./servir');
const chromePath = process.env.CHROME || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
if (!chromePath || typeof WebSocket === 'undefined') throw Error('Hace falta Chrome y Node >= 22. Usa CHROME para indicar el ejecutable.');
const base = 'http://127.0.0.1:8878';
const pausa = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const servidor = await new Promise(r => servir(8878, r));
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'broto-visual-'));
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9350', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  try {
    let tab;
    for (let n = 0; n < 80 && !tab; n++) {
      await pausa(150);
      try { tab = (await (await fetch('http://127.0.0.1:9350/json/list')).json()).find(t => t.type === 'page'); } catch {}
    }
    if (!tab) throw Error('Chrome no responde');
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
    let id = 0;
    const pendientes = new Map();
    const incidencias = [];
    ws.onmessage = ({ data }) => {
      const m = JSON.parse(data);
      if (m.id) {
        const p = pendientes.get(m.id);
        if (p) { pendientes.delete(m.id); m.error ? p.mal(Error(m.error.message)) : p.ok(m.result); }
      } else if (m.method === 'Runtime.exceptionThrown') incidencias.push(m.params.exceptionDetails.text);
      else if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) incidencias.push(`HTTP ${m.params.response.status}: ${m.params.response.url}`);
      else if (m.method === 'Network.requestWillBeSent' && !m.params.request.url.startsWith(base) && !m.params.request.url.startsWith('data:')) incidencias.push(`Tercero: ${m.params.request.url}`);
    };
    const enviar = (method, params = {}) => new Promise((ok, mal) => { pendientes.set(++id, { ok, mal }); ws.send(JSON.stringify({ id, method, params })); });
    const evaluar = async expression => {
      const r = await enviar('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    };
    await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable'].map(m => enviar(m)));

    const resultados = [];
    const check = (nombre, ok) => resultados.push({ nombre, ok: !!ok });
    const cargar = async ruta => {
      await enviar('Page.navigate', { url: base + ruta });
      await pausa(250);
      for (let i = 0; i < 60 && await evaluar('document.readyState') !== 'complete'; i++) await pausa(100);
    };
    const enter = async () => {
      await enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await enviar('Input.dispatchKeyEvent', { type: 'char', text: '\r', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    };
    await enviar('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true });
    await cargar('/');
    await evaluar(`(() => {
      document.querySelector('.cabecera__menu').click();
      document.querySelector('.menu__item--productos .menu__boton').click();
      const campo=document.querySelector('#panel-productos .buscador__campo');
      campo.value='sensor';campo.dispatchEvent(new Event('input',{bubbles:true}));
    })()`);
    await pausa(350);
    const visibles = () => evaluar(`[...document.querySelectorAll('#panel-productos a[data-buscar]')].filter(a=>a.getClientRects().length).length`);
    const encontrados = await visibles();
    check('búsqueda sensor devuelve categorías visibles', encontrados > 0);
    await evaluar(`document.querySelector('.megamenu__grupo:not([hidden]) .megamenu__plegar').focus()`);
    await enter();
    check('Intro en familia conserva todos los resultados', await visibles() === encontrados);
    check('grupos coincidentes declaran expansión y bloqueo temporal', await evaluar(`[...document.querySelectorAll('.megamenu__grupo:not([hidden]) .megamenu__plegar')].every(b=>b.getAttribute('aria-expanded')==='true' && b.getAttribute('aria-disabled')==='true')`));
    await evaluar(`document.querySelector('.megamenu__grupo:not([hidden]) .megamenu__plegar').click()`);
    check('clic en familia conserva todos los resultados', await visibles() === encontrados);
    await evaluar(`(() => {const c=document.querySelector('#panel-productos .buscador__campo');c.value='';c.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.megamenu__plegar').focus();})()`);
    await enter();
    check('vaciar búsqueda recupera acordeón y controles', await evaluar(`document.querySelector('.megamenu__plegar').getAttribute('aria-expanded')==='true' && !document.querySelector('.megamenu__plegar').hasAttribute('aria-disabled')`));
    await cargar('/contacto/contacto.html');
    await evaluar(`(() => {
      const f=document.getElementById('formulario');
      f.elements.name.value='Prueba local';f.elements.email.value='test@example.com';f.elements.message.value='Prueba sin envío';f.elements.rgpd.checked=true;
      window.pruebaDrop=(nombres)=>{const d=new DataTransfer();nombres.forEach(n=>d.items.add(new File(['x'],n)));document.querySelector('[data-adjunto]').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:d}));};
      window.pruebaValidar=()=>{const e=new Event('submit',{bubbles:true,cancelable:true});f.dispatchEvent(e);return !e.defaultPrevented;};
    })()`);
    for (const nombres of [['mal.exe'], ['uno.pdf','dos.pdf']]) {
      await evaluar(`pruebaDrop(${JSON.stringify(nombres)})`);
      check('rechazo de '+nombres.join(', '), await evaluar(`!pruebaValidar() && document.querySelector('[name=adjunto]').files.length===0`));
      const disponible = await evaluar(`!!document.querySelector('[data-adjunto-quitar]:not([hidden])')`);
      check('recuperación disponible tras rechazo', disponible);
      if (disponible) {
        await evaluar(`document.querySelector('[data-adjunto-quitar]').focus()`);await enter();
        check('continuar sin adjunto con teclado permite validar', await evaluar(`pruebaValidar() && document.activeElement.name==='adjunto' && !document.querySelector('[name=adjunto]').hasAttribute('aria-invalid') && document.querySelector('.formulario__error-resumen').hidden`));
      }
    }
    await evaluar(`pruebaDrop(['plano.pdf'])`);
    check('PDF válido conserva archivo y valida', await evaluar(`pruebaValidar() && document.querySelector('[name=adjunto]').files[0].name==='plano.pdf'`));
    check('envío real sigue inactivo', await evaluar(`document.querySelector('[type=submit]').disabled`));
    await evaluar(`document.querySelector('[name=name]').value='';pruebaDrop(['mal.exe']);pruebaValidar();document.querySelector('[data-adjunto-quitar]')?.click()`);
    check('quitar adjunto no oculta otros errores', await evaluar(`!pruebaValidar() && !document.getElementById('f-nombre-error').hidden`));
    await enviar('Emulation.setScriptExecutionDisabled', { value: true });
    await cargar('/contacto/contacto.html');
    check('sin JS conserva input nativo y oculta control mejorado', await evaluar(`document.querySelector('input[type=file]').offsetWidth>0 && !!document.querySelector('[data-adjunto-quitar][hidden]') && document.querySelector('[data-adjunto-arrastre]').hidden`));
    await cargar('/');
    check('sin JS conserva acceso a las 39 categorías', await visibles() === 39);
    check('sin errores JS, HTTP ni terceros', incidencias.length === 0);
    resultados.forEach(r => console.log((r.ok ? 'OK ' : 'FALLO ') + r.nombre));
    if (incidencias.length) console.error(incidencias);
    if (resultados.some(r => !r.ok)) process.exitCode = 1;
  } finally { if (ws) ws.close(); chrome.kill(); servidor.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
