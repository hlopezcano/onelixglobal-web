# AGENTS.md — Reglas del proyecto OnelixGlobal (web de marca)

Sitio estático en GitHub Pages (`onelixglobal.com`).
Carpeta local: `D:\AARON\ONELIXGLOBAL\web` (repo `onelixglobal-web`, rama `main`).

## Reglas innegociables

- **NO** hagas `git commit` ni `git push`. Solo edita; el push lo hace el
  orquestador (Hermes).
- **NO** borres ni renombres archivos sin permiso.

## Estructura

- `index.html` — la landing (hero, catálogo físico, guías digitales, FAQ,
  lista de espera).
- `aviso-legal.html`, `privacidad.html`, `cookies.html` — páginas legales.
- `styles.css` — estilos.
- `consent.js`, `signup.js`, `asistente.js` — comportamiento.
- `sitemap.xml`, `robots.txt` — SEO.

## Marca

- Paleta: marfil `#F6F4EF` · azul marino `#101A3C` · azul `#1848D8` ·
  oro `#B98A2F` · tinta `#0B1226`.
- Tipografías: **Sora** (títulos) + **Inter** (texto), por Google Fonts.
- Tagline: «Productos útiles para el día a día».

## Trampas ya pagadas (NO repetirlas)

- No usar `<section>` para widgets propios (el CSS añade `padding: 78px 0`).
  Usar `<div>` con `padding:0`.
- `display:flex` anula el atributo `hidden` → usar `.caja[hidden]{display:none}`.
- `styles.css` y los `.js` no llevan huella de versión: al publicar, avisar de
  **Ctrl+F5**.
- El formulario de Brevo se envía por AJAX (`fetch` con `mode:'no-cors'`), no
  por POST normal.

## Cómo verificar en local

`python -m http.server 8099 --directory "D:/AARON/ONELIXGLOBAL/web"` y abrir
`http://127.0.0.1:8099/index.html`.

Al terminar: reporta exactamente qué archivos cambiaste y cómo verificarlo.
