/**
 * Servicio para actualizar datos de MEP usando DolarAPI.com
 * API pública y gratuita, sin autenticación requerida
 */

interface DolarAPIResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface MEPHistoricalData {
  lastUpdate: string;
  recordCount: number;
  data: {
    [date: string]: number; // 'YYYY-MM-DD' -> valor MEP
  };
}

const MEP_DATA_PATH = '/data/mep-historico.json';
const DOLARAPI_URL = 'https://dolarapi.com/v1/dolares/bolsa';

/**
 * Obtiene la cotización actual del dólar MEP desde DolarAPI
 */
export async function getCurrentMEP(): Promise<{ venta: number; fecha: string }> {
  try {
    console.log('📊 Consultando cotización actual de MEP...');

    const response = await fetch(DOLARAPI_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Error al consultar DolarAPI`);
    }

    const data: DolarAPIResponse = await response.json();

    console.log(`✓ MEP actual: $${data.venta} (${data.fechaActualizacion})`);

    return {
      venta: data.venta,
      fecha: data.fechaActualizacion
    };
  } catch (error) {
    console.error('Error obteniendo MEP actual:', error);
    throw error;
  }
}

/**
 * Carga los datos históricos de MEP desde el archivo JSON
 */
export async function loadMEPHistoricalJSON(): Promise<MEPHistoricalData> {
  try {
    const response = await fetch(MEP_DATA_PATH);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: No se pudo cargar ${MEP_DATA_PATH}`);
    }

    const data: MEPHistoricalData = await response.json();
    console.log(`✓ Datos históricos cargados: ${data.recordCount} registros`);

    return data;
  } catch (error) {
    console.error('Error cargando datos históricos de MEP:', error);
    throw error;
  }
}

/**
 * Actualiza el archivo JSON con la nueva cotización MEP
 * NOTA: Esta función prepara los datos pero NO puede escribir al filesystem desde el navegador.
 * Debe ser llamada desde un endpoint backend o un script de Node.js
 */
export function prepareMEPUpdate(
  historicalData: MEPHistoricalData,
  newValue: number,
  date: string
): MEPHistoricalData {
  const dateKey = date.split('T')[0]; // Extraer solo YYYY-MM-DD

  // Si ya existe el dato para ese día, actualizarlo
  const isUpdate = dateKey in historicalData.data;

  historicalData.data[dateKey] = newValue;

  if (!isUpdate) {
    historicalData.recordCount++;
  }

  historicalData.lastUpdate = new Date().toISOString();

  console.log(
    isUpdate
      ? `📝 Actualizado MEP para ${dateKey}: $${newValue}`
      : `➕ Agregado nuevo registro MEP para ${dateKey}: $${newValue}`
  );

  return historicalData;
}

/**
 * Obtiene la cotización MEP para una fecha específica
 * Usa forward-fill si no hay dato exacto (fines de semana/feriados)
 */
export function getMEPForDate(
  date: Date,
  historicalData: MEPHistoricalData
): number | null {
  const dateKey = formatDate(date);

  // Si tenemos el dato exacto, devolverlo
  if (historicalData.data[dateKey]) {
    return historicalData.data[dateKey];
  }

  // Si no hay dato exacto, buscar el más cercano hacia atrás
  const sortedDates = Object.keys(historicalData.data).sort();
  let closestDate: string | null = null;

  for (const d of sortedDates) {
    if (d <= dateKey) {
      closestDate = d;
    } else {
      break;
    }
  }

  if (closestDate) {
    return historicalData.data[closestDate];
  }

  // Si la fecha es anterior a todos los datos, usar el primer valor disponible
  if (sortedDates.length > 0 && dateKey < sortedDates[0]) {
    return historicalData.data[sortedDates[0]];
  }

  return null;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Función de utilidad para descargar el JSON actualizado
 * (útil para desarrollo, permite al usuario descargar manualmente)
 */
export function downloadUpdatedMEPData(data: MEPHistoricalData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `mep-historico-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✓ Archivo JSON descargado');
}
