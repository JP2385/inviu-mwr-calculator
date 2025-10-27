// Movement from Excel "-movimientos" sheet
export interface Movement {
  Operación: string;
  Concertación: string | Date;
  Liquidación: string | Date;
  Descripción: string;
  Monto: number;
  Cantidad: number;
  Precio: number;
  Moneda: 'ARS' | 'USD' | 'USD.C';
}

// Cash flow for MWR calculation
export interface CashFlow {
  date: Date;
  amount: number; // In ARS
  type: 'deposit' | 'withdrawal';
  description: string;
  mepRate?: number;
  originalAmount?: number;
  originalCurrency?: string;
}

// Holdings from Excel "Sheet1"
export interface Holding {
  ticker: string;
  nombre: string;
  cantidad: number;
  precioActual: number;
  valorTotal: number;
  tipo: 'Moneda' | 'Bonos' | 'Cedear' | 'Fondos';
}

// Portfolio composition
export interface Portfolio {
  holdings: Holding[];
  totalValue: number; // In ARS
  mepRate: number;
  cclRate: number;
  fecha: Date;
}

// MEP comparison result
export interface MEPComparison {
  totalDolaresComprados: number;
  totalDolaresVendidos: number;
  dolaresFinales: number;
  valorFinalARS: number;
  inversionTotalARS: number;
  gananciaARS: number;
  rendimientoTotal: number;
  rendimientoAnualizado: number;
  diferenciaMWR: number;
  ventajaPortfolio: number; // Cuánto más ganaste con el portfolio vs MEP (puede ser negativo)
}

// Inflacion comparison result
export interface InflacionComparison {
  inversionInicial: number; // Total invertido (depósitos - retiros)
  inflacionAcumulada: number; // % de inflación en el período
  valorAjustadoInflacion: number; // Cuánto valdría la inversión ajustada por inflación
  perdidaPoderAdquisitivo: number; // Pérdida en ARS por inflación
  gananciaRealVsInflacion: number; // Ganancia real: portfolio - inflación
  rendimientoRealVsInflacion: number; // % de rendimiento real descontando inflación
  ventajaVsInflacion: number; // Cuánto más ganaste vs solo guardar pesos
  mesesAnalizados: number; // Cantidad de meses con data de inflación
  periodoInicio: string; // YYYY-MM
  periodoFin: string; // YYYY-MM
}

// MWR in USD result
export interface MWRinUSD {
  mwrAnualizadoUSD: number;
  mwrTotalUSD: number;
  totalInvertidoUSD: number;
  valorActualUSD: number;
  gananciaUSD: number;
  retornoSimpleUSD: number;
}

// MWR calculation result
export interface MWRResult {
  mwrAnualizado: number;
  mwrTotal: number;
  duracionAnios: number;
  totalInvertido: number;
  valorActual: number;
  ganancia: number;
  retornoSimple: number;
  cashflows: CashFlow[];
  portfolio: Portfolio;
  mepComparison: MEPComparison;
  inflacionComparison?: InflacionComparison; // Opcional porque puede fallar la API
  mwrUSD: MWRinUSD; // MWR calculado en dólares
}

// Chart data point
export interface ChartDataPoint {
  date: string;
  value: number; // In ARS
  valueUSD: number; // In USD
  mepRate: number; // MEP rate for that date
  deposits?: number;
}

// MEP historical quote
export interface MEPQuote {
  fecha: Date;
  valor: number;
}

// File upload state
export interface FileUploadState {
  movimientos: File | null;
  tenencias: File | null;
}

// Processing state
export interface ProcessingState {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  error: string | null;
}
