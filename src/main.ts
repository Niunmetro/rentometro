import "./style.css";

import { calcularRentabilidad } from "./calc/rentabilidad";
import { calcularHipoteca } from "./calc/hipoteca";
import { calcularCashflow } from "./calc/cashflow";
import { formatearEuros, formatearPct } from "./format";
import { interpretarBruta, interpretarNeta, interpretarCashflow, interpretarCashOnCash } from "./interpret";
import { barraReparto, curvaAmortizacion, eurosCortos } from "./graficos";
import { estadoAUrl, urlAEstado, guardarEnLocal, cargarDeLocal } from "./state";
import { AFILIADO_HIPOTECA_URL, FOOTER_URL } from "./config";
import type {
  EntradasRentabilidad,
  EntradasHipoteca,
  EntradasCashflow,
  ResultadoRentabilidad,
  ResultadoHipoteca,
  ResultadoCashflow,
  FilaAmortizacion,
} from "./types";

const CAMPOS = [
  "precioCompra",
  "itpPct",
  "notariaRegistro",
  "reforma",
  "alquilerMensual",
  "ibiAnual",
  "comunidadAnual",
  "segurosAnual",
  "mantenimientoPct",
  "vacanciaPct",
  "gestionPct",
  "importe",
  "interesAnualPct",
  "plazoAnios",
  "entradaPct",
] as const;

type Campo = (typeof CAMPOS)[number];

const DEFAULTS: Record<Campo, number> = {
  precioCompra: 150000,
  itpPct: 8,
  notariaRegistro: 2500,
  reforma: 5000,
  alquilerMensual: 800,
  ibiAnual: 400,
  comunidadAnual: 300,
  segurosAnual: 150,
  mantenimientoPct: 5,
  vacanciaPct: 5,
  gestionPct: 0,
  importe: 120000,
  interesAnualPct: 3.5,
  plazoAnios: 25,
  entradaPct: 20,
};

const CLAVE_LOCAL = "rentometro-estado";

function normalizarEstado(parcial: Record<string, number>): Record<Campo, number> {
  const estado = { ...DEFAULTS };
  for (const campo of CAMPOS) {
    const valor = parcial[campo];
    if (valor !== undefined && Number.isFinite(valor)) {
      estado[campo] = valor;
    }
  }
  return estado;
}

function leerEstadoInicial(): Record<Campo, number> {
  const desdeUrl = urlAEstado(window.location.search);
  if (Object.keys(desdeUrl).length > 0) {
    return normalizarEstado(desdeUrl);
  }
  const desdeLocal = cargarDeLocal(CLAVE_LOCAL);
  if (desdeLocal) {
    return normalizarEstado(desdeLocal);
  }
  return { ...DEFAULTS };
}

function volcarEstadoEnInputs(estado: Record<Campo, number>): void {
  for (const campo of CAMPOS) {
    const input = document.getElementById(`in-${campo}`);
    if (input instanceof HTMLInputElement) {
      input.value = String(estado[campo]);
    }
  }
}

function leerEstadoDesdeInputs(): Record<Campo, number> {
  const estado = { ...DEFAULTS };
  for (const campo of CAMPOS) {
    const input = document.getElementById(`in-${campo}`);
    const bruto = input instanceof HTMLInputElement ? input.value.trim().replace(",", ".") : "";
    const valor = bruto !== "" ? parseFloat(bruto) : 0;
    estado[campo] = Number.isFinite(valor) ? valor : 0;
  }
  return estado;
}

function construirEntradasRentabilidad(estado: Record<Campo, number>): EntradasRentabilidad {
  return {
    precioCompra: estado.precioCompra,
    itpPct: estado.itpPct,
    notariaRegistro: estado.notariaRegistro,
    reforma: estado.reforma,
    alquilerMensual: estado.alquilerMensual,
    ibiAnual: estado.ibiAnual,
    comunidadAnual: estado.comunidadAnual,
    segurosAnual: estado.segurosAnual,
    mantenimientoPct: estado.mantenimientoPct,
    vacanciaPct: estado.vacanciaPct,
    gestionPct: estado.gestionPct,
  };
}

function construirEntradasHipoteca(estado: Record<Campo, number>): EntradasHipoteca {
  return {
    importe: estado.importe,
    interesAnualPct: estado.interesAnualPct,
    plazoAnios: estado.plazoAnios,
  };
}

