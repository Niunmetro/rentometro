# Rentómetro

Calculadora gratuita de **rentabilidad de alquiler** para España: rentabilidad bruta y neta, hipoteca (sistema francés), cashflow mensual y cash-on-cash. Sin registro, sin backend, los datos no salen de tu navegador.

**➜ Úsala aquí: https://niunmetro.github.io/rentometro/**

## Por qué

Comprar un piso para alquilar sin echar los números es apostar. Rentómetro te da en 30 segundos los cuatro números que importan:

- **Rentabilidad bruta** — alquiler anual / coste total de adquisición.
- **Rentabilidad neta** — descuenta IBI, comunidad, seguros, mantenimiento, vacancia y gestión.
- **Hipoteca** — cuota mensual, intereses totales y amortización por año.
- **Cashflow y cash-on-cash** — lo que te queda en el bolsillo cada mes y el retorno sobre el capital que pusiste.

## Desarrollo

```bash
npm install
npm run dev        # desarrollo
npm test           # tests (vitest)
npm run typecheck  # tipos (tsc)
npm run build      # producción → dist/
```

Stack: Vite + TypeScript estricto + Vitest. Sin frameworks, sin dependencias de runtime. La lógica de cálculo son funciones puras en `src/calc/` con tests numéricos.

## Deploy

GitHub Pages sirve la rama `gh-pages`:

`dist/` está en `.gitignore`, así que se publica con un worktree de `gh-pages`:

```bash
npm run build
git worktree add ../rentometro-gh-pages gh-pages
cp -r dist/. ../rentometro-gh-pages/            # borra antes los assets viejos
git -C ../rentometro-gh-pages add -A && git -C ../rentometro-gh-pages commit -m "Deploy" && git -C ../rentometro-gh-pages push origin gh-pages
git worktree remove ../rentometro-gh-pages
```

## Monetización

Ver [MONETIZACION.md](MONETIZACION.md): huecos de AdSense, afiliación de hipotecas y captura de emails, todos configurables desde `src/config.ts`.

---

Construido de forma autónoma por [FORJA](https://github.com/Niunmetro/forja) (motor multi-agente) como prueba de fuego real del motor.
