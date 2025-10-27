import { differenceInDays, parseISO, format, isValid } from 'date-fns';

/**
 * Parse date from Excel (can be serial number or string)
 */
export function parseExcelDate(value: any): Date | null {
  if (!value) return null;

  // If it's already a Date
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }

  // If it's a number (Excel serial date)
  if (typeof value === 'number') {
    // Excel dates start from 1900-01-01
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = value - 2; // Excel has a bug with 1900 being a leap year
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    return isValid(date) ? date : null;
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    // Try ISO format first
    let date = parseISO(value);
    if (isValid(date)) return date;

    // Try standard Date constructor
    date = new Date(value);
    if (isValid(date)) return date;
  }

  return null;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  return differenceInDays(date2, date1);
}

/**
 * Calculate years between two dates
 */
export function yearsBetween(date1: Date, date2: Date): number {
  return daysBetween(date1, date2) / 365;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}

/**
 * Format date for chart axis (short)
 */
export function formatDateShort(date: Date): string {
  return format(date, 'MM/yy');
}

/**
 * Get date key for MEP cache (YYYY-MM-DD)
 */
export function getDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
