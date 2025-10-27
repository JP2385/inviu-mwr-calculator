/**
 * Servicio para actualizar datos de IPC (Inflación) usando la API de Series de Tiempo de Argentina
 * API oficial del gobierno, datos del INDEC
 */

interface SeriesTimeAPIResponse {
  data: Array<[string, number | null]>; // [fecha, valor]
}

interface IPCHistoricalData {
  lastUpdate: string;
  source: string;
  url: string;
  description: string;
  data: {
    [month: string]: number; // 'YYYY-MM' -> variación mensual %
  };
}

const IPC_DATA_PATH = '/data/inflacion-historica.json';

// API de Series de Tiempo - IPC Nivel General variación mensual
// Serie: 103.1_I2N_2016_M_19 (IPC Nivel General variación % mensual)
const SERIES_API_BASE = 'https://apis.datos.gob.ar/series/api';
const IPC_SERIES_ID = '103.1_I2N_2016_M_19'; // Variación mensual del IPC

/**
 * Obtiene los datos de inflación mensual desde la API de Series de Tiempo
 */
export async function getIPCFromAPI(startDate: string = '2023-01'): Promise<Record<string, number>> {
  try {
    console.log(`📊 Consultando datos de IPC desde ${startDate}...`);

    const url = `${SERIES_API_BASE}/series/?ids=${IPC_SERIES_ID}&start_date=${startDate}&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Error al consultar API de Series de Tiempo`);
    }

    const result: SeriesTimeAPIResponse = await response.json();

    // Convertir datos a formato { 'YYYY-MM': valor }
    const ipcData: Record<string, number> = {};

    result.data.forEach(([fecha, valor]) => {
      if (valor !== null && fecha) {
        // Fecha viene como 'YYYY-MM-DD', extraer 'YYYY-MM'
        const month = fecha.substring(0, 7);
        ipcData[month] = valor;
      }
    });

    console.log(`✓ ${Object.keys(ipcData).length} meses de inflación obtenidos`);

    return ipcData;
  } catch (error) {
    console.error('Error obteniendo datos de IPC:', error);
    throw error;
  }
}

/**
 * Carga los datos históricos de IPC desde el archivo JSON
 */
export async function loadIPCHistoricalJSON(): Promise<IPCHistoricalData> {
  try {
    const response = await fetch(IPC_DATA_PATH);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: No se pudo cargar ${IPC_DATA_PATH}`);
    }

    const data: IPCHistoricalData = await response.json();
    console.log(`✓ Datos históricos de IPC cargados: ${Object.keys(data.data).length} meses`);

    return data;
  } catch (error) {
    console.error('Error cargando datos históricos de IPC:', error);
    throw error;
  }
}

/**
 * Actualiza el archivo JSON con nuevos datos de inflación
 * NOTA: Esta función prepara los datos pero NO puede escribir al filesystem desde el navegador.
 * Debe ser llamada desde un endpoint backend o un script de Node.js
 */
export function prepareIPCUpdate(
  historicalData: IPCHistoricalData,
  newData: Record<string, number>
): IPCHistoricalData {
  let addedCount = 0;
  let updatedCount = 0;

  Object.entries(newData).forEach(([month, value]) => {
    if (month in historicalData.data) {
      if (historicalData.data[month] !== value) {
        historicalData.data[month] = value;
        updatedCount++;
        console.log(`📝 Actualizado IPC ${month}: ${value}%`);
      }
    } else {
      historicalData.data[month] = value;
      addedCount++;
      console.log(`➕ Agregado nuevo IPC ${month}: ${value}%`);
    }
  });

  historicalData.lastUpdate = new Date().toISOString();

  console.log(`✓ Total: ${addedCount} nuevos, ${updatedCount} actualizados`);

  return historicalData;
}

/**
 * Obtiene el último mes con datos disponibles
 */
export function getLatestMonth(data: IPCHistoricalData): string {
  const months = Object.keys(data.data).sort();
  return months[months.length - 1];
}

/**
 * Verifica si hay datos disponibles para un período específico
 */
export function hasDataForPeriod(
  data: IPCHistoricalData,
  startMonth: string,
  endMonth: string
): boolean {
  const availableMonths = Object.keys(data.data);
  return availableMonths.includes(startMonth) && availableMonths.includes(endMonth);
}

/**
 * Calcula la inflación acumulada entre dos meses
 */
export function calculateAccumulatedInflation(
  data: IPCHistoricalData,
  startMonth: string,
  endMonth: string
): number {
  const months = Object.keys(data.data).sort();

  const startIndex = months.indexOf(startMonth);
  const endIndex = months.indexOf(endMonth);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Datos de inflación no disponibles para el período ${startMonth} - ${endMonth}`);
  }

  // Calcular inflación compuesta: (1 + var1/100) * (1 + var2/100) * ... - 1
  let accumulated = 1;

  for (let i = startIndex; i <= endIndex; i++) {
    const month = months[i];
    const variation = data.data[month];
    accumulated *= (1 + variation / 100);
  }

  return accumulated - 1;
}

/**
 * Función de utilidad para descargar el JSON actualizado
 * (útil para desarrollo, permite al usuario descargar manualmente)
 */
export function downloadUpdatedIPCData(data: IPCHistoricalData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `inflacion-historica-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✓ Archivo JSON descargado');
}
