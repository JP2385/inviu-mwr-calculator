/**
 * Datos de inflación mensual de Argentina (INDEC)
 * Los datos se cargan desde inflacion-historica.json que se actualiza mensualmente
 * Fuente: https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31
 *
 * Formato: { 'YYYY-MM': variación_mensual_porcentaje }
 */

const IPC_DATA_PATH = '/data/inflacion-historica.json';
const CACHE_KEY = 'ipc_data_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

interface IPCDataFile {
  lastUpdate: string;
  source: string;
  url: string;
  description: string;
  data: Record<string, number>;
}

/**
 * Carga los datos de inflación desde el archivo JSON
 */
async function loadInflacionData(): Promise<Record<string, number>> {
  // Revisar cache primero
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      if (age < CACHE_DURATION) {
        console.log(`✓ Datos de inflación cargados desde caché (${Object.keys(data).length} meses)`);
        return data;
      }
    } catch (error) {
      console.warn(`Error leyendo caché de inflación:`, error);
    }
  }

  console.log(`📊 Cargando datos de inflación desde JSON...`);

  try {
    const response = await fetch(IPC_DATA_PATH);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: No se pudo cargar el archivo de inflación`);
    }

    const fileData: IPCDataFile = await response.json();

    console.log(`✓ ${Object.keys(fileData.data).length} meses de inflación cargados exitosamente`);
    console.log(`   Última actualización: ${new Date(fileData.lastUpdate).toLocaleString('es-AR')}`);

    // Guardar en caché
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: fileData.data,
      timestamp: Date.now()
    }));

    return fileData.data;
  } catch (error) {
    console.error(`Error cargando datos de inflación:`, error);
    throw new Error('No se pudo cargar el archivo de datos de inflación. Asegúrate de que public/data/inflacion-historica.json exista.');
  }
}

// Variable global para almacenar los datos en memoria
let INFLACION_MENSUAL_DATABASE: Record<string, number> | null = null;

/**
 * Obtiene la base de datos de inflación (carga bajo demanda)
 */
async function getInflacionDatabase(): Promise<Record<string, number>> {
  if (!INFLACION_MENSUAL_DATABASE) {
    INFLACION_MENSUAL_DATABASE = await loadInflacionData();
  }
  return INFLACION_MENSUAL_DATABASE;
}

export { getInflacionDatabase };

/**
 * Calcula el índice IPC para un mes específico
 * Base: Diciembre 2016 = 100
 */
export async function calcularIndiceIPC(mesInicio: string, mesFin: string): Promise<{
  indiceInicio: number;
  indiceFin: number;
  inflacionAcumulada: number;
}> {
  const database = await getInflacionDatabase();
  const meses = Object.keys(database).sort();

  // Encontrar índices de inicio y fin
  const indexInicio = meses.indexOf(mesInicio);
  const indexFin = meses.indexOf(mesFin);

  if (indexInicio === -1 || indexFin === -1) {
    throw new Error(`Datos de inflación no disponibles para el período ${mesInicio} - ${mesFin}`);
  }

  // Calcular índice IPC compuesto
  // Fórmula: IPC_final = IPC_inicial * (1 + var1/100) * (1 + var2/100) * ...

  // Para simplificar, usamos un índice base de 100 al inicio del período
  let indiceInicio = 100;
  let indiceFin = indiceInicio;

  // Aplicar inflación de cada mes
  for (let i = indexInicio; i <= indexFin; i++) {
    const mes = meses[i];
    const variacion = database[mes];
    indiceFin = indiceFin * (1 + variacion / 100);
  }

  // Inflación acumulada = (índice_final / índice_inicial) - 1
  const inflacionAcumulada = (indiceFin / indiceInicio) - 1;

  return {
    indiceInicio,
    indiceFin,
    inflacionAcumulada,
  };
}

/**
 * Obtiene la lista de meses con datos disponibles
 */
export async function getMesesDisponibles(): Promise<string[]> {
  const database = await getInflacionDatabase();
  return Object.keys(database).sort();
}

/**
 * Verifica si hay datos disponibles para un período
 */
export async function tieneDatosParaPeriodo(mesInicio: string, mesFin: string): Promise<boolean> {
  const meses = await getMesesDisponibles();
  return meses.includes(mesInicio) && meses.includes(mesFin);
}
