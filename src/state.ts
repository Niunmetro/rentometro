export function estadoAUrl(valores: Record<string, number>): string {
  const params = new URLSearchParams();
  for (const clave of Object.keys(valores)) {
    params.set(clave, String(valores[clave]));
  }
  return params.toString();
}

export function urlAEstado(query: string): Record<string, number> {
  const limpio = query.startsWith("?") ? query.slice(1) : query;
  const params = new URLSearchParams(limpio);
  const estado: Record<string, number> = {};
  for (const [clave, valor] of params.entries()) {
    if (valor === "") continue;
    const n = Number(valor);
    if (Number.isFinite(n)) {
      estado[clave] = n;
    }
  }
  return estado;
}

export function guardarEnLocal(clave: string, valores: Record<string, number>): void {
  globalThis.localStorage.setItem(clave, JSON.stringify(valores));
}

export function cargarDeLocal(clave: string): Record<string, number> | null {
  const raw = globalThis.localStorage.getItem(clave);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return null;
  }
}
