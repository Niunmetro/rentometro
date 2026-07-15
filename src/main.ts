import "./style.css";

import { calcularRentabilidad } from "./calc/rentabilidad";
import { calcularHipoteca } from "./calc/hipoteca";
import { calcularCashflow } from "./calc/cashflow";
import { formatearEuros, formatearPct } from "./format";
import { interpretarBruta, interpretarNeta, interpretarCashflow, interpretarCashOnCash } from "./interpret";
import { estadoAUrl, urlAEstado, guardarEnLocal, cargarDeLocal } from "./state";
import { AFILIADO_HIPOTECA_URL, EMAIL_FORM_ACTION, FOOTER_URL } from "./config";
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
    const valor = input instanceof HTMLInputElement && input.value !== "" ? parseFloat(input.value) : 0;
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

function renderRentabilidad(r: ResultadoRentabilidad): void {
  const el = document.getElementById("res-rentabilidad");
  if (!el) return;
  el.innerHTML = `
    <p>Coste total: ${seguro(r.costeTotal, formatearEuros)}</p>
    <p>Impuestos: ${seguro(r.impuestos, formatearEuros)}</p>
    <p>Alquiler anual: ${seguro(r.alquilerAnual, formatearEuros)}</p>
    <p>Alquiler anual efectivo: ${seguro(r.alquilerAnualEfectivo, formatearEuros)}</p>
    <p>Gastos anuales: ${seguro(r.gastosAnuales, formatearEuros)}</p>
    <p>Rentabilidad bruta: ${seguro(r.brutaPct, formatearPct)}</p>
    <p>${frase(r.brutaPct, interpretarBruta)}</p>
    <p>Rentabilidad neta: ${seguro(r.netaPct, formatearPct)}</p>
    <p>${frase(r.netaPct, interpretarNeta)}</p>
  `;
}

function renderTablaPorAnio(tabla: FilaAmortizacion[]): string {
  if (tabla.length === 0) return "<p>—</p>";
  const filas = tabla
    .map((f) => `<tr><td>${f.anio}</td><td>${seguro(f.capitalPendiente, formatearEuros)}</td></tr>`)
    .join("");
  return `<table><thead><tr><th>Año</th><th>Capital pendiente</th></tr></thead><tbody>${filas}</tbody></table>`;
}

function renderHipoteca(r: ResultadoHipoteca): void {
  const el = document.getElementById("res-hipoteca");
  if (!el) return;
  el.innerHTML = `
    <p>Cuota mensual: ${seguro(r.cuotaMensual, formatearEuros)}</p>
    <p>Intereses totales: ${seguro(r.interesesTotales, formatearEuros)}</p>
    ${renderTablaPorAnio(r.tablaPorAnio)}
  `;
}

function renderCashflow(r: ResultadoCashflow): void {
  const el = document.getElementById("res-cashflow");
  if (!el) return;
  el.innerHTML = `
    <p>Cuota mensual: ${seguro(r.cuotaMensual, formatearEuros)}</p>
    <p>Capital aportado: ${seguro(r.capitalAportado, formatearEuros)}</p>
    <p>Cashflow mensual: ${seguro(r.cashflowMensual, formatearEuros)}</p>
    <p>${frase(r.cashflowMensual, interpretarCashflow)}</p>
    <p>Cashflow anual: ${seguro(r.cashflowAnual, formatearEuros)}</p>
    <p>Cash-on-cash: ${seguro(r.cashOnCashPct, formatearPct)}</p>
    <p>${frase(r.cashOnCashPct, interpretarCashOnCash)}</p>
  `;
}

function actualizar(): void {
  const estado = leerEstadoDesdeInputs();

  renderRentabilidad(calcularRentabilidad(construirEntradasRentabilidad(estado)));
  renderHipoteca(calcularHipoteca(construirEntradasHipoteca(estado)));
  renderCashflow(calcularCashflow(construirEntradasCashflow(estado)));

  guardarEnLocal(CLAVE_LOCAL, estado);
  const query = estadoAUrl(estado);
  history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
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
    if (tabEl) tabEl.setAttribute("aria-selected", String(activo));
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

  const formEmail = document.getElementById("form-email");
  if (formEmail instanceof HTMLFormElement) {
    formEmail.action = EMAIL_FORM_ACTION;
  }

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
