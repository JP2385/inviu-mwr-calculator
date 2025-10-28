/**
 * Cálculo de comparación con inflación
 */

import { getInflacionData, calcularInflacionAcumulada, ajustarFechaPorDelay } from './inflacionAPI';
import type { CashFlow, InflacionComparison } from '../types';

/**
 * Calcula comparación del portfolio vs inflación
 * Aplica 1 mes de delay porque los datos de inflación tienen retraso
 */
export async function calculateInflacionComparison(
  cashflows: CashFlow[],
  portfolioValue: number,
  totalInvertido: number,
  duracionAnios: number
): Promise<InflacionComparison | null> {
  try {
    if (cashflows.length === 0) {
      throw new Error('No hay cashflows para analizar');
    }

    // Ordenar cashflows por fecha
    const sortedCashflows = [...cashflows].sort((a, b) =>
      a.date.getTime() - b.date.getTime()
    );

    const firstDate = sortedCashflows[0].date;
    const lastDate = sortedCashflows[sortedCashflows.length - 1].date;

    // Aplicar 1 mes de delay SOLO al final (datos del último mes no disponibles)
    const adjustedStartDate = firstDate; // NO aplicar delay al inicio
    const adjustedEndDate = ajustarFechaPorDelay(lastDate, 1);

    // Obtener datos de inflación
    const inflacionData = await getInflacionData(adjustedStartDate, adjustedEndDate);

    if (inflacionData.variaciones.length === 0) {
      return null;
    }

    // Calcular inflación acumulada
    const inflacionAcumulada = await calcularInflacionAcumulada(adjustedStartDate, adjustedEndDate);

    // El valor ajustado por inflación es: inversión inicial * (1 + inflación)
    // Esto representa cuánto necesitarías HOY para tener el mismo poder adquisitivo
    const valorAjustadoInflacion = totalInvertido * (1 + inflacionAcumulada);

    // Pérdida de poder adquisitivo
    const perdidaPoderAdquisitivo = valorAjustadoInflacion - totalInvertido;

    // Ganancia real del portfolio descontando inflación
    const gananciaRealVsInflacion = portfolioValue - valorAjustadoInflacion;

    // Rendimiento real (portfolio vs inflación)
    const rendimientoRealVsInflacion = totalInvertido > 0
      ? gananciaRealVsInflacion / totalInvertido
      : 0;

    // Cuánto más ganaste vs solo guardar pesos (perder poder adquisitivo)
    const ventajaVsInflacion = portfolioValue - totalInvertido;

    return {
      inversionInicial: totalInvertido,
      inflacionAcumulada,
      valorAjustadoInflacion,
      perdidaPoderAdquisitivo,
      gananciaRealVsInflacion,
      rendimientoRealVsInflacion,
      ventajaVsInflacion,
      mesesAnalizados: inflacionData.variaciones.length,
      periodoInicio: inflacionData.mesInicio,
      periodoFin: inflacionData.mesFin,
    };

  } catch (error) {
    console.error('Error calculando comparación con inflación:', error);
    return null;
  }
}
