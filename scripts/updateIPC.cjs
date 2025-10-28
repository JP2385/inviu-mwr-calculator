/**
 * Script para actualizar datos de inflación (IPC) desde INDEC
 * Ejecutar mensualmente el día 20 a las 18:00 UTC-3
 *
 * Uso: node scripts/updateIPC.js
 */

const fs = require('fs');
const path = require('path');

const IPC_DATA_PATH = path.join(__dirname, '..', 'public', 'data', 'inflacion-historica.json');
const SERIES_API_BASE = 'https://apis.datos.gob.ar/series/api';
const IPC_SERIES_ID = '103.1_I2N_2016_M_19'; // Variación mensual del IPC

async function updateIPC() {
  try {
    console.log('🚀 Iniciando actualización de IPC...');
    console.log(`📅 ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`);

    // 1. Leer archivo JSON existente
    console.log('\n📂 Leyendo archivo histórico...');
    let historicalData;

    if (fs.existsSync(IPC_DATA_PATH)) {
      const fileContent = fs.readFileSync(IPC_DATA_PATH, 'utf-8');
      historicalData = JSON.parse(fileContent);
      const months = Object.keys(historicalData.data).sort();
      console.log(`✓ Archivo cargado: ${months.length} meses`);
      console.log(`   Último mes: ${months[months.length - 1]}`);
    } else {
      console.log('⚠️  Archivo no existe, creando nuevo...');
      historicalData = {
        lastUpdate: null,
        source: 'INDEC - Instituto Nacional de Estadística y Censos',
        url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
        description: 'Variación mensual del IPC (Índice de Precios al Consumidor) - Nivel General',
        data: {}
      };
    }

    // 2. Obtener últimos 12 meses de IPC desde la API
    const startDate = getStartDate();
    console.log(`\n📊 Consultando API de Series de Tiempo desde ${startDate}...`);

    const url = `${SERIES_API_BASE}/series/?ids=${IPC_SERIES_ID}&start_date=${startDate}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Error al consultar API de Series de Tiempo`);
    }

    const result = await response.json();
    console.log(`✓ Respuesta recibida: ${result.data.length} registros`);

    // 3. Procesar datos
    let addedCount = 0;
    let updatedCount = 0;

    result.data.forEach(([fecha, valor]) => {
      if (valor !== null && fecha) {
        const month = fecha.substring(0, 7); // Extraer YYYY-MM

        if (month in historicalData.data) {
          if (historicalData.data[month] !== valor) {
            historicalData.data[month] = valor;
            updatedCount++;
            console.log(`   📝 Actualizado ${month}: ${valor}%`);
          }
        } else {
          historicalData.data[month] = valor;
          addedCount++;
          console.log(`   ➕ Agregado ${month}: ${valor}%`);
        }
      }
    });

    if (addedCount === 0 && updatedCount === 0) {
      console.log('ℹ️  No hay nuevos datos para actualizar');
      return;
    }

    // 4. Ordenar las fechas cronológicamente (YYYY-MM se ordena alfabéticamente)
    const sortedData = {};
    Object.keys(historicalData.data)
      .sort()
      .forEach(key => {
        sortedData[key] = historicalData.data[key];
      });
    historicalData.data = sortedData;

    // 5. Guardar archivo actualizado
    console.log('\n💾 Guardando archivo actualizado...');
    historicalData.lastUpdate = new Date().toISOString();

    const dir = path.dirname(IPC_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(IPC_DATA_PATH, JSON.stringify(historicalData, null, 2), 'utf-8');

    console.log(`✅ Actualización completada`);
    console.log(`   Nuevos: ${addedCount} meses`);
    console.log(`   Actualizados: ${updatedCount} meses`);
    console.log(`   Total: ${Object.keys(historicalData.data).length} meses`);

  } catch (error) {
    console.error('❌ Error actualizando IPC:', error.message);
    process.exit(1);
  }
}

/**
 * Obtiene la fecha de inicio para consultar (12 meses atrás)
 */
function getStartDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 12);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

updateIPC();
