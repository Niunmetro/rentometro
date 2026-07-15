import { describe, it, expect } from "vitest";
import {
  interpretarBruta,
  interpretarNeta,
  interpretarCashflow,
  interpretarCashOnCash,
} from "../src/interpret";

describe("interpretarNeta", () => {
  it("devuelve string no vacío", () => {
    const resultado = interpretarNeta(5);
    expect(resultado).toBeTruthy();
    expect(typeof resultado).toBe("string");
    expect(resultado.length).toBeGreaterThan(0);
  });

  it("menciona riesgo o 4% cuando neta < 4%", () => {
    const resultado = interpretarNeta(3);
    expect(resultado).toMatch(/riesgo|4%/i);
  });

  it("no menciona riesgo cuando neta >= 6%", () => {
    const resultado = interpretarNeta(7);
    expect(resultado).not.toMatch(/riesgo/i);
  });

  it("cambia de mensaje entre umbral < 4% y 4-6%", () => {
    const bajo = interpretarNeta(3);
    const medio = interpretarNeta(5);
    expect(bajo).not.toBe(medio);
  });

  it("cambia de mensaje entre umbral 4-6% y > 6%", () => {
    const medio = interpretarNeta(5);
    const alto = interpretarNeta(7);
    expect(medio).not.toBe(alto);
  });
});

describe("interpretarBruta", () => {
  it("devuelve string no vacío", () => {
    const resultado = interpretarBruta(5);
    expect(resultado).toBeTruthy();
    expect(typeof resultado).toBe("string");
    expect(resultado.length).toBeGreaterThan(0);
  });

  it("cambia de mensaje al cruzar umbrales", () => {
    const muy_baja = interpretarBruta(2);
    const baja = interpretarBruta(4);
    const media = interpretarBruta(6);
    const alta = interpretarBruta(8);

    expect(muy_baja).not.toBe(baja);
    expect(baja).not.toBe(media);
    expect(media).not.toBe(alta);
  });
});

describe("interpretarCashflow", () => {
  it("devuelve string no vacío", () => {
    const resultado = interpretarCashflow(100);
    expect(resultado).toBeTruthy();
    expect(typeof resultado).toBe("string");
    expect(resultado.length).toBeGreaterThan(0);
  });

  it("menciona aportar para cashflow negativo", () => {
    const resultado = interpretarCashflow(-150);
    expect(resultado).toMatch(/aportar/i);
  });

  it("menciona autofinancia para cashflow cero", () => {
    const resultado = interpretarCashflow(0);
    expect(resultado).toMatch(/autofinancia/i);
  });

  it("menciona beneficio para cashflow positivo", () => {
    const resultado = interpretarCashflow(200);
    expect(resultado).toMatch(/beneficio/i);
  });

  it("cambia de mensaje entre negativo y cero", () => {
    const negativo = interpretarCashflow(-50);
    const cero = interpretarCashflow(0);
    expect(negativo).not.toBe(cero);
  });

  it("cambia de mensaje entre cero y positivo", () => {
    const cero = interpretarCashflow(0);
    const positivo = interpretarCashflow(100);
    expect(cero).not.toBe(positivo);
  });
});

describe("interpretarCashOnCash", () => {
  it("devuelve string no vacío", () => {
    const resultado = interpretarCashOnCash(5);
    expect(resultado).toBeTruthy();
    expect(typeof resultado).toBe("string");
    expect(resultado.length).toBeGreaterThan(0);
  });

  it("menciona pierdes para cashoncash negativo", () => {
    const resultado = interpretarCashOnCash(-5);
    expect(resultado).toMatch(/pierdes/i);
  });

  it("menciona tibio para cashoncash bajo (< 8%)", () => {
    const resultado = interpretarCashOnCash(5);
    expect(resultado).toMatch(/tibio/i);
  });

  it("menciona atractivo para cashoncash alto (>= 8%)", () => {
    const resultado = interpretarCashOnCash(10);
    expect(resultado).toMatch(/atractivo/i);
  });

  it("cambia de mensaje entre negativo y bajo", () => {
    const negativo = interpretarCashOnCash(-5);
    const bajo = interpretarCashOnCash(5);
    expect(negativo).not.toBe(bajo);
  });

  it("cambia de mensaje entre bajo y alto", () => {
    const bajo = interpretarCashOnCash(5);
    const alto = interpretarCashOnCash(10);
    expect(bajo).not.toBe(alto);
  });
});
