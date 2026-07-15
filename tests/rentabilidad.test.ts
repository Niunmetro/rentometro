import { describe, it, expect } from "vitest";
import { calcularRentabilidad } from "../src/calc/rentabilidad";
import type { EntradasRentabilidad } from "../src/types";

// Formulas congeladas:
// impuestos = precioCompra * itpPct/100
// costeTotal = precioCompra + impuestos + notariaRegistro + reforma
// alquilerAnual = alquilerMensual * 12
// alquilerAnualEfectivo = alquilerAnual * (1 - vacanciaPct/100)
// gastosAnuales = ibiAnual + comunidadAnual + segurosAnual
//                 + alquilerAnual*(mantenimientoPct/100) + alquilerAnual*(gestionPct/100)
// brutaPct = alquilerAnual / costeTotal * 100
// netaPct = (alquilerAnualEfectivo - gastosAnuales) / costeTotal * 100

const canonico: EntradasRentabilidad = {
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
};

describe("calcularRentabilidad", () => {
  it("caso canonico", () => {
    const r = calcularRentabilidad(canonico);
    expect(r.impuestos).toBeCloseTo(9600, 2);
    expect(r.costeTotal).toBeCloseTo(137100, 2);
    expect(r.alquilerAnual).toBeCloseTo(9000, 2);
    expect(r.alquilerAnualEfectivo).toBeCloseTo(9000, 2);
    expect(r.gastosAnuales).toBeCloseTo(1550, 2);
    expect(r.brutaPct).toBeCloseTo(6.56, 2);
    expect(r.netaPct).toBeCloseTo(5.43, 2);
  });

  it("caso borde: vacancia 100%", () => {
    const r = calcularRentabilidad({ ...canonico, vacanciaPct: 100 });
    expect(r.costeTotal).toBeCloseTo(137100, 2);
    expect(r.alquilerAnual).toBeCloseTo(9000, 2);
    expect(r.alquilerAnualEfectivo).toBeCloseTo(0, 2);
    expect(r.gastosAnuales).toBeCloseTo(1550, 2);
    expect(r.brutaPct).toBeCloseTo(6.56, 2);
    expect(r.netaPct).toBeCloseTo(-1.13, 2);
  });
});
