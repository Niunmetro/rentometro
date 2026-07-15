import { describe, it, expect, beforeEach } from "vitest";
import { estadoAUrl, urlAEstado, guardarEnLocal, cargarDeLocal } from "../src/state";

describe("estadoAUrl / urlAEstado", () => {
  it("hace round-trip para un objeto de ejemplo", () => {
    const original = { precio: 150000, alquiler: 800, gastos: 12.5 };
    expect(urlAEstado(estadoAUrl(original))).toEqual(original);
  });

  it("urlAEstado acepta query con o sin '?' inicial", () => {
    const query = estadoAUrl({ a: 1, b: 2 });
    expect(urlAEstado(query)).toEqual({ a: 1, b: 2 });
    expect(urlAEstado(`?${query}`)).toEqual({ a: 1, b: 2 });
  });

  it("urlAEstado ignora claves cuyo valor no es numero finito", () => {
    const estado = urlAEstado("valido=42&basura=hola&vacio=&infinito=Infinity");
    expect(estado).toEqual({ valido: 42 });
  });
});

describe("guardarEnLocal / cargarDeLocal", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (clave: string) => (store.has(clave) ? store.get(clave)! : null),
      setItem: (clave: string, valor: string) => {
        store.set(clave, valor);
      },
    };
  });

  it("guarda y recupera el mismo estado", () => {
    const valores = { precio: 150000, alquiler: 800 };
    guardarEnLocal("rentometro", valores);
    expect(cargarDeLocal("rentometro")).toEqual(valores);
  });

  it("devuelve null si la clave no existe", () => {
    expect(cargarDeLocal("inexistente")).toBeNull();
  });

  it("devuelve null si el contenido no parsea", () => {
    globalThis.localStorage.setItem("roto", "{no es json");
    expect(cargarDeLocal("roto")).toBeNull();
  });
});