function construirEntradasCashflow(estado: Record<Campo, number>): EntradasCashflow {
  return {
    ...construirEntradasRentabilidad(estado),
    entradaPct: estado.entradaPct,
    interesAnualPct: estado.interesAnualPct,
    plazoAnios: estado.plazoAnios,
  };
}

function seguro(n: number, formatear: (n: number) => string): string {
  return Number.isFinite(n) ? formatear(n) : "—";
}

function frase(n: number, interpretar: (n: number) => string): string {
  return Number.isFinite(n) ? interpretar(n) : "—";
}

function claseSemaforo(n: number, bueno: number, regular: number): string {
  if (!Number.isFinite(n)) return "kpi-neutro";
  if (n >= bueno) return "kpi-bien";
  if (n >= regular) return "kpi-regular";
  return "kpi-mal";
}

// El color nunca va solo: cada semaforo lleva tambien una palabra.
const SELLOS: Record<string, string> = {
  "kpi-bien": "Buena",
  "kpi-regular": "Justa",
  "kpi-mal": "Baja",
  "kpi-neutro": "",
};

function sello(clase: string, textos: Partial<Record<string, string>> = {}): string {
  const t = textos[clase] ?? SELLOS[clase] ?? "";
  return t ? `<span class="kpi-sello">${t}</span>` : "";
}

function kpiPrincipal(etiqueta: string, valor: string, clase: string, textos?: Partial<Record<string, string>>): string {
  return `<div class="kpi kpi-principal ${clase}"><span class="kpi-etiqueta">${etiqueta}</span><span class="kpi-valor">${valor}</span>${sello(clase, textos)}</div>`;
}

function kpi(etiqueta: string, valor: string, clase: string, textos?: Partial<Record<string, string>>): string {
  return `<div class="kpi ${clase}"><span class="kpi-etiqueta">${etiqueta}</span><span class="kpi-valor">${valor}</span>${sello(clase, textos)}</div>`;
}

function renderRentabilidad(r: ResultadoRentabilidad, estado: Record<Campo, number>): void {
  const el = document.getElementById("res-rentabilidad");
  if (!el) return;
  const fijos = estado.ibiAnual + estado.comunidadAnual + estado.segurosAnual;
  const variables = r.gastosAnuales - fijos;
  const vacancia = r.alquilerAnual - r.alquilerAnualEfectivo;
  const neto = r.alquilerAnualEfectivo - r.gastosAnuales;
  el.innerHTML = `
    <div class="res-cabecera">
      ${kpiPrincipal("Rentabilidad neta", seguro(r.netaPct, formatearPct), claseSemaforo(r.netaPct, 6, 4))}
      ${kpi("Rentabilidad bruta", seguro(r.brutaPct, formatearPct), claseSemaforo(r.brutaPct, 7, 5))}
    </div>
    <p class="interpretacion">${frase(r.netaPct, interpretarNeta)}</p>
    ${barraReparto("Reparto del alquiler anual", [
      { etiqueta: "Te queda (neto)", valor: neto, clase: "seg-1" },
      { etiqueta: "IBI, comunidad y seguros", valor: fijos, clase: "seg-2" },
      { etiqueta: "Mantenimiento y gestión", valor: variables, clase: "seg-3" },
      { etiqueta: "Vacancia", valor: vacancia, clase: "seg-4" },
    ])}
    <dl class="desglose">
      <div><dt>Coste total de la operación</dt><dd>${seguro(r.costeTotal, formatearEuros)}</dd></div>
      <div><dt>Impuestos de compra</dt><dd>${seguro(r.impuestos, formatearEuros)}</dd></div>
      <div><dt>Alquiler anual</dt><dd>${seguro(r.alquilerAnual, formatearEuros)}</dd></div>
      <div><dt>Alquiler efectivo (tras vacancia)</dt><dd>${seguro(r.alquilerAnualEfectivo, formatearEuros)}</dd></div>
      <div><dt>Gastos anuales</dt><dd>${seguro(r.gastosAnuales, formatearEuros)}</dd></div>
    </dl>
    <p class="interpretacion secundaria">${frase(r.brutaPct, interpretarBruta)}</p>
  `;
}

