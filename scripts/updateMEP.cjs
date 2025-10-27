/**
 * Script para actualizar la cotización del dólar MEP
 * Ejecutar diariamente a las 18:00 UTC-3
 *
 * Uso: node scripts/updateMEP.js
 */

const fs = require('fs');
const path = require('path');

const MEP_DATA_PATH = path.join(__dirname, '..', 'public', 'data', 'mep-historico.json');
const DOLARAPI_URL = 'https://dolarapi.com/v1/dolares/bolsa';

async function updateMEP() {
  try {
    console.log('🚀 Iniciando actualización de MEP...');
    console.log(`📅 ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`);

    // 1. Obtener cotización actual desde DolarAPI
    console.log('\n📊 Consultando DolarAPI...');
    const response = await fetch(DOLARAPI_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Error al consultar DolarAPI`);
    }

    const apiData = await response.json();
    console.log(`✓ MEP actual: $${apiData.venta}`);
    console.log(`   Fecha: ${apiData.fechaActualizacion}`);

    // 2. Leer archivo JSON existente
    console.log('\n📂 Leyendo archivo histórico...');
    let historicalData;

    if (fs.existsSync(MEP_DATA_PATH)) {
      const fileContent = fs.readFileSync(MEP_DATA_PATH, 'utf-8');
      historicalData = JSON.parse(fileContent);
      console.log(`✓ Archivo cargado: ${historicalData.recordCount} registros`);
    } else {
      console.log('⚠️  Archivo no existe, creando nuevo...');
      historicalData = {
        lastUpdate: null,
        recordCount: 0,
        data: {}
      };
    }

    // 3. Agregar nuevo registro
    const dateKey = apiData.fechaActualizacion.split('T')[0]; // YYYY-MM-DD
    const isUpdate = dateKey in historicalData.data;

    historicalData.data[dateKey] = apiData.venta;

    if (!isUpdate) {
      historicalData.recordCount++;
    }

    historicalData.lastUpdate = new Date().toISOString();

    // 4. Guardar archivo actualizado
    console.log('\n💾 Guardando archivo actualizado...');
    const dir = path.dirname(MEP_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(MEP_DATA_PATH, JSON.stringify(historicalData, null, 2), 'utf-8');

    console.log(`✅ Actualización completada`);
    console.log(`   ${isUpdate ? 'Actualizado' : 'Agregado'} registro: ${dateKey} = $${apiData.venta}`);
    console.log(`   Total registros: ${historicalData.recordCount}`);

  } catch (error) {
    console.error('❌ Error actualizando MEP:', error.message);
    process.exit(1);
  }
}

updateMEP();
