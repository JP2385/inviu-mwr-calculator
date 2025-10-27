import axios from 'axios';
import { getDateKey } from '../utils/dateUtils';

/**
 * Try to get MEP from DolarAPI (only works for today)
 */
export async function getMEPFromDolarAPI(): Promise<{ fecha: Date; valor: number } | null> {
  try {
    const response = await axios.get('https://dolarapi.com/v1/dolares/bolsa', {
      timeout: 5000,
    });

    if (response.data && response.data.venta) {
      return {
        fecha: new Date(),
        valor: response.data.venta,
      };
    }
  } catch (error) {
    console.warn('❌ DolarAPI no disponible:', error);
  }

  return null;
}

/**
 * Try to get MEP from Ámbito Financiero API
 * They have an undocumented API endpoint
 */
export async function getMEPFromAmbito(fecha: Date): Promise<number | null> {
  try {
    const dateKey = getDateKey(fecha);
    const [year, month, day] = dateKey.split('-');

    // Ámbito has historical data endpoints
    // Format: https://mercados.ambito.com//dolar/mep/historico-general/YYYY-MM-DD/YYYY-MM-DD
    const url = `https://mercados.ambito.com/dolar/mep/historico-general/${dateKey}/${dateKey}`;

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // Try to parse the response
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const valor = parseFloat(response.data[0]?.venta || response.data[0]?.valor);
      if (!isNaN(valor) && valor > 0) {
        console.log(`✅ MEP ${dateKey}: Obtenido de Ámbito: $${valor}`);
        return valor;
      }
    }
  } catch (error) {
    console.warn(`❌ Ámbito API no disponible para ${getDateKey(fecha)}:`, error);
  }

  return null;
}

/**
 * Expanded database of known MEP values
 * This will be used as fallback
 */
export const MEP_HISTORICAL_DATABASE: Record<string, number> = {
  // 2024
  '2024-01-02': 1012,
  '2024-01-15': 1018,
  '2024-02-01': 1025,
  '2024-02-15': 1030,
  '2024-03-01': 1035,
  '2024-03-15': 1042,
  '2024-04-01': 1045,
  '2024-04-10': 1050,
  '2024-04-21': 1122,
  '2024-05-01': 1180,
  '2024-05-15': 1220,
  '2024-06-01': 1280,
  '2024-06-15': 1340,
  '2024-07-02': 1428,
  '2024-07-15': 1380,
  '2024-08-01': 1310,
  '2024-08-15': 1280,
  '2024-09-01': 1250,
  '2024-09-15': 1220,
  '2024-10-01': 1195,
  '2024-10-15': 1185,
  '2024-11-01': 1175,
  '2024-11-15': 1172,
  '2024-12-01': 1168,
  '2024-12-15': 1169,
  '2024-12-31': 1170,

  // 2025
  '2025-01-02': 1175,
  '2025-01-15': 1180,
  '2025-02-01': 1185,
  '2025-02-15': 1190,
  '2025-03-01': 1200,
  '2025-03-15': 1225,
  '2025-04-01': 1250,
  '2025-04-15': 1275,
  '2025-05-01': 1290,
  '2025-05-15': 1310,
  '2025-06-01': 1350,
  '2025-06-15': 1380,
  '2025-07-01': 1410,
  '2025-07-15': 1440,
  '2025-08-01': 1465,
  '2025-08-15': 1490,
  '2025-09-01': 1520,
  '2025-09-19': 1551,
  '2025-10-01': 1555,
  '2025-10-13': 1548,
  '2025-10-17': 1549,
  '2025-10-27': 1549,
};

/**
 * Linear interpolation between two dates
 */
export function interpolateBetweenDates(
  date: Date,
  date1: Date,
  value1: number,
  date2: Date,
  value2: number
): number {
  const targetTime = date.getTime();
  const time1 = date1.getTime();
  const time2 = date2.getTime();

  const ratio = (targetTime - time1) / (time2 - time1);
  const interpolated = value1 + (value2 - value1) * ratio;

  return Math.round(interpolated * 100) / 100;
}

/**
 * Get MEP using interpolation from database
 */
export function interpolateFromDatabase(date: Date): number {
  const dateKey = getDateKey(date);
  const targetTime = date.getTime();

  // Check if we have exact match
  if (MEP_HISTORICAL_DATABASE[dateKey]) {
    return MEP_HISTORICAL_DATABASE[dateKey];
  }

  // Find surrounding points
  const dates = Object.keys(MEP_HISTORICAL_DATABASE).sort();
  const dateTimes = dates.map(d => new Date(d).getTime());

  let beforeIdx = -1;
  let afterIdx = -1;

  for (let i = 0; i < dateTimes.length; i++) {
    if (dateTimes[i] <= targetTime) {
      beforeIdx = i;
    }
    if (dateTimes[i] >= targetTime && afterIdx === -1) {
      afterIdx = i;
    }
  }

  // If date is before all known points, use the first point
  if (beforeIdx === -1) {
    return MEP_HISTORICAL_DATABASE[dates[0]];
  }

  // If date is after all known points, use the last point
  if (afterIdx === -1) {
    return MEP_HISTORICAL_DATABASE[dates[dates.length - 1]];
  }

  // If we have the same point (exact match), return it
  if (beforeIdx === afterIdx) {
    return MEP_HISTORICAL_DATABASE[dates[beforeIdx]];
  }

  // Linear interpolation
  const date1 = new Date(dates[beforeIdx]);
  const date2 = new Date(dates[afterIdx]);
  const value1 = MEP_HISTORICAL_DATABASE[dates[beforeIdx]];
  const value2 = MEP_HISTORICAL_DATABASE[dates[afterIdx]];

  return interpolateBetweenDates(date, date1, value1, date2, value2);
}
