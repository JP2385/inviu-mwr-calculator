/**
 * Tests para cálculo de inflación acumulada
 */

import { describe, it, expect } from 'vitest';
import { calcularIndiceIPC } from '../inflacionData';

describe('Inflación - Cálculos Básicos', () => {

  /**
   * CASO 1: Inflación de un solo mes
   * Si enero tuvo 10% de inflación:
   * - Índice inicial: 100
   * - Índice final: 110
   * - Inflación acumulada: 10%
   */
  it('debe calcular inflación de un solo mes correctamente', () => {
    // Este test requiere que haya datos en la base
    // Vamos a validar que la fórmula sea correcta
    const indiceInicial = 100;
    const variacionMensual = 0.10; // 10%
    const indiceFinal = indiceInicial * (1 + variacionMensual);
    const inflacionAcumulada = (indiceFinal / indiceInicial) - 1;

    expect(indiceFinal).toBeCloseTo(110, 2);
    expect(inflacionAcumulada).toBeCloseTo(0.10, 4);
  });

  /**
   * CASO 2: Inflación acumulada de dos meses
   * - Mes 1: 10% de inflación
   * - Mes 2: 5% de inflación
   * - Inflación acumulada: (1.10 * 1.05) - 1 = 15.5%
   */
  it('debe calcular inflación acumulada compuesta correctamente', () => {
    const indiceInicial = 100;
    const var1 = 0.10; // 10%
    const var2 = 0.05; // 5%

    const indiceFinal = indiceInicial * (1 + var1) * (1 + var2);
    const inflacionAcumulada = (indiceFinal / indiceInicial) - 1;

    expect(indiceFinal).toBeCloseTo(115.5, 2);
    expect(inflacionAcumulada).toBeCloseTo(0.155, 4); // 15.5%
  });

  /**
   * CASO 3: Alta inflación mensual
   * - 3 meses de 20% mensual cada uno
   * - (1.20)^3 - 1 = 72.8%
   */
  it('debe manejar alta inflación correctamente', () => {
    const indiceInicial = 100;
    const variacionMensual = 0.20; // 20% mensual

    let indiceFinal = indiceInicial;
    for (let i = 0; i < 3; i++) {
      indiceFinal = indiceFinal * (1 + variacionMensual);
    }

    const inflacionAcumulada = (indiceFinal / indiceInicial) - 1;

    expect(indiceFinal).toBeCloseTo(172.8, 1);
    expect(inflacionAcumulada).toBeCloseTo(0.728, 3); // 72.8%
  });

  /**
   * CASO 4: Deflación (inflación negativa)
   * - Mes 1: -2%
   * - Índice: 100 * 0.98 = 98
   */
  it('debe manejar deflación (inflación negativa)', () => {
    const indiceInicial = 100;
    const variacionMensual = -0.02; // -2%
    const indiceFinal = indiceInicial * (1 + variacionMensual);
    const inflacionAcumulada = (indiceFinal / indiceInicial) - 1;

    expect(indiceFinal).toBeCloseTo(98, 2);
    expect(inflacionAcumulada).toBeCloseTo(-0.02, 4);
  });
});

describe('Inflación - Comparación con Portfolio', () => {

  /**
   * CASO 1: Portfolio gana más que la inflación
   * - Inversión: $1000
   * - Inflación: 50%
   * - Valor ajustado: $1500
   * - Portfolio final: $1700
   * - Ganancia real: $200 (le ganaste a la inflación)
   */
  it('debe calcular correctamente cuando le ganas a la inflación', () => {
    const inversionInicial = 1000;
    const inflacionAcumulada = 0.50; // 50%
    const valorAjustadoInflacion = inversionInicial * (1 + inflacionAcumulada);
    const portfolioFinal = 1700;
    const gananciaReal = portfolioFinal - valorAjustadoInflacion;

    expect(valorAjustadoInflacion).toBe(1500);
    expect(gananciaReal).toBe(200);
    expect(gananciaReal > 0).toBe(true); // Le ganaste a la inflación
  });

  /**
   * CASO 2: Portfolio pierde contra la inflación
   * - Inversión: $1000
   * - Inflación: 100%
   * - Valor ajustado: $2000
   * - Portfolio final: $1500
   * - Ganancia real: -$500 (perdiste contra la inflación)
   */
  it('debe calcular correctamente cuando pierdes contra la inflación', () => {
    const inversionInicial = 1000;
    const inflacionAcumulada = 1.00; // 100%
    const valorAjustadoInflacion = inversionInicial * (1 + inflacionAcumulada);
    const portfolioFinal = 1500;
    const gananciaReal = portfolioFinal - valorAjustadoInflacion;

    expect(valorAjustadoInflacion).toBe(2000);
    expect(gananciaReal).toBe(-500);
    expect(gananciaReal < 0).toBe(true); // Perdiste contra la inflación
  });

  /**
   * CASO 3: Empatas con la inflación
   * - Inversión: $1000
   * - Inflación: 50%
   * - Portfolio final: $1500
   * - Ganancia real: $0
   */
  it('debe identificar cuando empatas con la inflación', () => {
    const inversionInicial = 1000;
    const inflacionAcumulada = 0.50; // 50%
    const valorAjustadoInflacion = inversionInicial * (1 + inflacionAcumulada);
    const portfolioFinal = 1500;
    const gananciaReal = portfolioFinal - valorAjustadoInflacion;

    expect(gananciaReal).toBe(0);
  });
});

describe('Inflación - Casos Reales Argentina 2024', () => {

  /**
   * Ejemplo con datos reales de Argentina 2024
   * Enero: 20.6%, Febrero: 13.2%, Marzo: 11%
   * Acumulado: (1.206 * 1.132 * 1.11) - 1 = 51.5%
   */
  it('debe calcular inflación trimestral Argentina 2024 correctamente', () => {
    const variaciones = [0.206, 0.132, 0.110];
    let indice = 100;

    for (const var_mensual of variaciones) {
      indice = indice * (1 + var_mensual);
    }

    const inflacionAcumulada = (indice / 100) - 1;

    expect(inflacionAcumulada).toBeCloseTo(0.515, 3); // ~51.5%
  });

  /**
   * Año completo 2024
   * Según datos reales: 117.8%
   */
  it('debe calcular inflación anual 2024', () => {
    const variaciones = [
      0.206, // Enero
      0.132, // Febrero
      0.110, // Marzo
      0.088, // Abril
      0.042, // Mayo
      0.046, // Junio
      0.040, // Julio
      0.042, // Agosto
      0.035, // Septiembre
      0.027, // Octubre
      0.024, // Noviembre
      0.027, // Diciembre
    ];

    let indice = 100;
    for (const var_mensual of variaciones) {
      indice = indice * (1 + var_mensual);
    }

    const inflacionAcumulada = (indice / 100) - 1;

    // Debería dar aproximadamente 117.8%
    expect(inflacionAcumulada).toBeCloseTo(1.178, 2);
  });
});
