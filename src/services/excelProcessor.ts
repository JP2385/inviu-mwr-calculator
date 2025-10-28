import * as XLSX from 'xlsx';
import { parseExcelDate } from '../utils/dateUtils';
import { getMEPHistoricalData, getMEPForDate } from './mepHistoricalScraper';
import type { Movement, CashFlow, Portfolio, Holding } from '../types';

/**
 * Process Movimientos Excel file to extract cashflows
 */
export async function processMovimientos(file: File): Promise<CashFlow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('No se pudo leer el archivo');
        }

        const workbook = XLSX.read(data, { type: 'binary' });

        // Look for the "-movimientos" sheet
        const sheetName = workbook.SheetNames.find(name =>
          name.toLowerCase().includes('movimientos')
        );

        if (!sheetName) {
          throw new Error('No se encontró la hoja "-movimientos" en el archivo');
        }

        const sheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          throw new Error('La hoja de movimientos está vacía');
        }

        // Filter and process cashflows
        const movements: Movement[] = [];

        for (const row of jsonData) {
          // Check if it's a deposit or withdrawal USING THE OPERACIÓN COLUMN
          // Only count external money movements (Depósito/Retiro)
          // Exclude internal operations: Amortización, Caución, Compra, Venta, Dividendos, Rentas, etc.
          const operacion = (row.Operación || row.Operacion || '').toString().trim().toLowerCase();
          const descripcion = row.Descripción || row.Descripcion || '';

          const isDeposit = operacion === 'depósito' || operacion === 'deposito';
          const isWithdrawal = operacion === 'retiro';

          if (!isDeposit && !isWithdrawal) {
            continue; // Skip internal operations (dividends, rents, buys, sells, etc.)
          }

          // Parse the liquidation date (this is the one we use)
          const liquidacion = row.Liquidación || row.Liquidacion;
          const date = parseExcelDate(liquidacion);

          if (!date) {
            continue;
          }

          // Get amount and currency
          const monto = parseFloat(row.Monto);
          const moneda = row.Moneda || 'ARS';

          if (isNaN(monto)) {
            continue;
          }

          movements.push({
            Operación: row.Operación || row.Operacion || '',
            Concertación: row.Concertación || row.Concertacion || '',
            Liquidación: date,
            Descripción: descripcion,
            Monto: monto,
            Cantidad: parseFloat(row.Cantidad) || 0,
            Precio: parseFloat(row.Precio) || 0,
            Moneda: moneda as any,
          });
        }

        if (movements.length === 0) {
          throw new Error('No se encontraron depósitos ni retiros en el archivo');
        }

        // Determinar el rango de fechas para obtener datos históricos de MEP
        const allDates = movements.map(m => m.Liquidación as Date);
        const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...allDates.map(d => d.getTime())));

        // Obtener todas las cotizaciones históricas del período completo
        const mepHistoricalData = await getMEPHistoricalData(startDate, endDate);

        // Convert movements to cashflows with ARS amounts
        const cashflows: CashFlow[] = movements.map(movement => {
          const date = movement.Liquidación as Date;
          const mepRate = getMEPForDate(date, mepHistoricalData) || 1;

          let amountARS = movement.Monto;

          // Convert USD to ARS using MEP rate
          if (movement.Moneda === 'USD' || movement.Moneda === 'USD.C') {
            amountARS = movement.Monto * mepRate;
          }

          // Determine type from Operación column (already filtered to only Depósito/Retiro)
          const operacion = movement.Operación.toString().trim().toLowerCase();
          const isDeposit = operacion === 'depósito' || operacion === 'deposito';

          return {
            date,
            amount: Math.abs(amountARS),
            type: isDeposit ? 'deposit' : 'withdrawal',
            description: movement.Descripción,
            mepRate: mepRate, // Siempre guardar MEP rate para gráficos y comparación
            originalAmount: movement.Monto,
            originalCurrency: movement.Moneda,
          };
        });

        resolve(cashflows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Process Tenencias Excel file to extract portfolio holdings
 */
export async function processTenencias(file: File): Promise<Portfolio> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('No se pudo leer el archivo');
        }

        const workbook = XLSX.read(data, { type: 'binary', raw: true });

        // Get the first sheet (usually "Sheet1")
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Extract MEP and CCL rates from specific cells
        // Row 4, Column 2 (B4): TC USD MEP
        // Row 5, Column 2 (B5): TC USD CCL
        const mepCell = sheet['B4'];
        const cclCell = sheet['B5'];

        const mepRate = mepCell ? parseFloat(mepCell.v) : 0;
        const cclRate = cclCell ? parseFloat(cclCell.v) : 0;

        if (mepRate === 0) {
          throw new Error('No se pudo leer el tipo de cambio MEP del archivo. Verifica que la celda B4 contenga el valor del MEP.');
        }

        // Read valuation date from cell B3 (Fecha de valuación)
        const fechaCell = sheet['B3'];
        let fechaValuacion: Date = new Date(); // Default to today if not found

        if (fechaCell) {
          const fechaValue = fechaCell.v;

          // Try to parse the date
          if (typeof fechaValue === 'number') {
            // Excel serial date
            fechaValuacion = parseExcelDate(fechaValue) || new Date();
          } else if (typeof fechaValue === 'string') {
            // String format like "27/10/2025" or "2025-10-27"
            fechaValuacion = parseExcelDate(fechaValue) || new Date();
          } else if (fechaValue instanceof Date) {
            fechaValuacion = fechaValue;
          }

        }

        // Convert sheet to JSON starting from row 1
        // This will include all rows with their proper __EMPTY column names
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

        const holdings: Holding[] = [];
        let currentTipo: 'Moneda' | 'Bonos' | 'Cedear' | 'Fondos' = 'Moneda';

        for (const row of jsonData) {
          // Check if this row indicates a new asset type
          const firstCol = row['__EMPTY'] || '';

          if (typeof firstCol === 'string') {
            if (firstCol.includes('Tipo de Activo: Moneda')) {
              currentTipo = 'Moneda';
              continue;
            } else if (firstCol.includes('Tipo de Activo: Bonos')) {
              currentTipo = 'Bonos';
              continue;
            } else if (firstCol.includes('Tipo de Activo: Cedear')) {
              currentTipo = 'Cedear';
              continue;
            } else if (firstCol.includes('Tipo de Activo: Fondos')) {
              currentTipo = 'Fondos';
              continue;
            }
          }

          // Extract holding data using the __EMPTY column names
          const ticker = row['__EMPTY'] || '';
          const nombre = row['__EMPTY_1'] || '';
          const disponibles = parseFloat(row['__EMPTY_4']) || 0;
          const precioActual = parseFloat(row['__EMPTY_6']) || 0;

          // Skip empty rows, header rows, or rows without ticker
          if (!ticker || ticker === 'Ticker' || ticker.includes('Tipo de Activo') || disponibles === 0) {
            continue;
          }

          // Calculate total value
          let valorTotal = disponibles * precioActual;

          // For USD holdings, convert to ARS (disponibles is already the amount)
          if (currentTipo === 'Moneda' && ticker === 'USD') {
            valorTotal = disponibles * mepRate;
          }

          // For USD.C holdings, convert to ARS using CCL
          if (currentTipo === 'Moneda' && ticker === 'USD.C') {
            valorTotal = disponibles * cclRate;
          }

          holdings.push({
            ticker,
            nombre: nombre || ticker,
            cantidad: disponibles,
            precioActual,
            valorTotal,
            tipo: currentTipo,
          });
        }

        if (holdings.length === 0) {
          throw new Error('No se encontraron tenencias en el archivo');
        }

        // Calculate total portfolio value
        const totalValue = holdings.reduce((sum, h) => sum + h.valorTotal, 0);

        const portfolio: Portfolio = {
          holdings,
          totalValue,
          mepRate,
          cclRate,
          fecha: fechaValuacion,
        };

        resolve(portfolio);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Validate Excel file before processing
 */
export function validateExcelFile(file: File): { valid: boolean; error?: string } {
  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !['xlsx', 'xls'].includes(ext)) {
    return {
      valid: false,
      error: 'El archivo debe ser un Excel (.xlsx o .xls)',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande (máximo 10MB)',
    };
  }

  return { valid: true };
}
