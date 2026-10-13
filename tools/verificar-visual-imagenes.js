#!/usr/bin/env node
// Evidencia local con Chrome instalado y CDP nativo (Node >= 22, sin dependencias).
// node tools/verificar-visual-imagenes.js antes|despues [carpeta]
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { servir } = require('./servir');
const etapa = process.argv[2];
if (!['antes', 'despues'].includes(etapa)) throw Error('Indica antes o despues');
const salida = path.resolve(process.argv[3] || 'docs/imagenes-antes-despues/plantillas');
const chromePath = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = 'http://127.0.0.1:8879';
const pausa = ms => new Promise(r => setTimeout(r, ms));
const paginas = [['inicio', '/'], ['categoria', '/resistencias-inmersion.html'], ['fabricaciones', '/fabricaciones-a-medida.html'], ['empresa', '/empresa.html'], ['contacto', '/contacto/contacto.html'], ['oviedo', '/oviedo/']];
async function main() {
  fs.mkdirSync(salida, { recursive: true });
  const servidor = await new Promise(r => servir(8879, r));
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'broto-visual-'));
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9335', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  let ws;
  try {
    let tab;
    for (let n = 0; n < 80 && !tab; n++) {
      await pausa(150);
      try { tab = (await (await fetch('http://127.0.0.1:9335/json/list')).json()).find(t => t.type === 'page'); } catch {}
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
    for (const [nombre, ruta] of paginas) for (const ancho of [320, 390, 768, 1280]) {
      await enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 768 });
      await enviar('Page.navigate', { url: base + ruta });
      for (let n = 0; n < 60 && await evaluar('document.readyState') !== 'complete'; n++) await pausa(100);
      await evaluar('document.fonts.ready.then(() => true)');
      await evaluar('Promise.all([...document.images].map(i => { i.loading="eager"; return i.decode().catch(() => {}); })).then(() => true)');
      const medidas = await evaluar('({ancho:innerWidth,scroll:document.documentElement.scrollWidth,imagenes:[...document.images].filter(i=>!i.complete || !i.naturalWidth).length})');
      if (medidas.scroll > ancho || medidas.imagenes) throw Error(`${nombre} ${ancho}: ${JSON.stringify(medidas)}`);
      resultados.push({ nombre, ancho, ...medidas });
      if ([390, 1280].includes(ancho)) {
        const alto = await evaluar('document.documentElement.scrollHeight');
        const captura = await enviar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: ancho, height: Math.min(alto, 16000), scale: 1 } });
        fs.writeFileSync(path.join(salida, `${etapa}-${nombre}-${ancho}.png`), Buffer.from(captura.data, 'base64'));
      }
    }
    if (etapa === 'despues') {
      await enviar('Page.navigate', { url: base + '/contacto/contacto.html' });
      await pausa(400);
      const pruebas = await evaluar(`(() => {
        const input=document.querySelector('[name="adjunto"]'), zona=document.querySelector('[data-adjunto]');
        const nombre=document.querySelector('[data-adjunto-nombre]'), error=document.getElementById('f-adjunto-error');
        const archivo=(name,size=1)=>new File([new Uint8Array(size)],name);
        const seleccionar=f=>{const d=new DataTransfer();d.items.add(f);input.files=d.files;input.dispatchEvent(new Event('change',{bubbles:true}));};
        const arrastrar=files=>{const d=new DataTransfer();files.forEach(f=>d.items.add(f));zona.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:d}));};
        const tests=[];const check=(nombre,ok)=>tests.push({nombre,ok:!!ok});
        seleccionar(archivo('plano.pdf'));check('selector PDF y anuncio',input.files[0].name==='plano.pdf' && nombre.textContent.includes('plano.pdf') && !input.hasAttribute('aria-invalid'));
        seleccionar(archivo('mal.exe'));check('extension rechazada',input.getAttribute('aria-invalid')==='true' && !error.hidden);
        seleccionar(archivo('grande.pdf',Number(document.querySelector('form').dataset.maxMb)*1024*1024+1));check('tamano rechazado',error.textContent.includes('pesa más'));
        arrastrar([archivo('arrastre.pdf')]);check('drop PDF',input.files[0]?.name==='arrastre.pdf' && !input.hasAttribute('aria-invalid'));
        arrastrar([archivo('uno.pdf'),archivo('dos.pdf')]);check('drop multiple vacia seleccion',input.files.length===0 && error.textContent.includes('un solo archivo'));
        const form=document.querySelector('form');const submit=new Event('submit',{bubbles:true,cancelable:true});form.dispatchEvent(submit);check('error persiste al validar',submit.defaultPrevented && error.textContent.includes('un solo archivo'));
        seleccionar(archivo('plano-con-un-nombre-'+('largo-'.repeat(30))+'.pdf'));check('nombre largo',document.documentElement.scrollWidth===innerWidth);
        check('envio sigue inactivo',form.querySelector('[type="submit"]').disabled);
        form.reset();return tests;
      })()`);
      await pausa(100);
      if (pruebas.some(p => !p.ok)) throw Error(JSON.stringify(pruebas));
      resultados.push({ pruebasAdjunto: pruebas });
      await enviar('Emulation.setScriptExecutionDisabled', { value: true });
      await enviar('Page.navigate', { url: base + '/contacto/contacto.html' });
      await pausa(400);
      const sinJs = await evaluar('({inputVisible:!!document.querySelector("input[type=file]").offsetWidth,arrastreOculto:document.querySelector("[data-adjunto-arrastre]").hidden})');
      if (!sinJs.inputVisible || !sinJs.arrastreOculto) throw Error('Fallo sin JS');
      resultados.push({ sinJs });
      await enviar('Emulation.setScriptExecutionDisabled', { value: false });
    }
    if (incidencias.length) throw Error(incidencias.join('\n'));
    fs.writeFileSync(path.join(salida, `${etapa}-resultados.json`), JSON.stringify({ fecha: new Date().toISOString(), resultados, incidencias }, null, 2) + '\n');
    console.log(`${etapa}: ${paginas.length * 4} combinaciones sin desborde, errores JS, imágenes rotas ni terceros; capturas a 390/1280.`);
  } finally { if (ws) ws.close(); chrome.kill(); servidor.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
