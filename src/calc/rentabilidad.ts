import type { EntradasRentabilidad, ResultadoRentabilidad } from "../types";

export function calcularRentabilidad(e: EntradasRentabilidad): ResultadoRentabilidad {
  const impuestos = e.precioCompra * (e.itpPct / 100);
  const costeTotal = e.precioCompra + impuestos + e.notariaRegistro + e.reforma;
  const alquilerAnual = e.alquilerMensual * 12;
  const alquilerAnualEfectivo = alquilerAnual * (1 - e.vacanciaPct / 100);
  const gastosAnuales =
    e.ibiAnual +
    e.comunidadAnual +
    e.segurosAnual +
    (e.mantenimientoPct / 100) * alquilerAnual +
    (e.gestionPct / 100) * alquilerAnual;
  const brutaPct = (alquilerAnual / costeTotal) * 100;
  const netaPct = ((alquilerAnualEfectivo - gastosAnuales) / costeTotal) * 100;

  return {
    costeTotal,
    impuestos,
    alquilerAnual,
    alquilerAnualEfectivo,
    gastosAnuales,
    brutaPct,
    netaPct,
  };
}
