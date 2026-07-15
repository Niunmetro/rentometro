// @ts-nocheck: sin @types/node en el proyecto; los modulos node:fs/node:path y __dirname son validos en tiempo de ejecucion (vitest/esbuild) aunque tsc no los tipe.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf-8");

describe("index.html", () => {
  it("contiene los huecos de anuncio", () => {
    expect(html).toContain('id="ad-top"');
    expect(html).toContain('id="ad-bottom"');
  });

  it("contiene el enlace de afiliación con rel=sponsored", () => {
    expect(html).toContain('id="afiliado-hipoteca"');
    expect(html).toContain('rel="sponsored"');
  });

  it("contiene el formulario de captura de email", () => {
    expect(html).toContain('id="form-email"');
  });

  it("contiene JSON-LD FAQPage con al menos 6 preguntas", () => {
    expect(html).toContain("application/ld+json");
    expect(html).toContain("FAQPage");
    const matches = html.match(/"@type":\s*"Question"/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(6);
  });

  it("contiene canonical y open graph", () => {
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:title"');
  });

  it("contiene la estructura de pestañas accesible", () => {
    expect(html).toContain('role="tablist"');
    const tabMatches = html.match(/role="tab"/g) ?? [];
    expect(tabMatches.length).toBe(3);
  });

  it("contiene todos los ids de input requeridos", () => {
    const ids = [
      "in-precioCompra",
      "in-itpPct",
      "in-notariaRegistro",
      "in-reforma",
      "in-alquilerMensual",
      "in-ibiAnual",
      "in-comunidadAnual",
      "in-segurosAnual",
      "in-mantenimientoPct",
      "in-vacanciaPct",
      "in-gestionPct",
      "in-importe",
      "in-interesAnualPct",
      "in-plazoAnios",
      "in-entradaPct",
    ];
    for (const id of ids) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("mantiene el contrato de app y script de entrada", () => {
    expect(html).toContain('id="app"');
    expect(html).toContain('/src/main.ts');
  });

  it("contiene los contenedores de resultado", () => {
    expect(html).toContain('id="res-rentabilidad"');
    expect(html).toContain('id="res-hipoteca"');
    expect(html).toContain('id="res-cashflow"');
  });
});
