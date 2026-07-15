import { describe, it, expect } from "vitest";
import { calcularHipoteca } from "../src/calc/hipoteca";

// Formulas congeladas (sistema frances de amortizacion):
// n = plazoAnios * 12
// i = interesAnualPct/100/12 (tasa mensual)
// cuotaMensual = importe * i / (1 - (1+i)^-n)   si i != 0
// cuotaMensual = importe / n                     si i == 0
// interesesTotales = cuotaMensual*n - importe
// tablaPorAnio[k].capitalPendiente = saldo pendiente al finalizar el anio k
//   (amortizando mes a mes: interesMes = saldo*i; capitalMes = cuota - interesMes; saldo -= capitalMes)

describe("calcularHipoteca", () => {
  it("caso canonico: importe 96000, interes 3%, plazo 30 anios", () => {
    const r = calcularHipoteca({ importe: 96000, interesAnualPct: 3, plazoAnios: 30 });
    expect(r.cuotaMensual).toBeCloseTo(404.74, 2);
    expect(r.interesesTotales).toBeCloseTo(49706.35, 2);
    expect(r.tablaPorAnio).toHaveLength(30);
    expect(r.tablaPorAnio[0].anio).toBe(1);
    expect(r.tablaPorAnio[0].capitalPendiente).toBeCloseTo(93995.71, 2);
    expect(r.tablaPorAnio[29].anio).toBe(30);
    expect(r.tablaPorAnio[29].capitalPendiente).toBeCloseTo(0, 2);
  });

  it("caso borde: interes 0%", () => {
    const r = calcularHipoteca({ importe: 100000, interesAnualPct: 0, plazoAnios: 10 });
    expect(r.cuotaMensual).toBeCloseTo(833.33, 2);
    expect(r.interesesTotales).toBeCloseTo(0, 2);
    expect(r.tablaPorAnio).toHaveLength(10);
    expect(r.tablaPorAnio[0].capitalPendiente).toBeCloseTo(90000, 2);
    expect(r.tablaPorAnio[9].capitalPendiente).toBeCloseTo(0, 2);
  });

  it("caso borde: importe 0 (entrada 100%) -> cuota 0", () => {
    const r = calcularHipoteca({ importe: 0, interesAnualPct: 3, plazoAnios: 20 });
    expect(r.cuotaMensual).toBeCloseTo(0, 2);
    expect(r.interesesTotales).toBeCloseTo(0, 2);
    expect(r.tablaPorAnio).toHaveLength(20);
    expect(r.tablaPorAnio[0].capitalPendiente).toBeCloseTo(0, 2);
  });
});
