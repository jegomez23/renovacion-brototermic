## Qué cambia y por qué

<!-- Una o dos frases. Si cambia una decisión, enlaza la entrada de docs/decisiones.md (AGENTS.md §11 se actualiza en el mismo commit). -->

## Comprobaciones (AGENTS.md §8 y §9)

- [ ] `npm run test` en verde (el CI lo repite) y `docs/auditoria-seo.md` subido si ha cambiado
- [ ] `npm run validar` sin errores ni advertencias
- [ ] Capturas a 320, 360, 768 y 1280 px si hay cambios visuales (`node tools/capturas.js`)
- [ ] Ningún dato técnico, certificación, plazo ni afirmación comercial sin origen en /legacy o en los PDF
- [ ] Ninguna URL, imagen ni PDF renombrado o eliminado
- [ ] Decisiones registradas en `docs/decisiones.md` y documentos de `/docs` al día (`estado.md` si cambia lo que dice)

## Convenciones

- Rama: `feat/…`, `content/…` o `fix/…` (una por tarea).
- Commits pequeños y en español, con prefijo: `feat:`, `fix:`, `content:`, `docs:` o `chore:`.
- **Revisión:** la otra persona aprueba la PR antes de fusionar. No se fusiona con el CI en rojo.
