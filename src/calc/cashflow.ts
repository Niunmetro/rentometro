import type { EntradasCashflow, ResultadoCashflow } from "../types";
import { calcularRentabilidad } from "./rentabilidad";
import { calcularHipoteca } from "./hipoteca";

export function calcularCashflow(e: EntradasCashflow): ResultadoCashflow {
  const { impuestos, alquilerAnualEfectivo, gastosAnuales } = calcularRentabilidad(e);

  const entrada = e.precioCompra * (e.entradaPct / 100);
  const importeHipoteca = e.precioCompra - entrada;
  const cuotaMensual =
    importeHipoteca <= 0
      ? 0
      : calcularHipoteca({
          importe: importeHipoteca,
          interesAnualPct: e.interesAnualPct,
          plazoAnios: e.plazoAnios,
        }).cuotaMensual;

  const gastosMensuales = gastosAnuales / 12;
  const alquilerEfectivoMensual = alquilerAnualEfectivo / 12;
  const cashflowMensual = alquilerEfectivoMensual - gastosMensuales - cuotaMensual;
  const cashflowAnual = cashflowMensual * 12;

  const capitalAportado = entrada + impuestos + e.notariaRegistro + e.reforma;
  const cashOnCashPct = (cashflowAnual / capitalAportado) * 100;

  return {
    cuotaMensual,
    capitalAportado,
    cashflowMensual,
    cashflowAnual,
    cashOnCashPct,
  };
}