function renderTablaPorAnio(tabla: FilaAmortizacion[]): string {
  if (tabla.length === 0) return "<p>—</p>";
  const filas = tabla
    .map((f) => `<tr><td>${f.anio}</td><td>${seguro(f.capitalPendiente, formatearEuros)}</td></tr>`)
    .join("");
  return `<div class="tabla-scroll"><table><thead><tr><th scope="col">Año</th><th scope="col">Capital pendiente</th></tr></thead><tbody>${filas}</tbody></table></div>`;
}

function renderHipoteca(r: ResultadoHipoteca, estado: Record<Campo, number>): void {
  const el = document.getElementById("res-hipoteca");
  if (!el) return;
  const totalPagado = Number.isFinite(r.interesesTotales) ? estado.importe + r.interesesTotales : NaN;
  el.innerHTML = `
    <div class="res-cabecera">
      ${kpiPrincipal("Cuota mensual", seguro(r.cuotaMensual, formatearEuros), "kpi-neutro")}
      ${kpi("Intereses totales", seguro(r.interesesTotales, formatearEuros), "kpi-neutro")}
    </div>
    ${barraReparto("Lo que devuelves al banco", [
      { etiqueta: "Capital prestado", valor: estado.importe, clase: "seg-2" },
      { etiqueta: "Intereses", valor: r.interesesTotales, clase: "seg-4" },
    ])}
    ${curvaAmortizacion(estado.importe, r.tablaPorAnio)}
    <dl class="desglose">
      <div><dt>Total a devolver</dt><dd>${seguro(totalPagado, formatearEuros)}</dd></div>
    </dl>
    <details class="amortizacion"><summary>Ver capital pendiente año a año</summary>${renderTablaPorAnio(r.tablaPorAnio)}</details>
  `;
}

function renderCashflow(r: ResultadoCashflow, rent: ResultadoRentabilidad): void {
  const el = document.getElementById("res-cashflow");
  if (!el) return;
  const textosCash = { "kpi-bien": "Positivo", "kpi-regular": "Neutro", "kpi-mal": "Negativo" };
  const alquilerMes = rent.alquilerAnualEfectivo / 12;
  const gastosMes = rent.gastosAnuales / 12;
  el.innerHTML = `
    <div class="res-cabecera">
      ${kpiPrincipal("Cashflow mensual", seguro(r.cashflowMensual, formatearEuros), claseSemaforo(r.cashflowMensual, 1, 0), textosCash)}
      ${kpi("Cash-on-cash", seguro(r.cashOnCashPct, formatearPct), claseSemaforo(r.cashOnCashPct, 8, 4))}
    </div>
    <p class="interpretacion">${frase(r.cashflowMensual, interpretarCashflow)}</p>
    ${barraReparto(
      `A dónde va el alquiler de cada mes (${eurosCortos(alquilerMes)})`,
      [
        { etiqueta: "Te queda", valor: r.cashflowMensual, clase: "seg-1" },
        { etiqueta: "Cuota de la hipoteca", valor: r.cuotaMensual, clase: "seg-2" },
        { etiqueta: "Gastos del piso", valor: gastosMes, clase: "seg-3" },
      ],
    )}
    <dl class="desglose">
      <div><dt>Cuota mensual de la hipoteca</dt><dd>${seguro(r.cuotaMensual, formatearEuros)}</dd></div>
      <div><dt>Capital que aportas</dt><dd>${seguro(r.capitalAportado, formatearEuros)}</dd></div>
      <div><dt>Cashflow anual</dt><dd>${seguro(r.cashflowAnual, formatearEuros)}</dd></div>
    </dl>
    <p class="interpretacion secundaria">${frase(r.cashOnCashPct, interpretarCashOnCash)}</p>
  `;
}

let timerPersistencia: number | undefined;

