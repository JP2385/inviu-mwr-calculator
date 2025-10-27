import type { InflacionComparison } from '../types';
import { formatARS, formatPercentage } from '../utils/formatters';

interface InflacionComparisonCardProps {
  comparison: InflacionComparison;
}

export default function InflacionComparisonCard({ comparison }: InflacionComparisonCardProps) {
  const gananciaPositiva = comparison.gananciaRealVsInflacion >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        💸 Comparación vs Inflación
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Período analizado: {comparison.periodoInicio} a {comparison.periodoFin} ({comparison.mesesAnalizados} meses)
      </p>

      <div className="space-y-4">
        {/* Inflación Acumulada */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Inflación Acumulada del Período</span>
            <span className="text-lg font-bold text-red-600">
              {formatPercentage(comparison.inflacionAcumulada)}
            </span>
          </div>
        </div>

        {/* Pérdida de Poder Adquisitivo */}
        <div className="bg-orange-50 p-4 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Si hubieras guardado los pesos sin invertir
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Inversión inicial</p>
              <p className="font-bold text-gray-800">{formatARS(comparison.inversionInicial)}</p>
            </div>
            <div>
              <p className="text-gray-600">Valor ajustado (hoy)</p>
              <p className="font-bold text-gray-800">{formatARS(comparison.valorAjustadoInflacion)}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-orange-200">
            <p className="text-xs text-gray-600">Pérdida de poder adquisitivo</p>
            <p className="font-bold text-red-600">{formatARS(comparison.perdidaPoderAdquisitivo)}</p>
          </div>
        </div>

        {/* Rendimiento Real */}
        <div className={`${gananciaPositiva ? 'bg-green-50' : 'bg-red-50'} p-4 rounded`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Tu Portfolio</span>
            <span className={`text-lg font-bold ${gananciaPositiva ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(comparison.rendimientoRealVsInflacion)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-1">Rendimiento Real (descontando inflación)</p>
          <p className={`text-2xl font-bold ${gananciaPositiva ? 'text-green-600' : 'text-red-600'}`}>
            {formatARS(comparison.gananciaRealVsInflacion)}
          </p>
        </div>

        {/* Ventaja vs Guardar Pesos */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {gananciaPositiva
                  ? '✓ Le ganaste a la inflación'
                  : '✗ No le ganaste a la inflación'}
              </p>
              <p className="text-xs text-gray-600">
                {gananciaPositiva
                  ? 'Tu portfolio generó más valor que la pérdida de poder adquisitivo'
                  : 'Tu portfolio no compensó la pérdida de poder adquisitivo'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Diferencia</p>
              <p className={`text-xl font-bold ${gananciaPositiva ? 'text-green-600' : 'text-red-600'}`}>
                {formatARS(comparison.gananciaRealVsInflacion)}
              </p>
            </div>
          </div>
        </div>

        {/* Nota sobre delay */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-xs text-gray-600">
            ℹ️ <strong>Nota:</strong> Los datos del último mes de inflación no están disponibles (INDEC los publica con 1 mes de delay).
            Se utilizan datos hasta {comparison.periodoFin}.
          </p>
        </div>
      </div>
    </div>
  );
}
