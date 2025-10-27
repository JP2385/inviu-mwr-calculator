/**
 * Script para convertir Mep_historico.xlsx a mep-historico.json
 * Se ejecuta una sola vez para crear el archivo inicial
 *
 * Uso: node scripts/convertMepToJson.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Parse fecha en español a Date
 * Formato: "Miércoles, 22 de octubre del 2025"
 */
function parseSpanishDate(dateStr) {
  try {
    const monthMap = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };

    const pattern = /(\d+)\s+de\s+(\w+)\s+del?\s+(\d{4})/;
    const match = dateStr.match(pattern);

    if (!match) return null;

    const day = parseInt(match[1]);
    const monthStr = match[2].toLowerCase();
    const year = parseInt(match[3]);

    const month = monthMap[monthStr];
    if (month === undefined) return null;

    return new Date(year, month, day);
  } catch (error) {
    console.warn('Error parsing date:', dateStr, error);
    return null;
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function convertExcelToJson() {
  const inputPath = path.join(process.cwd(), 'public', 'Mep_historico.xlsx');
  const outputPath = path.join(process.cwd(), 'public', 'data', 'mep-historico.json');

  console.log('📊 Convirtiendo MEP Excel a JSON...');
  console.log(`   Entrada: ${inputPath}`);
  console.log(`   Salida: ${outputPath}`);

  // Leer el archivo Excel
  const workbook = XLSX.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const data = {};
  let recordCount = 0;

  // Procesar pares de filas: fecha, valor, fecha, valor...
  for (let i = 0; i < rows.length - 1; i += 2) {
    const dateRow = rows[i];
    const valueRow = rows[i + 1];

    if (!dateRow || !valueRow) continue;

    const dateStr = dateRow[0];
    const value = parseFloat(valueRow[0]);

    if (!dateStr || isNaN(value)) continue;

    const date = parseSpanishDate(String(dateStr));
    if (!date) {
      console.warn('No se pudo parsear fecha:', dateStr);
      continue;
    }

    const dateKey = formatDate(date);
    data[dateKey] = value;
    recordCount++;
  }

  // Crear directorio si no existe
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Guardar JSON con metadata
  const output = {
    lastUpdate: new Date().toISOString(),
    recordCount,
    data
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✅ Conversión completada: ${recordCount} registros guardados`);
  console.log(`   Primer registro: ${Object.keys(data).sort()[0]}`);
  console.log(`   Último registro: ${Object.keys(data).sort().pop()}`);
}

convertExcelToJson().catch(console.error);
