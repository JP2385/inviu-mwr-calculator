import { useState } from 'react';
import { formatPercentage, formatARS, formatNumber } from '../utils/formatters';
import type { MWRResult } from '../types';
import PortfolioChart from './PortfolioChart';
import FlowsTable from './FlowsTable';
import MEPComparisonCard from './MEPComparisonCard';
import InflacionComparisonCard from './InflacionComparisonCard';
import { generatePDFReport } from '../services/pdfGenerator';

interface MWRResultsProps {
  result: MWRResult;
  onReset: () => void;
}

export default function MWRResults({ result, onReset }: MWRResultsProps) {
  const isPositiveReturn = result.ganancia >= 0;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generatePDFReport(result);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with main metrics */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-xl p-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold">Resultados del Análisis MWR</h2>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Nuevo Cálculo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MWR Anualizado */}
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <div className="text-sm uppercase tracking-wide mb-2 opacity-90">
              MWR Anualizado
            </div>
            <div className="text-5xl font-bold">
              {formatPercentage(result.mwrAnualizado)}
            </div>
            <div className="text-sm mt-2 opacity-75">
              Tasa de retorno ponderada por dinero
            </div>
          </div>

          {/* Retorno Total */}
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <div className="text-sm uppercase tracking-wide mb-2 opacity-90">
              Retorno Total del Período
            </div>
            <div className="text-5xl font-bold">
              {formatPercentage(result.mwrTotal)}
            </div>
            <div className="text-sm mt-2 opacity-75">
              {formatNumber(result.duracionAnios, 2)} años de inversión
            </div>
          </div>

          {/* Ganancia */}
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <div className="text-sm uppercase tracking-wide mb-2 opacity-90">
              Ganancia/Pérdida
            </div>
            <div
              className={`text-5xl font-bold ${
                isPositiveReturn ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {formatARS(result.ganancia)}
            </div>
            <div className="text-sm mt-2 opacity-75">
              {formatPercentage(result.retornoSimple)} retorno simple
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Resumen de Inversión
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Invertido</span>
              <span className="font-bold text-gray-900">
                {formatARS(result.totalInvertido)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Valor Actual</span>
              <span className="font-bold text-gray-900">
                {formatARS(result.valorActual)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Ganancia/Pérdida</span>
              <span
                className={`font-bold ${
                  isPositiveReturn ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatARS(result.ganancia)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Duración</span>
              <span className="font-bold text-gray-900">
                {formatNumber(result.duracionAnios, 2)} años
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Información del Portfolio
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Cantidad de Holdings</span>
              <span className="font-bold text-gray-900">
                {result.portfolio.holdings.length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">TC MEP Actual</span>
              <span className="font-bold text-gray-900">
                ${formatNumber(result.portfolio.mepRate, 2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">TC CCL Actual</span>
              <span className="font-bold text-gray-900">
                ${formatNumber(result.portfolio.cclRate, 2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Flujos de Caja</span>
              <span className="font-bold text-gray-900">
                {result.cashflows.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Comparación de Métricas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">
              MWR vs Retorno Simple
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">MWR Anualizado</div>
                <div className="bg-blue-100 rounded-full h-8 flex items-center px-4">
                  <div className="text-sm font-bold text-blue-800">
                    {formatPercentage(result.mwrAnualizado)}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Retorno Simple</div>
                <div className="bg-gray-100 rounded-full h-8 flex items-center px-4">
                  <div className="text-sm font-bold text-gray-800">
                    {formatPercentage(result.retornoSimple)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-2">
              ¿Por qué usar MWR?
            </div>
            <p className="text-xs text-blue-800">
              El MWR (Money-Weighted Return) considera el timing de tus aportes y
              retiros, dándote una visión más precisa de tu rendimiento real. El
              retorno simple no considera cuándo pusiste o sacaste dinero.
            </p>
          </div>
        </div>
      </div>

      {/* MWR Comparison: ARS vs USD */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          💱 MWR en Pesos vs Dólares
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Comparación del rendimiento calculado en diferentes monedas
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* MWR en Pesos (ARS) */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-semibold text-blue-900 mb-3">Pesos Argentinos (ARS)</h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">MWR Anualizado</p>
                <p className="text-2xl font-bold text-blue-600">{formatPercentage(result.mwrAnualizado)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Retorno Total</p>
                <p className="text-xl font-bold text-blue-600">{formatPercentage(result.mwrTotal)}</p>
              </div>
              <div className="pt-2 border-t border-blue-200">
                <p className="text-xs text-gray-600">Total Invertido</p>
                <p className="font-semibold text-gray-800">{formatARS(result.totalInvertido)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Valor Actual</p>
                <p className="font-semibold text-gray-800">{formatARS(result.valorActual)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Ganancia</p>
                <p className={`font-semibold ${result.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatARS(result.ganancia)}
                </p>
              </div>
            </div>
          </div>

          {/* MWR en Dólares (USD) */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h4 className="font-semibold text-green-900 mb-3">Dólares MEP (USD)</h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">MWR Anualizado</p>
                <p className="text-2xl font-bold text-green-600">{formatPercentage(result.mwrUSD.mwrAnualizadoUSD)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Retorno Total</p>
                <p className="text-xl font-bold text-green-600">{formatPercentage(result.mwrUSD.mwrTotalUSD)}</p>
              </div>
              <div className="pt-2 border-t border-green-200">
                <p className="text-xs text-gray-600">Total Invertido</p>
                <p className="font-semibold text-gray-800">USD {formatNumber(result.mwrUSD.totalInvertidoUSD, 2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Valor Actual</p>
                <p className="font-semibold text-gray-800">USD {formatNumber(result.mwrUSD.valorActualUSD, 2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Ganancia</p>
                <p className={`font-semibold ${result.mwrUSD.gananciaUSD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  USD {formatNumber(result.mwrUSD.gananciaUSD, 2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota explicativa */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-xs text-gray-600">
            ℹ️ <strong>Nota:</strong> El MWR en dólares considera la exposición cambiaria de tu portfolio.
            Cada depósito y retiro se convierte a USD usando la cotización MEP de esa fecha.
            Un MWR USD menor que MWR ARS indica que parte de la ganancia en pesos fue por devaluación.
          </p>
        </div>
      </div>

      {/* MEP Comparison */}
      <MEPComparisonCard result={result} />
 
      {/* Inflation Comparison */}
      {result.inflacionComparison && (
        <InflacionComparisonCard comparison={result.inflacionComparison} />
      )}

      {/* Charts */}
      <PortfolioChart result={result} />

      {/* Flows Table */}
      <FlowsTable cashflows={result.cashflows} />

      {/* Download Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium shadow-md flex items-center gap-2"
        >
          {isGeneratingPDF ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando PDF...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Reporte PDF
            </>
          )}
        </button>
        <button
          onClick={() => {
            // TODO: Implement Excel export
            alert('Función de exportar Excel en desarrollo');
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
        >
          Descargar Excel
        </button>
      </div>
    </div>
  );
}
