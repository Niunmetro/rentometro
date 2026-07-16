export function interpretarBruta(pct: number): string {
  if (pct < 3) {
    return "Rentabilidad bruta baja. Considera revisar el precio de compra o el alquiler.";
  }
  if (pct < 5) {
    return "Rentabilidad bruta modesta. Puede funcionar con bajo riesgo.";
  }
  if (pct < 7) {
    return "Rentabilidad bruta aceptable. Buena oportunidad.";
  }
  return "Rentabilidad bruta excelente. Inversión muy atractiva.";
}

export function interpretarNeta(pct: number): string {
  if (pct < 4) {
    return "Una neta por debajo del 4% suele no compensar el riesgo. Considera si los gastos pueden reducirse.";
  }
  if (pct < 6) {
    return "Rentabilidad neta aceptable. Cubre gastos y aporta un rendimiento razonable.";
  }
  return "Rentabilidad neta buena. Inversión sólida con margen de seguridad.";
}

export function interpretarCashflow(mensual: number): string {
  if (mensual < 0) {
    return `Necesitas aportar ${Math.abs(mensual).toFixed(2)}€ cada mes para cubrir gastos. El inmueble consume dinero.`;
  }
  if (mensual === 0) {
    return "El inmueble se autofinancia. No hay ganancia neta mensual pero tampoco pérdida.";
  }
  return `Generarás ${mensual.toFixed(2)}€ mensuales de beneficio neto. El inmueble se autofinancia y genera rendimiento.`;
}

export function interpretarCashOnCash(pct: number): string {
  if (pct < 0) {
    return `Pierdes un ${Math.abs(pct).toFixed(2)}% sobre lo que aportaste inicialmente cada año. Evalúa si te compensa.`;
  }
  if (pct < 8) {
    return `Un ${pct.toFixed(2)}% anual sobre lo aportado. Rendimiento tibio: por debajo del 8% suele no compensar el riesgo.`;
  }
  return `Un ${pct.toFixed(2)}% anual sobre lo aportado. Rendimiento atractivo y competitivo en el mercado actual.`;
}
