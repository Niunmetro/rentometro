export interface EntradasRentabilidad {
  precioCompra: number;
  itpPct: number;
  notariaRegistro: number;
  reforma: number;
  alquilerMensual: number;
  ibiAnual: number;
  comunidadAnual: number;
  segurosAnual: number;
  mantenimientoPct: number;
  vacanciaPct: number;
  gestionPct: number;
}

export interface ResultadoRentabilidad {
  costeTotal: number;
  impuestos: number;
  alquilerAnual: number;
  alquilerAnualEfectivo: number;
  gastosAnuales: number;
  brutaPct: number;
  netaPct: number;
}

export interface EntradasHipoteca {
  importe: number;
  interesAnualPct: number;
  plazoAnios: number;
}

export interface FilaAmortizacion {
  anio: number;
  capitalPendiente: number;
}

export interface ResultadoHipoteca {
  cuotaMensual: number;
  interesesTotales: number;
  tablaPorAnio: FilaAmortizacion[];
}

export interface EntradasCashflow extends EntradasRentabilidad {
  entradaPct: number;
  interesAnualPct: number;
  plazoAnios: number;
}

export interface ResultadoCashflow {
  cuotaMensual: number;
  capitalAportado: number;
  cashflowMensual: number;
  cashflowAnual: number;
  cashOnCashPct: number;
}
