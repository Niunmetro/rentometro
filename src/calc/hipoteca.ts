import type { EntradasHipoteca, ResultadoHipoteca, FilaAmortizacion } from "../types";

export function calcularHipoteca(e: EntradasHipoteca): ResultadoHipoteca {
  const { importe, interesAnualPct } = e;
  // Plazo acotado a 1-60 anos: un typo ("9999999") congelaria la pestana iterando
  // millones de meses y generando una tabla gigante.
  const plazoAnios = Math.min(Math.max(Math.floor(e.plazoAnios) || 1, 1), 60);
  const i = interesAnualPct / 100 / 12;
  const n = plazoAnios * 12;

  const cuotaMensual = i === 0 ? importe / n : (importe * i) / (1 - Math.pow(1 + i, -n));
  const interesesTotales = cuotaMensual * n - importe;

  const tablaPorAnio: FilaAmortizacion[] = [];
  let capitalPendiente = importe;
  for (let anio = 1; anio <= plazoAnios; anio++) {
    for (let mes = 0; mes < 12; mes++) {
      const interesMes = capitalPendiente * i;
      const capitalMes = cuotaMensual - interesMes;
      capitalPendiente -= capitalMes;
    }
    tablaPorAnio.push({ anio, capitalPendiente });
  }

  return { cuotaMensual, interesesTotales, tablaPorAnio };
}
