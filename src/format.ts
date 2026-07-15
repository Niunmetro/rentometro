const formatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatearEuros(n: number): string {
  return `${formatter.format(n)} €`;
}

export function formatearPct(n: number): string {
  return `${formatter.format(n)} %`;
}

export function formatearNumero(n: number): string {
  return formatter.format(n);
}
