/**
 * Servicio para obtener datos históricos de MEP desde archivo JSON
 * Los datos se actualizan diariamente mediante scripts automáticos
 */

const CACHE_PREFIX = 'mep_historical_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const MEP_DATA_PATH = '/data/mep-historico.json';

interface MEPHistoricalData {
  [date: string]: number; // formato 'YYYY-MM-DD' -> valor MEP
}

interface MEPDataFile {
  lastUpdate: string;
  recordCount: number;
  data: MEPHistoricalData;
}


/**
 * Lee el archivo mep-historico.json con los datos actualizados
 */
async function loadMEPJSONFile(): Promise<MEPHistoricalData> {
  const cacheKey = `${CACHE_PREFIX}json_data`;

  // Revisar cache primero
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < CACHE_DURATION) {
        console.log(`✓ Datos MEP históricos cargados desde caché (${Object.keys(data).length} registros)`);
        return data;
      }
    } catch (error) {
      console.warn(`Error leyendo caché:`, error);
    }
  }

  console.log(`📊 Cargando datos históricos de MEP desde JSON...`);

  try {
    // Fetch el archivo JSON desde public/data/
    const response = await fetch(MEP_DATA_PATH);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: No se pudo cargar el archivo MEP histórico`);
    }

    const fileData: MEPDataFile = await response.json();

    console.log(`✓ ${fileData.recordCount} cotizaciones históricas de MEP cargadas exitosamente`);
    console.log(`   Última actualización: ${new Date(fileData.lastUpdate).toLocaleString('es-AR')}`);

    // Guardar en caché
    localStorage.setItem(cacheKey, JSON.stringify({
      data: fileData.data,
      timestamp: Date.now()
    }));

    return fileData.data;

  } catch (error) {
    console.error(`Error cargando datos históricos de MEP:`, error);
    throw new Error('No se pudo cargar el archivo de datos históricos de MEP. Asegúrate de que public/data/mep-historico.json exista.');
  }
}

/**
 * Obtiene todas las cotizaciones MEP para un rango de fechas
 */
export async function getMEPHistoricalData(
  startDate: Date,
  endDate: Date
): Promise<MEPHistoricalData> {
  console.log(`\n📊 Obteniendo datos históricos de MEP...`);
  console.log(`   Período: ${startDate.toLocaleDateString('es-AR')} - ${endDate.toLocaleDateString('es-AR')}`);

  // Cargar todos los datos del JSON
  const allData = await loadMEPJSONFile();

  // Filtrar solo las fechas en el rango solicitado
  const filteredData: MEPHistoricalData = {};
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  Object.keys(allData).forEach(dateKey => {
    if (dateKey >= startStr && dateKey <= endStr) {
      filteredData[dateKey] = allData[dateKey];
    }
  });

  console.log(`✓ ${Object.keys(filteredData).length} cotizaciones en el período solicitado`);

  return filteredData;
}

/**
 * Obtiene la cotización MEP para una fecha específica
 * Usa la última cotización conocida si no hay dato exacto (método forward-fill)
 */
export function getMEPForDate(
  date: Date,
  historicalData: MEPHistoricalData
): number | null {
  const dateKey = formatDate(date);

  // Si tenemos el dato exacto, devolverlo
  if (historicalData[dateKey]) {
    return historicalData[dateKey];
  }

  // Si no hay dato exacto, buscar el más cercano hacia atrás (última cotización conocida)
  // Esto tiene sentido porque el MEP no cotiza fines de semana ni feriados
  const sortedDates = Object.keys(historicalData).sort();
  let closestDate: string | null = null;

  for (const d of sortedDates) {
    if (d <= dateKey) {
      closestDate = d;
    } else {
      break;
    }
  }

  if (closestDate) {
    return historicalData[closestDate];
  }

  // Si la fecha es anterior a todos los datos, usar el primer valor disponible
  if (sortedDates.length > 0 && dateKey < sortedDates[0]) {
    return historicalData[sortedDates[0]];
  }

  return null;
}

/**
 * Limpia el caché de datos históricos
 */
export function clearMEPCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  console.log('✓ Caché de datos históricos limpiado');
}

// Helper
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
