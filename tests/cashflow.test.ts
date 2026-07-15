import { describe, it, expect } from "vitest";
import { calcularCashflow } from "../src/calc/cashflow";
import type { EntradasCashflow } from "../src/types";

// Formulas congeladas (reutilizan calcularRentabilidad y calcularHipoteca):
// importeHipoteca = precioCompra * (1 - entradaPct/100)
// cuotaMensual = cuota de calcularHipoteca({importe: importeHipoteca, interesAnualPct, plazoAnios})
// capitalAportado = costeTotal - importeHipoteca
// cashflowAnual = alquilerAnualEfectivo - gastosAnuales - cuotaMensual*12
// cashflowMensual = cashflowAnual / 12
// cashOnCashPct = cashflowAnual / capitalAportado * 100

const canonico: EntradasCashflow = {
  precioCompra: 120000,
  itpPct: 8,
  notariaRegistro: 1500,
  reforma: 6000,
  alquilerMensual: 750,
  ibiAnual: 300,
  comunidadAnual: 600,
  segurosAnual: 200,
  mantenimientoPct: 5,
  vacanciaPct: 0,
  gestionPct: 0,
  entradaPct: 20,
  interesAnualPct: 3,
  plazoAnios: 30,
};

describe("calcularCashflow", () => {
  it("caso canonico: entrada 20%, interes 3%, plazo 30 anios", () => {
    const r = calcularCashflow(canonico);
    expect(r.cuotaMensual).toBeCloseTo(404.74, 2);
    expect(r.capitalAportado).toBeCloseTo(41100, 2);
    expect(r.cashflowMensual).toBeCloseTo(216.09, 2);
    expect(r.cashflowAnual).toBeCloseTo(2593.12, 2);
    expect(r.cashOnCashPct).toBeCloseTo(6.31, 2);
  });

  it("caso borde: entrada 100% -> importe hipoteca 0, cuota 0", () => {
    const r = calcularCashflow({ ...canonico, entradaPct: 100 });
    expect(r.cuotaMensual).toBeCloseTo(0, 2);
    expect(r.capitalAportado).toBeCloseTo(137100, 2);
    expect(r.cashflowMensual).toBeCloseTo(620.83, 2);
    expect(r.cashflowAnual).toBeCloseTo(7450, 2);
    expect(r.cashOnCashPct).toBeCloseTo(5.43, 2);
  });
});