function actualizar(): void {
  const estado = leerEstadoDesdeInputs();

  const rent = calcularRentabilidad(construirEntradasRentabilidad(estado));
  const cash = calcularCashflow(construirEntradasCashflow(estado));
  renderRentabilidad(rent, estado);
  renderHipoteca(calcularHipoteca(construirEntradasHipoteca(estado)), estado);
  renderCashflow(cash, rent);

  // Barra fija inferior: las 2 cifras que importan, visibles al teclear en movil.
  const sticky = document.getElementById("kpi-sticky");
  const stNeta = document.getElementById("sticky-neta");
  const stCash = document.getElementById("sticky-cashflow");
  if (sticky && stNeta && stCash) {
    sticky.hidden = false;
    stNeta.textContent = `Neta ${seguro(rent.netaPct, formatearPct)}`;
    stNeta.className = claseSemaforo(rent.netaPct, 6, 4);
    stCash.textContent = `Cashflow ${seguro(cash.cashflowMensual, formatearEuros)}/mes`;
    stCash.className = claseSemaforo(cash.cashflowMensual, 1, 0);
  }
  const live = document.getElementById("live-resumen");
  if (live) {
    live.textContent = `Rentabilidad neta ${seguro(rent.netaPct, formatearPct)}, cashflow mensual ${seguro(cash.cashflowMensual, formatearEuros)}`;
  }

  // Persistencia con debounce: replaceState/localStorage en cada tecla molesta a Safari
  // (limite de llamadas) y no aporta nada; el render si es inmediato.
  if (timerPersistencia !== undefined) window.clearTimeout(timerPersistencia);
  timerPersistencia = window.setTimeout(() => {
    guardarEnLocal(CLAVE_LOCAL, estado);
    const query = estadoAUrl(estado);
    history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, 350);
}

function inicializarInputs(): void {
  const estadoInicial = leerEstadoInicial();
  volcarEstadoEnInputs(estadoInicial);

  for (const campo of CAMPOS) {
    const input = document.getElementById(`in-${campo}`);
    if (input instanceof HTMLInputElement) {
      input.addEventListener("input", actualizar);
    }
  }
}

const TABS = [
  { tabId: "tab-rentabilidad", panelId: "panel-rentabilidad" },
  { tabId: "tab-hipoteca", panelId: "panel-hipoteca" },
  { tabId: "tab-cashflow", panelId: "panel-cashflow" },
] as const;

function activarTab(tabId: string): void {
  for (const t of TABS) {
    const tabEl = document.getElementById(t.tabId);
    const panelEl = document.getElementById(t.panelId);
    const activo = t.tabId === tabId;
    if (tabEl) {
      tabEl.setAttribute("aria-selected", String(activo));
      (tabEl as HTMLElement).tabIndex = activo ? 0 : -1;   // roving tabindex del patron tabs
    }
    if (panelEl) {
      if (activo) panelEl.removeAttribute("hidden");
      else panelEl.setAttribute("hidden", "");
    }
  }
}

function inicializarTabs(): void {
  TABS.forEach((t, idx) => {
    const tabEl = document.getElementById(t.tabId);
    if (!tabEl) return;

    tabEl.addEventListener("click", () => activarTab(t.tabId));

    tabEl.addEventListener("keydown", (ev: KeyboardEvent) => {
      let destino: (typeof TABS)[number] | null = null;
      if (ev.key === "ArrowRight") {
        destino = TABS[(idx + 1) % TABS.length];
      } else if (ev.key === "ArrowLeft") {
        destino = TABS[(idx - 1 + TABS.length) % TABS.length];
      } else if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        destino = t;
      }
      if (destino) {
        activarTab(destino.tabId);
        document.getElementById(destino.tabId)?.focus();
      }
    });
  });
}

function inicializarEnlaces(): void {
  const afiliado = document.getElementById("afiliado-hipoteca");
  if (afiliado instanceof HTMLAnchorElement) {
    afiliado.href = AFILIADO_HIPOTECA_URL;
  }

  // Enter en un input de calculo NO debe recargar la pagina (forms sin action).
  document.querySelectorAll("main form").forEach((f) => {
    f.addEventListener("submit", (ev) => ev.preventDefault());
  });

  // Huecos de anuncio sin snippet pegado: ocultos (una caja vacia con borde encima del
  // titulo era lo primero que se veia). Al pegar AdSense apareceran solos.
  document.querySelectorAll(".ad-slot").forEach((slot) => {
    if (!slot.firstElementChild) (slot as HTMLElement).hidden = true;
  });

  const footerLink = document.querySelector("footer a");
  if (footerLink instanceof HTMLAnchorElement) {
    footerLink.href = FOOTER_URL;
  }
}

inicializarInputs();
inicializarTabs();
inicializarEnlaces();
actualizar();

export {};
