import { describe, it, expect } from "vitest";

// Test de humo del andamiaje: el run de Forja añade los tests reales de cada calculadora.
describe("andamiaje", () => {
  it("vitest funciona", () => {
    expect(1 + 1).toBe(2);
  });
});
