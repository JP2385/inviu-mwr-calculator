import { formatPercentage, formatARS } from '../utils/formatters';
import type { MEPComparison, MWRResult } from '../types';

interface MEPComparisonCardProps {
  result: MWRResult;
}

export default function MEPComparisonCard({ result }: MEPComparisonCardProps) {
  const { mepComparison, mwrAnualizado, ganancia } = result;
  const portfolioGanoMas = mepComparison.ventajaPortfolio > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Portfolio vs Comprar Dólar MEP
        </h3>
        {portfolioGanoMas ? (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            Portfolio ganó
          </span>
        ) : (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            MEP ganó
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Simulación: ¿Qué hubiera pasado si hubieras comprado dólar MEP en cada depósito
        y vendido en cada retiro, en lugar de invertir en tu portfolio?
      </p>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Portfolio Column */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="text-sm font-semibold text-blue-900 mb-3">
            Tu Portfolio Inviu
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Rendimiento Anual:</span>
              <span className="font-bold text-blue-900">
                {formatPercentage(mwrAnualizado)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Valor Final:</span>
              <span className="font-bold text-blue-900">
                {formatARS(result.valorActual)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Ganancia:</span>
              <span className={`font-bold ${ganancia >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatARS(ganancia)}
              </span>
            </div>
          </div>
        </div>

        {/* MEP Column */}
        <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
          <div className="text-sm font-semibold text-amber-900 mb-3">
            Solo Comprar Dólar MEP
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Rendimiento Anual:</span>
              <span className="font-bold text-amber-900">
                {formatPercentage(mepComparison.rendimientoAnualizado)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Valor Final:</span>
              <span className="font-bold text-amber-900">
                {formatARS(mepComparison.valorFinalARS)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Ganancia:</span>
              <span className={`font-bold ${mepComparison.gananciaARS >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatARS(mepComparison.gananciaARS)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Difference Highlight */}
      <div className={`rounded-lg p-4 ${
        portfolioGanoMas ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: portfolioGanoMas ? '#166534' : '#991b1b' }}>
              Diferencia de Rendimiento
            </div>
            <div className="text-xs" style={{ color: portfolioGanoMas ? '#16a34a' : '#dc2626' }}>
              {portfolioGanoMas
                ? 'Tu portfolio superó al dólar MEP'
                : 'Hubieras ganado más comprando dólar MEP'}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${portfolioGanoMas ? 'text-green-700' : 'text-red-700'}`}>
              {portfolioGanoMas ? '+' : ''}{formatPercentage(mepComparison.diferenciaMWR)}
            </div>
            <div className={`text-lg font-semibold ${portfolioGanoMas ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioGanoMas ? '+' : ''}{formatARS(mepComparison.ventajaPortfolio)}
            </div>
          </div>
        </div>
      </div>

      {/* MEP Details */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Detalles de la simulación MEP
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Dólares comprados</div>
            <div className="font-semibold text-gray-900">
              USD {mepComparison.totalDolaresComprados.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Dólares vendidos</div>
            <div className="font-semibold text-gray-900">
              USD {mepComparison.totalDolaresVendidos.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Dólares finales</div>
            <div className="font-semibold text-green-700">
              USD {mepComparison.dolaresFinales.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">MEP actual</div>
            <div className="font-semibold text-gray-900">
              ${result.portfolio.mepRate.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <div className="text-blue-600 font-bold text-lg">ℹ️</div>
          <div className="text-xs text-blue-800">
            <strong>Nota:</strong> Esta comparación asume que hubieras comprado dólares MEP en cada depósito
            usando la cotización histórica de ese día, y vendido al MEP del día en cada retiro.
            Tu portfolio diversificado puede tener mayor o menor riesgo que simplemente comprar dólares.
          </div>
        </div>
      </div>
    </div>
  );
}
