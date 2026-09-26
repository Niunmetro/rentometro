// Graficos SVG hechos a mano (sin librerias): solo presentacion, ninguna logica de calculo.
import type { FilaAmortizacion } from "./types";

const eurosEnteros = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0, useGrouping: true });

export function eurosCortos(n: number): string {
  return Number.isFinite(n) ? `${eurosEnteros.format(Math.round(n))} €` : "—";
}

function miles(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return `${eurosEnteros.format(Math.round(n / 1000))} k€`;
  return `${eurosEnteros.format(Math.round(n))} €`;
}

export interface Segmento {
  etiqueta: string;
  valor: number;
  /** clase de color: seg-1 .. seg-4 */
  clase: string;
}

/** Barra apilada horizontal + leyenda con importe y porcentaje de cada tramo. */
export function barraReparto(titulo: string, segmentos: Segmento[], sufijo = ""): string {
  const validos = segmentos.filter((s) => Number.isFinite(s.valor) && s.valor > 0);
  const total = validos.reduce((acc, s) => acc + s.valor, 0);
  if (total <= 0) return "";

  let x = 0;
  const rects = validos
    .map((s) => {
      const ancho = (s.valor / total) * 100;
      const r = `<rect class="${s.clase}" x="${x.toFixed(3)}%" y="0" width="${ancho.toFixed(3)}%" height="14"></rect>`;
      x += ancho;
      return r;
    })
    .join("");

  const leyenda = validos
    .map(
      (s) =>
        `<li><span class="punto ${s.clase}" aria-hidden="true"></span><span class="ley-etiqueta">${s.etiqueta}</span><span class="ley-valor">${eurosCortos(s.valor)}${sufijo}</span><span class="ley-pct">${Math.round((s.valor / total) * 100)} %</span></li>`,
    )
    .join("");

  const resumen = validos.map((s) => `${s.etiqueta} ${eurosCortos(s.valor)}`).join(", ");
  return `
    <figure class="grafico">
      <figcaption>${titulo}</figcaption>
      <svg class="barra" width="100%" height="14" role="img" aria-label="${titulo}: ${resumen}">
        <defs><clipPath id="clip-${slug(titulo)}"><rect x="0" y="0" width="100%" height="14" rx="7"></rect></clipPath></defs>
        <g clip-path="url(#clip-${slug(titulo)})">${rects}</g>
      </svg>
      <ul class="leyenda">${leyenda}</ul>
    </figure>`;
}

function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[^\w]+/g, "-")
    .toLowerCase();
}

/** Curva de capital pendiente por anio (area) con marca del punto en que se ha amortizado la mitad. */
export function curvaAmortizacion(importe: number, tabla: FilaAmortizacion[]): string {
  if (!Number.isFinite(importe) || importe <= 0 || tabla.length === 0) return "";
  const W = 320;
  const H = 150;
  const izq = 40;
  const der = 8;
  const arr = 10;
  const abj = 24;
  const ancho = W - izq - der;
  const alto = H - arr - abj;
  const n = tabla.length;

  const puntos: Array<[number, number]> = [[0, importe]];
  for (const f of tabla) puntos.push([f.anio, Math.max(0, Number.isFinite(f.capitalPendiente) ? f.capitalPendiente : 0)]);

  const px = (anio: number) => izq + (anio / n) * ancho;
  const py = (v: number) => arr + (1 - Math.min(v, importe) / importe) * alto;

  const linea = puntos.map(([a, v], i) => `${i === 0 ? "M" : "L"}${px(a).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  const area = `${linea} L${px(n).toFixed(1)} ${py(0).toFixed(1)} L${px(0).toFixed(1)} ${py(0).toFixed(1)} Z`;

  const guias = [0, 0.5, 1]
    .map((f) => {
      const y = py(importe * f);
      return `<line class="guia" x1="${izq}" x2="${W - der}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"></line>
        <text class="eje" x="${izq - 6}" y="${(y + 3.5).toFixed(1)}" text-anchor="end">${miles(importe * f)}</text>`;
    })
    .join("");

  const mitadAnio = tabla.find((f) => f.capitalPendiente <= importe / 2)?.anio;
  let marca = "";
  if (mitadAnio !== undefined) {
    const mx = px(mitadAnio);
    const my = py(importe / 2);
    // La curva baja hacia la derecha: la zona libre queda abajo-izquierda del punto
    // (o arriba-derecha si el punto esta muy a la izquierda).
    const ancla = mitadAnio / n > 0.3 ? "end" : "start";
    const dx = ancla === "end" ? -10 : 10;
    const dy = ancla === "end" ? 18 : -10;
    marca = `<line class="marca-linea" x1="${mx.toFixed(1)}" x2="${mx.toFixed(1)}" y1="${my.toFixed(1)}" y2="${py(0).toFixed(1)}"></line>
      <circle class="marca-punto" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="4"></circle>
      <text class="marca-texto" x="${(mx + dx).toFixed(1)}" y="${(my + dy).toFixed(1)}" text-anchor="${ancla}">Mitad pagada: año ${mitadAnio}</text>`;
  }

  const ejeX = [0, Math.round(n / 2), n]
    .map((a, i) => `<text class="eje" x="${px(a).toFixed(1)}" y="${H - 6}" text-anchor="${i === 0 ? "start" : i === 2 ? "end" : "middle"}">${a === 0 ? "Hoy" : `Año ${a}`}</text>`)
    .join("");

  const aria = `Capital pendiente de ${eurosCortos(importe)} a 0 € en ${n} años${mitadAnio !== undefined ? `; la mitad se amortiza en el año ${mitadAnio}` : ""}.`;

  return `
    <figure class="grafico">
      <figcaption>Capital pendiente año a año</figcaption>
      <svg class="curva" viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria}">
        ${guias}
        <path class="area" d="${area}"></path>
        <path class="linea" d="${linea}"></path>
        ${marca}
        ${ejeX}
      </svg>
    </figure>`;
}
