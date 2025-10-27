/**
 * Servicio para obtener datos de inflación desde base de datos local JSON
 */

import { getInflacionDatabase, calcularIndiceIPC, tieneDatosParaPeriodo } from './inflacionData';

/**
 * Obtiene datos de inflación para un rango de fechas
 */
export async function getInflacionData(
  startDate: Date,
  endDate: Date
): Promise<{ mesInicio: string; mesFin: string; variaciones: number[] }> {
  // Formatear fechas para la búsqueda (YYYY-MM)
  const startMonth = formatYearMonth(startDate);
  const endMonth = formatYearMonth(endDate);

  console.log(`\n📊 Obteniendo datos de inflación (IPC)...`);
  console.log(`   Período: ${startMonth} - ${endMonth}`);

  // Cargar base de datos
  const database = await getInflacionDatabase();

  // Verificar disponibilidad
  const hasData = await tieneDatosParaPeriodo(startMonth, endMonth);
  if (!hasData) {
    console.warn(`⚠️ No hay datos completos para el período ${startMonth} - ${endMonth}`);
    console.warn('   Usando datos disponibles en el rango');
  }

  // Obtener variaciones mensuales del rango
  const variaciones: number[] = [];
  const meses = Object.keys(database)
    .sort()
    .filter(mes => mes >= startMonth && mes <= endMonth);

  for (const mes of meses) {
    variaciones.push(database[mes]);
  }

  console.log(`✓ ${meses.length} meses de datos de inflación obtenidos`);
  console.log(`   Variaciones: ${variaciones.map(v => v.toFixed(1) + '%').join(', ')}`);

  return {
    mesInicio: meses[0] || startMonth,
    mesFin: meses[meses.length - 1] || endMonth,
    variaciones,
  };
}

/**
 * Calcula la inflación acumulada entre dos fechas
 * Retorna el factor de inflación (ej: 0.50 = 50% de inflación)
 */
export async function calcularInflacionAcumulada(
  startDate: Date,
  endDate: Date
): Promise<number> {
  const startMonth = formatYearMonth(startDate);
  const endMonth = formatYearMonth(endDate);

  try {
    const { inflacionAcumulada } = await calcularIndiceIPC(startMonth, endMonth);
    console.log(`💰 Inflación acumulada ${startMonth} → ${endMonth}: ${(inflacionAcumulada * 100).toFixed(2)}%`);
    return inflacionAcumulada;
  } catch (error) {
    console.error('Error calculando inflación acumulada:', error);
    return 0;
  }
}

/**
 * Ajusta una fecha restando N meses (para el delay de publicación de inflación)
 */
export function ajustarFechaPorDelay(date: Date, mesesDelay: number): Date {
  const adjusted = new Date(date);
  adjusted.setMonth(adjusted.getMonth() - mesesDelay);
  return adjusted;
}

function formatYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
