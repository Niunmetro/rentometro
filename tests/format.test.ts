import { describe, it, expect } from "vitest";
import { formatearEuros, formatearPct, formatearNumero } from "../src/format";

// Formato congelado: separador decimal coma, 2 decimales fijos, sin separador de miles,
// sufijo " €" para euros y " %" para porcentajes.

describe("formatearNumero", () => {
  it("formatea con coma decimal y 2 decimales", () => {
    expect(formatearNumero(1234.5)).toBe("1.234,50");
  });

  it("formatea negativos y cero", () => {
    expect(formatearNumero(-42)).toBe("-42,00");
    expect(formatearNumero(0)).toBe("0,00");
  });
});

describe("formatearEuros", () => {
  it("añade el sufijo de euros", () => {
    expect(formatearEuros(1500)).toBe("1.500,00 €");
    expect(formatearEuros(0)).toBe("0,00 €");
  });
});

describe("formatearPct", () => {
  it("añade el sufijo de porcentaje", () => {
    expect(formatearPct(6.5)).toBe("6,50 %");
    expect(formatearPct(-3.25)).toBe("-3,25 %");
  });
});
