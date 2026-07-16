# Rentómetro — Guía de monetización (15 minutos de tu tiempo, luego pasivo)

La web ya está preparada con los huecos. Solo tienes que pegar tus IDs.

## 1. AdSense (ingresos por visitas) — ~10 min
1. Entra en https://adsense.google.com con tu cuenta de Google y da de alta el sitio.
2. Cuando te aprueben, copia el snippet y pégalo donde dice `<!-- AdSense: pegar snippet aquí -->` en `index.html` (hay dos huecos: `#ad-top` y `#ad-bottom`).
3. Commit + push: el deploy es automático.

Realista: con 1.000 visitas/mes de SEO, 3-10 €/mes. Con 10.000, 30-100 €/mes. Crece solo si la página posiciona (ya lleva el SEO técnico hecho).

## 2. Afiliación de hipotecas (el dinero de verdad) — ~5 min
El bloque "Compara hipotecas" bajo la calculadora de hipoteca apunta a `AFILIADO_HIPOTECA_URL` en `src/config.ts`.
- Opciones en España: **idealista/hipotecas** (programa de afiliados vía Awin), **Rastreator**, **Kelisto**, o un broker tipo **Trioteca** (pagan 50-300 € por hipoteca firmada referida).
- Date de alta en Awin (https://www.awin.com) → busca el anunciante → copia tu enlace → pégalo en `src/config.ts`.

Una sola hipoteca firmada al mes ya son 50-300 €/mes.

## 3. Captura de emails (activo a largo plazo) — ~5 min
El formulario "Recibe la guía del inversor" apunta a `EMAIL_ENDPOINT` en `src/config.ts`.
- Gratis: crea un form en https://formspree.io (50 envíos/mes gratis) y pega la URL.
- Esa lista es el día de mañana el lanzamiento de **Inmomargen**.

## 4. Funnel a Inmomargen (estratégico)
El footer enlaza a `INMOMARGEN_URL` en `src/config.ts` (ahora '#'). Cuando Inmomargen tenga landing, pon la URL: cada usuario de la calculadora es un lead cualificado de tu SaaS.

## 5. SEO: qué ya está hecho y qué no cuesta nada
- Hecho: title/description/OG/canonical, FAQ con schema.org (sale en Google como desplegables), robots.txt, sitemap.xml, carga < 50 KB.
- Tuyo (gratis, 5 min): da de alta el dominio en Google Search Console y envía el sitemap.
- Opcional (~10 €/año): dominio propio (p.ej. rentometro.es) apuntando a GitHub Pages — mejora el CTR y la marca.

## Dónde está todo
- Config de monetización: `src/config.ts` (una constante por cada cosa).
- Huecos de anuncio: `index.html` → `#ad-top`, `#ad-bottom`.
- Deploy: rama `gh-pages` (automático con `npm run build` + push del dist).
