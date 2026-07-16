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
  // localStorage puede LANZAR con cookies/almacenamiento bloqueados (modo privado,
  // ajustes de Chrome) o cuota llena: guardar es opcional, nunca debe romper la app.
  try {
    globalThis.localStorage.setItem(clave, JSON.stringify(valores));
  } catch {
    /* sin almacenamiento: se sigue sin persistir */
  }
}

export function cargarDeLocal(clave: string): Record<string, number> | null {
  // El ACCESO a localStorage tambien puede lanzar (almacenamiento bloqueado).
  try {
    const raw = globalThis.localStorage.getItem(clave);
    if (raw === null) return null;
    const datos: unknown = JSON.parse(raw);
    // Validar la forma: un '[]', '42' o valores no numericos guardados a mano no son estado.
    if (typeof datos !== "object" || datos === null || Array.isArray(datos)) return null;
    const estado: Record<string, number> = {};
    for (const [k, v] of Object.entries(datos)) {
      if (typeof v === "number" && Number.isFinite(v)) estado[k] = v;
    }
    return estado;
  } catch {
    return null;
  }
}
